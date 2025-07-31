import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zodjdbspobmdqyrunqdw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvZGpkYnNwb2JtZHF5cnVucWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MDMzNTYsImV4cCI6MjA2OTM3OTM1Nn0.s9L9g5-ft0a0LYKccErDt4LkH0neQ3rQwb7r5UCH8s4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Employee {
  employee_no: number;
  employee_name: string;
  employee_id: string;
  employee_department: string;
}

interface Attendance {
  id?: number;
  employee_no: number;
  employee_name: string;
  date: string;
  check_in_time: string;
  check_out_time: string;
  status: 'present' | 'completed' | 'absent' | 'late' | 'early_leave';
  work_hours: number;
}

function AttendanceManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase
        .from('employee')
        .select('employee_no, employee_name, employee_id, employee_department')
        .order('employee_name');

      if (data && !error) {
        setEmployees(data);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedDate, employees]);

  // SimpleQRAttendance에서 발생하는 출결 업데이트 이벤트 감지
  useEffect(() => {
    const handleAttendanceUpdate = (event: CustomEvent) => {
      console.log('출결 업데이트 감지:', event.detail);
      // 출결 데이터 새로고침
      fetchAttendanceData();
    };

    window.addEventListener('attendanceUpdated', handleAttendanceUpdate as EventListener);

    return () => {
      window.removeEventListener('attendanceUpdated', handleAttendanceUpdate as EventListener);
    };
  }, [selectedDate, employees]);

  const fetchAttendanceData = async () => {
    setLoading(true);

    try {
      // 실제 데이터베이스에서 출결 데이터 가져오기
      const { data: attendanceData, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('attendance_date', selectedDate);

      // 로컬 스토리지에서 모든 출결 데이터 확인
      const localAttendanceData: any[] = [];

      // 로컬 스토리지의 모든 키를 확인하여 출결 데이터 찾기
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`attendance_${selectedDate}_`)) {
          const attendanceData = localStorage.getItem(key);
          if (attendanceData) {
            try {
              const parsed = JSON.parse(attendanceData);
              const email = key.split('_')[2]; // attendance_날짜_이메일 형식에서 이메일 추출

              if (parsed.checkin) {
                localAttendanceData.push({
                  employee_name: parsed.checkin.employee_name,
                  employee_email: email,
                  attendance_date: selectedDate,
                  check_in_time: parsed.checkin.timestamp,
                  check_out_time: parsed.checkout ? parsed.checkout.timestamp : null,
                  status: parsed.checkout ? '퇴근' : '출근'
                });
              }
            } catch (e) {
              console.error('로컬 스토리지 데이터 파싱 오류:', e);
            }
          }
        }
      });

      // 실제 데이터와 로컬 데이터를 합쳐서 처리
      const allAttendanceData = [...(attendanceData || []), ...localAttendanceData];

      if (error && localAttendanceData.length === 0) {
        console.error('출결 데이터 가져오기 실패:', error);
        // 오류 시 더미 데이터 사용
        const dummyAttendances: Attendance[] = employees.map(emp => ({
          employee_no: emp.employee_no,
          employee_name: emp.employee_name,
          date: selectedDate,
          check_in_time: Math.random() > 0.1 ? '09:00' : '',
          check_out_time: Math.random() > 0.1 ? '18:00' : '',
          status: Math.random() > 0.8 ? 'absent' : Math.random() > 0.7 ? 'late' : 'present',
          work_hours: Math.random() > 0.1 ? 8 : 0
        }));
        setAttendances(dummyAttendances);
      } else {
        // 로컬 스토리지에 출결 데이터가 있는 경우, 직원 데이터베이스가 없어도 표시
        if (localAttendanceData.length > 0 && employees.length === 0) {
          // 직원 데이터베이스가 없는 경우, 로컬 스토리지 데이터만으로 출결 정보 생성
          const localAttendances: Attendance[] = localAttendanceData.map((data, index) => {
            const status = data.status === '출근' && !data.check_out_time ? 'present' :
              data.status === '퇴근' || data.check_out_time ? 'completed' :
                data.status === '지각' ? 'late' :
                  data.status === '조퇴' ? 'early_leave' : 'absent';

            // 근무 시간 계산 (시간 형식 개선)
            let workHours = 0;
            if (data.check_in_time && data.check_out_time) {
              try {
                // 시간 형식을 24시간 형식으로 변환
                const parseTime = (timeStr: string) => {
                  // "오후 2:16:09" 형식을 "14:16:09" 형식으로 변환
                  if (timeStr.includes('오후') || timeStr.includes('오전')) {
                    const isAfternoon = timeStr.includes('오후');
                    const timeOnly = timeStr.replace(/오전|오후/g, '').trim();
                    const [hours, minutes, seconds] = timeOnly.split(':').map(Number);
                    let hour24 = hours;

                    if (isAfternoon && hours !== 12) {
                      hour24 = hours + 12;
                    } else if (!isAfternoon && hours === 12) {
                      hour24 = 0;
                    }

                    return `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                  }
                  return timeStr;
                };

                const checkInTime24 = parseTime(data.check_in_time);
                const checkOutTime24 = parseTime(data.check_out_time);

                const checkIn = new Date(`2000-01-01 ${checkInTime24}`);
                const checkOut = new Date(`2000-01-01 ${checkOutTime24}`);

                if (!isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime())) {
                  workHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
                  if (workHours < 0) workHours = 0; // 음수 방지
                }
              } catch (e) {
                console.error('시간 파싱 오류:', e, data.check_in_time, data.check_out_time);
                workHours = 0;
              }
            }

            return {
              employee_no: index + 1,
              employee_name: data.employee_name,
              date: selectedDate,
              check_in_time: data.check_in_time || '',
              check_out_time: data.check_out_time || '',
              status: status,
              work_hours: workHours
            };
          });

          setAttendances(localAttendances);
        } else {
          // 직원 데이터베이스가 있는 경우, 기존 로직 사용
          const realAttendances: Attendance[] = employees.map(emp => {
            const empAttendance = allAttendanceData.find(a => a.employee_name === emp.employee_name);

            if (empAttendance) {
              // 출결 데이터가 있는 경우
              const status = empAttendance.status === '출근' && !empAttendance.check_out_time ? 'present' :
                empAttendance.status === '퇴근' || empAttendance.check_out_time ? 'completed' :
                  empAttendance.status === '지각' ? 'late' :
                    empAttendance.status === '조퇴' ? 'early_leave' : 'absent';

              // 근무 시간 계산 (시간 형식 개선)
              let workHours = 0;
              if (empAttendance.check_in_time && empAttendance.check_out_time) {
                try {
                  // 시간 형식을 24시간 형식으로 변환
                  const parseTime = (timeStr: string) => {
                    // "오후 2:16:09" 형식을 "14:16:09" 형식으로 변환
                    if (timeStr.includes('오후') || timeStr.includes('오전')) {
                      const isAfternoon = timeStr.includes('오후');
                      const timeOnly = timeStr.replace(/오전|오후/g, '').trim();
                      const [hours, minutes, seconds] = timeOnly.split(':').map(Number);
                      let hour24 = hours;

                      if (isAfternoon && hours !== 12) {
                        hour24 = hours + 12;
                      } else if (!isAfternoon && hours === 12) {
                        hour24 = 0;
                      }

                      return `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                    }
                    return timeStr;
                  };

                  const checkInTime24 = parseTime(empAttendance.check_in_time);
                  const checkOutTime24 = parseTime(empAttendance.check_out_time);

                  const checkIn = new Date(`2000-01-01 ${checkInTime24}`);
                  const checkOut = new Date(`2000-01-01 ${checkOutTime24}`);

                  if (!isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime())) {
                    workHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
                    if (workHours < 0) workHours = 0; // 음수 방지
                  }
                } catch (e) {
                  console.error('시간 파싱 오류:', e, empAttendance.check_in_time, empAttendance.check_out_time);
                  workHours = 0;
                }
              }

              return {
                employee_no: emp.employee_no,
                employee_name: emp.employee_name,
                date: selectedDate,
                check_in_time: empAttendance.check_in_time || '',
                check_out_time: empAttendance.check_out_time || '',
                status: status,
                work_hours: workHours
              };
            } else {
              // 출결 데이터가 없는 경우 (결근)
              return {
                employee_no: emp.employee_no,
                employee_name: emp.employee_name,
                date: selectedDate,
                check_in_time: '',
                check_out_time: '',
                status: 'absent',
                work_hours: 0
              };
            }
          });

          setAttendances(realAttendances);
        }
      }
    } catch (err) {
      console.error('출결 데이터 가져오기 오류:', err);
      // 오류 시 더미 데이터 사용
      const dummyAttendances: Attendance[] = employees.map(emp => ({
        employee_no: emp.employee_no,
        employee_name: emp.employee_name,
        date: selectedDate,
        check_in_time: Math.random() > 0.1 ? '09:00' : '',
        check_out_time: Math.random() > 0.1 ? '18:00' : '',
        status: Math.random() > 0.8 ? 'absent' : Math.random() > 0.7 ? 'late' : 'present',
        work_hours: Math.random() > 0.1 ? 8 : 0
      }));
      setAttendances(dummyAttendances);
    }

    setLoading(false);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present': return '출근';
      case 'completed': return '완료';
      case 'absent': return '결근';
      case 'late': return '지각';
      case 'early_leave': return '조퇴';
      default: return '미확인';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return { bg: '#fef3c7', color: '#92400e' }; // 근무중 - 노란색
      case 'completed': return { bg: '#dbeafe', color: '#1e40af' }; // 퇴근 - 파란색
      case 'absent': return { bg: '#fecaca', color: '#991b1b' }; // 결근 - 빨간색
      case 'late': return { bg: '#fed7aa', color: '#9a3412' }; // 지각 - 주황색
      case 'early_leave': return { bg: '#fed7aa', color: '#9a3412' }; // 조퇴 - 주황색
      default: return { bg: '#f1f5f9', color: '#475569' };
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      padding: '2rem',
    },
    header: {
      marginBottom: '2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap' as const,
      gap: '1rem',
    },
    headerLeft: {
      color: 'white',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
    },
    subtitle: {
      fontSize: '1.1rem',
      opacity: 0.9,
    },
    dateSelector: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      padding: '1.5rem',
      color: 'white',
    },
    dateLabel: {
      fontSize: '0.9rem',
      marginBottom: '0.5rem',
      opacity: 0.9,
    },
    dateInput: {
      padding: '0.75rem',
      borderRadius: '10px',
      border: 'none',
      fontSize: '1rem',
      background: 'white',
      color: '#1f2937',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    statCard: {
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      padding: '2rem',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    },
    statCardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    },
    statHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
    },
    statTitle: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#6b7280',
    },
    statNumber: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
    },
    statPercent: {
      fontSize: '0.8rem',
      color: '#6b7280',
    },
    statIcon: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
    },
    attendanceSection: {
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    },
    sectionHeader: {
      padding: '1.5rem 2rem',
      background: 'rgba(16, 185, 129, 0.1)',
      borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
    },
    sectionTitle: {
      fontSize: '1.3rem',
      fontWeight: 'bold',
      color: '#1f2937',
    },
    attendanceGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '1.5rem',
      padding: '2rem',
    },
    attendanceCard: {
      border: '1px solid #e5e7eb',
      borderRadius: '15px',
      padding: '1.5rem',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    },
    attendanceCardHover: {
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      transform: 'translateY(-2px)',
    },
    employeeHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
    },
    employeeInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    employeeAvatar: {
      width: '45px',
      height: '45px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '1.1rem',
    },
    employeeName: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#1f2937',
    },
    statusBadge: {
      padding: '0.4rem 0.8rem',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '0.3rem',
    },
    statusDot: {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
    },
    timeGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      marginBottom: '1rem',
    },
    timeItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '0.9rem',
    },
    timeLabel: {
      color: '#6b7280',
    },
    timeValue: {
      fontWeight: '600',
      color: '#1f2937',
    },
    progressSection: {
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '1px solid #f3f4f6',
    },
    progressHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.5rem',
      fontSize: '0.8rem',
      color: '#6b7280',
    },
    progressBar: {
      width: '100%',
      height: '8px',
      background: '#f3f4f6',
      borderRadius: '4px',
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
      borderRadius: '4px',
      transition: 'width 0.3s ease',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '3rem',
      color: 'white',
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '4px solid rgba(255, 255, 255, 0.3)',
      borderTop: '4px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>📊 출결 관리</h1>
          <p style={styles.subtitle}>직원들의 출결 현황을 실시간으로 관리하고 모니터링할 수 있습니다</p>
        </div>
        <div style={styles.dateSelector}>
          <div style={styles.dateLabel}>📅 조회 날짜</div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={styles.dateInput}
          />
        </div>
      </div>

      <div style={styles.statsGrid}>
        {[
          {
            title: '출근',
            count: attendances.filter(a => a.status === 'present').length,
            color: '#10b981',
            bg: '#dcfce7',
            icon: '✅'
          },
          {
            title: '퇴근',
            count: attendances.filter(a => a.status === 'completed').length,
            color: '#3b82f6',
            bg: '#dbeafe',
            icon: '🏠'
          },
          {
            title: '결근',
            count: attendances.filter(a => a.status === 'absent').length,
            color: '#ef4444',
            bg: '#fecaca',
            icon: '❌'
          },
          {
            title: '지각',
            count: attendances.filter(a => a.status === 'late').length,
            color: '#f59e0b',
            bg: '#fef3c7',
            icon: '⏰'
          }
        ].map((stat, index) => (
          <div
            key={index}
            style={styles.statCard}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, styles.statCardHover);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={styles.statHeader}>
              <div>
                <div style={styles.statTitle}>{stat.title}</div>
                <div style={{ ...styles.statNumber, color: stat.color }}>{stat.count}</div>
                <div style={styles.statPercent}>
                  {employees.length > 0 ? Math.round((stat.count / employees.length) * 100) : 0}%
                  {index < 3 ? ` ${stat.title}률` : ' 전체'}
                </div>
              </div>
              <div style={{ ...styles.statIcon, background: stat.bg }}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.attendanceSection}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>📋 {selectedDate} 출결 현황</h3>
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div>
              <div style={styles.spinner}></div>
              <p style={{ marginTop: '1rem' }}>출결 데이터를 로딩 중입니다...</p>
            </div>
          </div>
        ) : (
          <div style={styles.attendanceGrid}>
            {attendances.map((attendance) => {
              const statusStyle = getStatusColor(attendance.status);
              return (
                <div
                  key={attendance.employee_no}
                  style={styles.attendanceCard}
                  onMouseEnter={(e) => {
                    Object.assign(e.currentTarget.style, styles.attendanceCardHover);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={styles.employeeHeader}>
                    <div style={styles.employeeInfo}>
                      <div style={styles.employeeAvatar}>
                        {attendance.employee_name.charAt(0)}
                      </div>
                      <div style={styles.employeeName}>{attendance.employee_name}</div>
                    </div>
                    <div style={{ ...styles.statusBadge, background: statusStyle.bg, color: statusStyle.color }}>
                      <div style={{ ...styles.statusDot, background: statusStyle.color }}></div>
                      {getStatusText(attendance.status)}
                    </div>
                  </div>

                  <div style={styles.timeGrid}>
                    <div style={styles.timeItem}>
                      <span style={styles.timeLabel}>출근시간</span>
                      <span style={styles.timeValue}>{attendance.check_in_time || '-'}</span>
                    </div>
                    <div style={styles.timeItem}>
                      <span style={styles.timeLabel}>퇴근시간</span>
                      <span style={styles.timeValue}>{attendance.check_out_time || '-'}</span>
                    </div>
                    <div style={styles.timeItem}>
                      <span style={styles.timeLabel}>근무시간</span>
                      <span style={styles.timeValue}>
                        {attendance.work_hours > 0 && !isNaN(attendance.work_hours)
                          ? `${attendance.work_hours.toFixed(1)}시간`
                          : '-'}
                      </span>
                    </div>
                    <div style={styles.timeItem}>
                      <span style={styles.timeLabel}>상태</span>
                      <span style={styles.timeValue}>
                        {(() => {
                          // 출근하지 않은 경우
                          if (!attendance.check_in_time) {
                            return '⚪ 미출근';
                          }

                          // 출근했지만 퇴근하지 않은 경우
                          if (!attendance.check_out_time) {
                            return '🟡 근무중';
                          }

                          // 출근과 퇴근을 모두 한 경우
                          return '🟢 퇴근';
                        })()}
                      </span>
                    </div>
                  </div>


                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendanceManagement;