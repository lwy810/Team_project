import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const VITE_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

interface Employee {
  employee_no: number;
  employee_name: string;
  employee_id: string;
  employee_pwd: string;
  employee_email: string;
  employee_department: string;
  employee_phone?: string;
  employee_birth?: string;
  employee_grade?: string;
  employee_created_at?: string;
  employee_renewed_at?: string;
}

function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: supabaseError } = await supabase
          .from('employee')
          .select('*')
          .order('employee_no', { ascending: true });

        if (supabaseError) {
          throw new Error(supabaseError.message);
        }

        if (data) {
          setEmployees(data as Employee[]);
        }
      } catch (err: any) {
        setError(err.message || '데이터를 가져오는 데 실패했습니다.');
        console.error('Error fetching employees:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
    },
    header: {
      marginBottom: '2rem',
      textAlign: 'center' as const,
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '0.5rem',
    },
    subtitle: {
      fontSize: '1.1rem',
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: '1rem',
    },
    statsCard: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      padding: '1.5rem',
      color: 'white',
      display: 'inline-block',
      minWidth: '200px',
    },
    statsNumber: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#4ade80',
    },
    cardsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '1.5rem',
      maxWidth: '1400px',
      margin: '0 auto',
    },
    card: {
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    },
    cardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    },
    cardHeader: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1.5rem',
      color: 'white',
    },
    avatar: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
    },
    employeeName: {
      fontSize: '1.3rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
    },
    department: {
      fontSize: '0.9rem',
      opacity: 0.9,
    },
    cardBody: {
      padding: '1.5rem',
    },
    infoRow: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '1rem',
      padding: '0.5rem',
      borderRadius: '8px',
      background: '#f8fafc',
    },
    infoIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: '#e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '1rem',
      fontSize: '1.2rem',
    },
    infoContent: {
      flex: 1,
    },
    infoLabel: {
      fontSize: '0.8rem',
      color: '#64748b',
      marginBottom: '0.2rem',
    },
    infoValue: {
      fontSize: '0.9rem',
      fontWeight: '500',
      color: '#1e293b',
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '500',
      background: '#dcfce7',
      color: '#166534',
    },
    statusDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#22c55e',
      marginRight: '0.5rem',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
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
    errorContainer: {
      textAlign: 'center' as const,
      color: 'white',
      padding: '2rem',
    },
    emptyContainer: {
      textAlign: 'center' as const,
      color: 'white',
      padding: '3rem',
    },
    emptyIcon: {
      fontSize: '4rem',
      marginBottom: '1rem',
      opacity: 0.7,
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div>
            <div style={styles.spinner}></div>
            <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>직원 데이터를 로딩 중입니다...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>오류 발생</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

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
        <h1 style={styles.title}>👥 직원 관리</h1>
        <p style={styles.subtitle}>전체 직원 정보를 관리하고 조회할 수 있습니다</p>
        <div style={styles.statsCard}>
          <div style={styles.infoLabel}>총 직원 수</div>
          <div style={styles.statsNumber}>{employees.length}명</div>
        </div>
      </div>

      {employees.length === 0 ? (
        <div style={styles.emptyContainer}>
          <div style={styles.emptyIcon}>👤</div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>등록된 직원이 없습니다</h3>
          <p>새로운 직원을 등록해보세요.</p>
        </div>
      ) : (
        <div style={styles.cardsGrid}>
          {employees.map((employee) => (
            <div
              key={employee.employee_no}
              style={styles.card}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.cardHover);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={styles.cardHeader}>
                <div style={styles.avatar}>
                  {employee.employee_name.charAt(0)}
                </div>
                <div style={styles.employeeName}>{employee.employee_name}</div>
                <div style={styles.department}>{employee.employee_department}</div>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.infoRow}>
                  <div style={styles.infoIcon}>🆔</div>
                  <div style={styles.infoContent}>
                    <div style={styles.infoLabel}>직원 ID</div>
                    <div style={styles.infoValue}>{employee.employee_id}</div>
                  </div>
                </div>

                <div style={styles.infoRow}>
                  <div style={styles.infoIcon}>📧</div>
                  <div style={styles.infoContent}>
                    <div style={styles.infoLabel}>이메일</div>
                    <div style={styles.infoValue}>{employee.employee_email}</div>
                  </div>
                </div>

                <div style={styles.infoRow}>
                  <div style={styles.infoIcon}>📅</div>
                  <div style={styles.infoContent}>
                    <div style={styles.infoLabel}>등록일</div>
                    <div style={styles.infoValue}>
                      {employee.employee_created_at 
                        ? new Date(employee.employee_created_at).toLocaleDateString()
                        : '-'
                      }
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={styles.statusBadge}>
                    <div style={styles.statusDot}></div>
                    활성
                  </div>
                  <button
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    상세보기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EmployeeList;