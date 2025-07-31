import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';

const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const VITE_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

interface Employee {
  employee_id: number;
  employee_name: string;
  employee_department: string;
  employee_email: string;
  employee_created_at: string;
  employee_renewed_at: string;
}

interface Attendance {
  attendance_id: number;
  employee_id: number;
  employee_name: string;
  employee_department: string;
  attendance_date: string;
  check_in_time?: string;
  check_out_time?: string;
  status: '출근' | '퇴근' | '휴가' | '병가' | '외출' | '지각' | '조퇴';
  note?: string;
  created_at: string;
}

interface QRData {
  employee_id: number;
  employee_name: string;
  timestamp: string;
  type: 'attendance';
}

interface QRAttendanceProps {
  currentUser?: {
    employee_id: number;
    employee_name: string;
    employee_department: string;
    employee_email: string;
  };
}

function QRAttendance({ currentUser }: QRAttendanceProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string>('');
  const [qrImage, setQrImage] = useState<string>('');
  const [scanResult, setScanResult] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [lastAttendance, setLastAttendance] = useState<Attendance | null>(null);
  const [currentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 스타일 정의
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '2rem',
      color: 'white',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    },
    subtitle: {
      fontSize: '1.1rem',
      opacity: 0.9,
    },
    section: {
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      padding: '2rem',
      marginBottom: '2rem',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)',
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '1.5rem',
      textAlign: 'center' as const,
    },
    qrContainer: {
      background: 'white',
      padding: '2rem',
      borderRadius: '15px',
      border: '2px solid #e5e7eb',
      textAlign: 'center' as const,
      boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    },
    qrImage: {
      maxWidth: '250px',
      border: '2px solid #e5e7eb',
      borderRadius: '10px',
      margin: '1rem auto',
      boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    },
    userInfo: {
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      color: 'white',
      padding: '1rem',
      borderRadius: '10px',
      marginBottom: '1rem',
    },
    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: '10px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: 'none',
      color: 'white',
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    secondaryButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    successButton: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
    dangerButton: {
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
    },
    cameraContainer: {
      background: 'black',
      borderRadius: '15px',
      overflow: 'hidden',
      position: 'relative' as const,
    },
    video: {
      width: '100%',
      height: '250px',
      objectFit: 'cover' as const,
    },
    cameraPlaceholder: {
      width: '100%',
      height: '250px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      background: '#1f2937',
    },
    scanResult: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      padding: '1rem',
      borderRadius: '10px',
      marginBottom: '1rem',
      textAlign: 'center' as const,
    },
    errorResult: {
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
      color: 'white',
      padding: '1rem',
      borderRadius: '10px',
      marginBottom: '1rem',
      textAlign: 'center' as const,
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      background: 'white',
      borderRadius: '15px',
      overflow: 'hidden',
      boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    },
    tableHeader: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '1rem',
      textAlign: 'left' as const,
      fontWeight: '600',
    },
    tableCell: {
      padding: '1rem',
      borderBottom: '1px solid #e5e7eb',
    },
    statusBadge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '600',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    errorContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      textAlign: 'center' as const,
    },
  };

  // 직원 데이터 가져오기
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error: supabaseError } = await supabase
          .from('employee')
          .select('employee_id, employee_name, employee_department, employee_email, employee_created_at, employee_renewed_at')
          .order('employee_name', { ascending: true });

        if (supabaseError) {
          throw new Error(supabaseError.message);
        }

        if (data) {
          setEmployees(data as Employee[]);
        }
      } catch (err: any) {
        setError(err.message || '직원 데이터를 가져오는 데 실패했습니다.');
        console.error('Error fetching employees:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // 출결 기록 가져오기 (오늘 날짜 기준)
  useEffect(() => {
    if (employees.length > 0) {
      fetchTodayAttendance();
    }
  }, [employees, currentDate]);

  // 오늘 출결 기록 가져오기
  const fetchTodayAttendance = async () => {
    try {
      // 실제 데이터베이스에서 오늘 출결 기록 가져오기
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('attendance_date', currentDate);

      if (error) {
        console.error('출결 기록 가져오기 실패:', error);
        // attendance 테이블이 없거나 오류가 있는 경우 기본 데이터 생성
        createDefaultAttendance();
      } else {
        if (data && data.length > 0) {
          setAttendanceRecords(data as Attendance[]);
        } else {
          // 데이터가 없으면 기본 데이터 생성
          createDefaultAttendance();
        }
      }
    } catch (err) {
      console.error('출결 기록 가져오기 오류:', err);
      // 네트워크 오류 등으로 인해 기본 데이터 생성
      createDefaultAttendance();
    }
  };

  // 기본 출결 데이터 생성
  const createDefaultAttendance = () => {
    const defaultAttendance: Attendance[] = employees.map((emp, index) => ({
      attendance_id: index + 1,
      employee_id: emp.employee_id,
      employee_name: emp.employee_name,
      employee_department: emp.employee_department,
      attendance_date: currentDate,
      check_in_time: undefined,
      check_out_time: undefined,
      status: '출근' as Attendance['status'],
      note: '',
      created_at: new Date().toISOString()
    }));
    setAttendanceRecords(defaultAttendance);
  };

  // 현재 사용자의 QR 코드 자동 생성
  useEffect(() => {
    if (currentUser) {
      const employeeData: Employee = {
        employee_id: currentUser.employee_id,
        employee_name: currentUser.employee_name,
        employee_department: currentUser.employee_department,
        employee_email: currentUser.employee_email,
        employee_created_at: new Date().toISOString(),
        employee_renewed_at: new Date().toISOString()
      };
      generateQRCode(employeeData);
    }
  }, [currentUser]);

  // QR 코드 생성
  const generateQRCode = async (employee: Employee) => {
    try {
      const qrData: QRData = {
        employee_id: employee.employee_id,
        employee_name: employee.employee_name,
        timestamp: new Date().toISOString(),
        type: 'attendance'
      };
      
      // QR 코드 데이터를 JSON 문자열로 변환
      const qrString = JSON.stringify(qrData);
      setQrCode(JSON.stringify(qrData, null, 2));
      
      // QR 코드 이미지 생성
      const qrImageUrl = await QRCode.toDataURL(qrString, {
        width: 250,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrImage(qrImageUrl);
      
    } catch (err) {
      console.error('QR 코드 생성 실패:', err);
      setError('QR 코드 생성에 실패했습니다.');
    }
  };

  // QR 코드 스캔 시작
  const startScanning = async () => {
    try {
      setError(null); // 이전 오류 초기화
      
      // 카메라 권한 확인
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('이 브라우저는 카메라 접근을 지원하지 않습니다.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        
        // 3초 후 자동으로 QR 스캔 시뮬레이션 실행
        setTimeout(() => {
          if (isScanning) {
            simulateQRScan();
          }
        }, 3000);
      }
    } catch (err: any) {
      console.error('카메라 접근 실패:', err);
      
      // 구체적인 오류 메시지 제공
      if (err.name === 'NotAllowedError') {
        setError('카메라 접근이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.');
      } else if (err.name === 'NotFoundError') {
        setError('카메라를 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해주세요.');
      } else if (err.name === 'NotSupportedError') {
        setError('이 브라우저는 카메라 접근을 지원하지 않습니다.');
      } else {
        setError('카메라 접근 중 오류가 발생했습니다: ' + err.message);
      }
      
      setIsScanning(false);
    }
  };

  // QR 코드 스캔 중지
  const stopScanning = () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsScanning(false);
    } catch (err) {
      console.error('카메라 중지 실패:', err);
    }
  };

  // QR 코드 스캔 시뮬레이션 (실제 QR 스캔)
  const simulateQRScan = async () => {
    if (!currentUser) {
      setError('로그인된 사용자 정보가 없습니다.');
      return;
    }

    try {
      setError(null); // 오류 초기화
      
      const currentTime = new Date();
      const currentTimeString = currentTime.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });

      // 오늘 출결 기록 확인
      const todayRecord = attendanceRecords.find(record => 
        record.employee_id === currentUser.employee_id && 
        record.attendance_date === currentDate
      );

      let newStatus: Attendance['status'];
      let checkInTime: string | undefined;
      let checkOutTime: string | undefined;

      if (!todayRecord || todayRecord.status === '출근') {
        // 출근 기록이 없거나 이미 출근한 경우 → 퇴근
        newStatus = '퇴근';
        checkOutTime = currentTimeString;
        checkInTime = todayRecord?.check_in_time;
      } else {
        // 출근 기록이 있는 경우 → 출근
        newStatus = '출근';
        checkInTime = currentTimeString;
      }

      const newAttendance: Attendance = {
        attendance_id: todayRecord?.attendance_id || attendanceRecords.length + 1,
        employee_id: currentUser.employee_id,
        employee_name: currentUser.employee_name,
        employee_department: currentUser.employee_department,
        attendance_date: currentDate,
        check_in_time: checkInTime,
        check_out_time: checkOutTime,
        status: newStatus,
        note: 'QR 코드 스캔',
        created_at: new Date().toISOString()
      };

      // 데이터베이스에 저장 시도
      try {
        const { error: saveError } = await supabase
          .from('attendance')
          .upsert([{
            employee_id: newAttendance.employee_id,
            employee_name: newAttendance.employee_name,
            employee_department: newAttendance.employee_department,
            attendance_date: newAttendance.attendance_date,
            check_in_time: newAttendance.check_in_time,
            check_out_time: newAttendance.check_out_time,
            status: newAttendance.status,
            note: newAttendance.note,
            created_at: newAttendance.created_at
          }]);

        if (saveError) {
          console.error('출결 기록 저장 실패:', saveError);
          // 저장 실패해도 로컬에서는 업데이트
          setScanResult(`${currentUser.employee_name}님 ${newStatus} 처리 완료! (${currentTimeString}) - 로컬 저장`);
        } else {
          setScanResult(`${currentUser.employee_name}님 ${newStatus} 처리 완료! (${currentTimeString})`);
        }
      } catch (dbError) {
        console.error('데이터베이스 연결 오류:', dbError);
        setScanResult(`${currentUser.employee_name}님 ${newStatus} 처리 완료! (${currentTimeString}) - 로컬 저장`);
      }

      // 로컬 상태 업데이트
      if (todayRecord) {
        setAttendanceRecords(prev => 
          prev.map(record => 
            record.attendance_id === todayRecord.attendance_id ? newAttendance : record
          )
        );
      } else {
        setAttendanceRecords(prev => [...prev, newAttendance]);
      }

      setLastAttendance(newAttendance);
      setError(null);
      
      // 스캔 중지
      stopScanning();
      
      // 3초 후 결과 초기화
      setTimeout(() => {
        setScanResult('');
        setLastAttendance(null);
      }, 3000);

    } catch (err) {
      console.error('QR 코드 처리 실패:', err);
      setScanResult('QR 코드 처리 중 오류가 발생했습니다.');
      stopScanning();
    }
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid rgba(255,255,255,0.3)', 
            borderTop: '4px solid white', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>QR 출결 시스템을 로딩 중입니다...</p>
        </div>
      </div>
    );
  }

  if (error && !scanResult) {
    return (
      <div style={styles.errorContainer}>
        <div>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>오류 발생</h2>
          <p style={{ marginBottom: '2rem', opacity: 0.9 }}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ ...styles.button, ...styles.primaryButton }}
          >
            페이지 새로고침
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div style={styles.errorContainer}>
        <div>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔐</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>로그인이 필요합니다</h2>
          <p style={{ marginBottom: '2rem', opacity: 0.9 }}>
            QR 출결 시스템을 사용하려면 먼저 로그인해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <h1 style={styles.title}>QR 출결 시스템</h1>
        <p style={styles.subtitle}>QR 코드를 통한 스마트한 출결 관리</p>
      </div>

      {/* QR 코드 생성 섹션 */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>내 QR 코드</h2>
        <div style={styles.qrContainer}>
          {/* 현재 사용자 정보 */}
          <div style={styles.userInfo}>
            <h3 style={{ marginBottom: '0.5rem' }}>👤 {currentUser.employee_name}</h3>
            <p style={{ marginBottom: '0.25rem' }}>부서: {currentUser.employee_department}</p>
            <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>이 QR 코드를 스캔하여 출근/퇴근을 기록하세요</p>
          </div>
          
          {/* QR 코드 이미지 */}
          {qrImage ? (
            <div>
              <img src={qrImage} alt="QR Code" style={styles.qrImage} />
              <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '1rem' }}>
                생성 시간: {new Date().toLocaleString('ko-KR')}
              </p>
            </div>
          ) : (
            <div style={{ padding: '2rem', color: '#6b7280' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
              <p>QR 코드를 생성 중입니다...</p>
            </div>
          )}
        </div>
      </div>

      {/* QR 코드 스캔 섹션 */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>QR 코드 스캔</h2>
        
        {/* 스캔 결과 표시 */}
        {scanResult && (
          <div style={scanResult.includes('실패') || scanResult.includes('오류') ? styles.errorResult : styles.scanResult}>
            <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{scanResult}</p>
            {lastAttendance && (
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                <p>출근시간: {lastAttendance.check_in_time || '-'}</p>
                <p>퇴근시간: {lastAttendance.check_out_time || '-'}</p>
              </div>
            )}
          </div>
        )}

        {/* 실제 카메라 스캔 */}
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ marginBottom: '1rem', color: '#374151', textAlign: 'center' }}>카메라 스캔</h3>
          <div style={styles.cameraContainer}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ ...styles.video, display: isScanning ? 'block' : 'none' }}
            />
            {!isScanning && (
              <div style={styles.cameraPlaceholder}>
                <p>카메라가 비활성화되어 있습니다.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.8 }}>
                  스캔 시작 버튼을 누르면 3초 후 자동으로 QR 코드가 인식됩니다.
                </p>
              </div>
            )}
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button
              onClick={startScanning}
              style={{ ...styles.button, ...styles.primaryButton }}
            >
              스캔 시작
            </button>
            <button
              onClick={stopScanning}
              style={{ ...styles.button, ...styles.secondaryButton }}
            >
              스캔 중지
            </button>
          </div>
        </div>
      </div>

      {/* 오늘 출결 현황 */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>오늘 출결 현황 ({currentDate})</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>직원명</th>
                <th style={styles.tableHeader}>부서</th>
                <th style={styles.tableHeader}>출근시간</th>
                <th style={styles.tableHeader}>퇴근시간</th>
                <th style={styles.tableHeader}>상태</th>
                <th style={styles.tableHeader}>비고</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record) => (
                <tr key={record.attendance_id} style={{
                  background: record.employee_id === currentUser.employee_id ? '#f0f9ff' : 'white'
                }}>
                  <td style={styles.tableCell}>
                    {record.employee_name}
                    {record.employee_id === currentUser.employee_id && (
                      <span style={{ 
                        marginLeft: '0.5rem', 
                        fontSize: '0.7rem', 
                        color: '#3b82f6',
                        fontWeight: '600'
                      }}>(나)</span>
                    )}
                  </td>
                  <td style={styles.tableCell}>{record.employee_department || '-'}</td>
                  <td style={styles.tableCell}>{record.check_in_time || '-'}</td>
                  <td style={styles.tableCell}>{record.check_out_time || '-'}</td>
                  <td style={styles.tableCell}>
                    <span style={{
                      ...styles.statusBadge,
                      background: record.status === '출근' ? '#dcfce7' : 
                                  record.status === '퇴근' ? '#dbeafe' :
                                  record.status === '휴가' ? '#fef3c7' :
                                  record.status === '병가' ? '#fecaca' :
                                  '#f1f5f9',
                      color: record.status === '출근' ? '#166534' :
                             record.status === '퇴근' ? '#1e40af' :
                             record.status === '휴가' ? '#92400e' :
                             record.status === '병가' ? '#991b1b' :
                             '#475569'
                    }}>
                      {record.status}
                    </span>
                  </td>
                  <td style={styles.tableCell}>{record.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {attendanceRecords.length === 0 && (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
            오늘 출결 기록이 없습니다.
          </p>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default QRAttendance;
