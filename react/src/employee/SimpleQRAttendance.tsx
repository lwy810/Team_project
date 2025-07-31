import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';

const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const VITE_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Supabase 클라이언트 초기화
const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

interface AttendanceRecord {
  id: number;
  employee_name: string;
  employee_email: string;
  type: 'checkin' | 'checkout';
  timestamp: string;
  date: string;
}

interface SimpleQRAttendanceProps {
  currentUser: {
    employee_name: string;
    employee_email: string;
    employee_department: string;
  };
}

function SimpleQRAttendance({ currentUser }: SimpleQRAttendanceProps) {
  const [qrCode, setQrCode] = useState<string>('');
  const [qrImage, setQrImage] = useState<string>('');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [todayStatus, setTodayStatus] = useState<'none' | 'checkin' | 'checkout'>('none');

  // 오늘 날짜
  const today = new Date().toISOString().split('T')[0];

  // QR 코드 이미지 생성 함수
  const generateQRImage = async (qrData: string) => {
    try {
      const qrImageUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrImage(qrImageUrl);
    } catch (err) {
      console.error('QR 코드 생성 실패:', err);
    }
  };

  // QR 코드 생성 및 오늘의 출결 상태 확인
  useEffect(() => {
    if (currentUser) {
      const qrData = {
        employee_name: currentUser.employee_name,
        employee_email: currentUser.employee_email,
        timestamp: new Date().toISOString()
      };
      const qrString = JSON.stringify(qrData);
      setQrCode(JSON.stringify(qrData, null, 2));
      generateQRImage(qrString);
    }
    checkTodayStatus();
  }, [currentUser]);

  const checkTodayStatus = () => {
    // 오늘 출근했는지 확인 (로컬 스토리지 사용)
    const todayRecords = localStorage.getItem(`attendance_${today}_${currentUser.employee_email}`);
    if (todayRecords) {
      const records = JSON.parse(todayRecords);
      if (records.checkout) {
        setTodayStatus('checkout');
      } else if (records.checkin) {
        setTodayStatus('checkin');
      }
    }
  };

  // 출근 처리
  const handleCheckIn = async () => {
    const now = new Date();
    const record: AttendanceRecord = {
      id: Date.now(),
      employee_name: currentUser.employee_name,
      employee_email: currentUser.employee_email,
      type: 'checkin',
      timestamp: now.toLocaleTimeString('ko-KR'),
      date: today
    };

    try {
      // Supabase에 출근 기록 저장 (더 간단한 형식)
      const { error: supabaseError } = await supabase
        .from('attendance')
        .insert([{
          employee_name: currentUser.employee_name,
          employee_email: currentUser.employee_email,
          attendance_date: today,
          check_in_time: now.toLocaleTimeString('ko-KR'),
          status: '출근'
        }]);

      if (supabaseError) {
        console.error('Supabase 저장 실패:', supabaseError);
      }
    } catch (err) {
      console.error('출근 처리 오류:', err);
    }

    // 출근 처리 완료 알림
    alert(`✅ 출근 처리 완료!\n시간: ${record.timestamp}`);

    // 로컬 스토리지에 저장 (백업용)
    const existingRecords = localStorage.getItem(`attendance_${today}_${currentUser.employee_email}`);
    const todayRecords = existingRecords ? JSON.parse(existingRecords) : {};
    todayRecords.checkin = record;
    localStorage.setItem(`attendance_${today}_${currentUser.employee_email}`, JSON.stringify(todayRecords));

    // 출결관리 시스템에 업데이트 알림
    window.dispatchEvent(new CustomEvent('attendanceUpdated', {
      detail: { type: 'checkin', employee: currentUser, timestamp: record.timestamp }
    }));

    setTodayStatus('checkin');
    loadAttendanceRecords();
  };

  // 퇴근 처리
  const handleCheckOut = async () => {
    if (todayStatus !== 'checkin') {
      alert('❌ 먼저 출근 처리를 해주세요!');
      return;
    }

    const now = new Date();
    const record: AttendanceRecord = {
      id: Date.now(),
      employee_name: currentUser.employee_name,
      employee_email: currentUser.employee_email,
      type: 'checkout',
      timestamp: now.toLocaleTimeString('ko-KR'),
      date: today
    };

    try {
      // Supabase에 퇴근 기록 업데이트 (더 간단한 형식)
      const { error: supabaseError } = await supabase
        .from('attendance')
        .update({
          check_out_time: now.toLocaleTimeString('ko-KR'),
          status: '퇴근'
        })
        .eq('employee_email', currentUser.employee_email)
        .eq('attendance_date', today);

      if (supabaseError) {
        console.error('Supabase 업데이트 실패:', supabaseError);
      }
    } catch (err) {
      console.error('퇴근 처리 오류:', err);
    }

    // 퇴근 처리 완료 알림
    alert(`✅ 퇴근 처리 완료!\n시간: ${record.timestamp}`);

    // 로컬 스토리지에 저장 (백업용)
    const existingRecords = localStorage.getItem(`attendance_${today}_${currentUser.employee_email}`);
    const todayRecords = existingRecords ? JSON.parse(existingRecords) : {};
    todayRecords.checkout = record;
    localStorage.setItem(`attendance_${today}_${currentUser.employee_email}`, JSON.stringify(todayRecords));

    // 출결관리 시스템에 업데이트 알림
    window.dispatchEvent(new CustomEvent('attendanceUpdated', {
      detail: { type: 'checkout', employee: currentUser, timestamp: record.timestamp }
    }));

    setTodayStatus('checkout');
    loadAttendanceRecords();
  };



  // 출결 기록 불러오기
  const loadAttendanceRecords = () => {
    const records: AttendanceRecord[] = [];
    
    // 최근 7일간의 기록 불러오기
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayRecords = localStorage.getItem(`attendance_${dateStr}_${currentUser.employee_email}`);
      if (dayRecords) {
        const parsed = JSON.parse(dayRecords);
        if (parsed.checkin) records.push(parsed.checkin);
        if (parsed.checkout) records.push(parsed.checkout);
      }
    }
    
    setAttendanceRecords(records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  useEffect(() => {
    loadAttendanceRecords();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'none': return '#6b7280';
      case 'checkin': return '#10b981';
      case 'checkout': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'none': return '미출근';
      case 'checkin': return '출근 완료';
      case 'checkout': return '퇴근 완료';
      default: return '미출근';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      padding: '2rem'
    }}>
      {/* 헤더 */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          📱 QR 출퇴근 시스템
        </h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
          {currentUser.employee_name}님의 출퇴근 관리
        </p>
      </div>

      {/* 현재 상태 */}
      <div style={{
        width: '800px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto 2rem'
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '1rem'
        }}>
          {todayStatus === 'none' ? '🏠' : todayStatus === 'checkin' ? '🏢' : '✅'}
        </div>
        <h2 style={{
          color: getStatusColor(todayStatus),
          marginBottom: '1rem'
        }}>
          {getStatusText(todayStatus)}
        </h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          오늘 날짜: {today}
        </p>

        {/* QR 코드 영역 */}
        <div style={{
          background: '#f8fafc',
          padding: '2rem',
          borderRadius: '15px',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>개인 QR 코드</h3>
          
          {/* QR 코드 이미지 */}
          {qrImage ? (
            <div style={{
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
              <img 
                src={qrImage} 
                alt="QR Code" 
                style={{
                  width: '200px',
                  height: '200px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <p style={{ 
                fontSize: '0.8rem', 
                color: '#6b7280', 
                marginTop: '0.5rem' 
              }}>
                이 QR 코드를 스캔하여 출근/퇴근을 기록하세요
              </p>
            </div>
          ) : (
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '10px',
              border: '2px dashed #ccc',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
              <p>QR 코드를 생성 중입니다...</p>
            </div>
          )}
          
          {/* QR 코드 데이터 (개발용) */}
          <details style={{ marginTop: '1rem' }}>
            <summary style={{ 
              cursor: 'pointer', 
              color: '#6b7280', 
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              QR 코드 데이터 보기 (개발용)
            </summary>
            <div style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              color: '#666',
              maxHeight: '150px',
              overflow: 'auto',
              marginTop: '0.5rem'
            }}>
              {qrCode}
            </div>
          </details>
        </div>

        {/* 출퇴근 버튼 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem'
        }}>
          <button
            onClick={handleCheckIn}
            disabled={todayStatus !== 'none'}
            style={{
              padding: '1rem',
              background: todayStatus === 'none' ? '#10b981' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: todayStatus === 'none' ? 'pointer' : 'not-allowed'
            }}
          >
            🌅 출근
          </button>

          <button
            onClick={handleCheckOut}
            disabled={todayStatus !== 'checkin'}
            style={{
              padding: '1rem',
              background: todayStatus === 'checkin' ? '#3b82f6' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: todayStatus === 'checkin' ? 'pointer' : 'not-allowed'
            }}
          >
            🌆 퇴근
          </button>
        </div>
      </div>

      {/* 최근 출결 기록 */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '2rem',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>📊 최근 출결 기록</h3>
        
        {attendanceRecords.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
            아직 출결 기록이 없습니다.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {attendanceRecords.slice(0, 10).map((record) => (
              <div
                key={record.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    {record.type === 'checkin' ? '🌅 출근' : '🌆 퇴근'}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    {record.date}
                  </div>
                </div>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  color: record.type === 'checkin' ? '#10b981' : '#3b82f6'
                }}>
                  {record.timestamp}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SimpleQRAttendance;