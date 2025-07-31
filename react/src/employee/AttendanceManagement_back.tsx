import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const VITE_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

interface Employee {
  employee_no: number;
  employee_name: string;
  employee_department: string;
}

interface Attendance {
  id?: number;
  employee_no: number;
  employee_name: string;
  date: string;
  check_in_time: string;
  check_out_time: string;
  status: 'present' | 'absent' | 'late' | 'early_leave';
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

  const fetchAttendanceData = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present': return '출근';
      case 'absent': return '결근';
      case 'late': return '지각';
      case 'early_leave': return '조퇴';
      default: return '미확인';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return { bg: '#dcfce7', color: '#166534' };
      case 'absent': return { bg: '#fecaca', color: '#991b1b' };
      case 'late': return { bg: '#fef3c7', color: '#92400e' };
      case 'early_leave': return { bg: '#fed7aa', color: '#9a3412' };
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
          },
          { 
            title: '총 직원', 
            count: employees.length,
            color: '#3b82f6',
            bg: '#dbeafe',
            icon: '👥'
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
                        {attendance.work_hours > 0 ? `${attendance.work_hours}시간` : '-'}
                      </span>
                    </div>
                    <div style={styles.timeItem}>
                      <span style={styles.timeLabel}>진행률</span>
                      <span style={styles.timeValue}>
                        {Math.round((attendance.work_hours / 8) * 100)}%
                      </span>
                    </div>
                  </div>

                  {attendance.work_hours > 0 && (
                    <div style={styles.progressSection}>
                      <div style={styles.progressHeader}>
                        <span>근무 진행률</span>
                        <span>{Math.round((attendance.work_hours / 8) * 100)}%</span>
                      </div>
                      <div style={styles.progressBar}>
                        <div 
                          style={{
                            ...styles.progressFill,
                            width: `${Math.min((attendance.work_hours / 8) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
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