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

function EmployeeSearch() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 검색 필터 상태
  const [searchName, setSearchName] = useState<string>('');
  const [searchDepartment, setSearchDepartment] = useState<string>('');
  const [searchGrade, setSearchGrade] = useState<string>('');
  const [searchEmail, setSearchEmail] = useState<string>('');
  
  // 부서 및 직급 목록
  const [departments, setDepartments] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);

  // 선택된 직원 상세 정보
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  // 직원 데이터 가져오기
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: supabaseError } = await supabase
          .from('employee')
          .select('*')
          .order('employee_name', { ascending: true });

        if (supabaseError) {
          throw new Error(supabaseError.message);
        }

        if (data) {
          setEmployees(data as Employee[]);
          setFilteredEmployees(data as Employee[]);
          
          // 부서 및 직급 목록 추출
          const uniqueDepartments = [...new Set(data.map(emp => emp.employee_department).filter(Boolean))];
          const uniqueGrades = [...new Set(data.map(emp => emp.employee_grade).filter(Boolean))];
          setDepartments(uniqueDepartments);
          setGrades(uniqueGrades);
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

  // 검색 필터 적용
  useEffect(() => {
    let filtered = employees;

    // 이름으로 필터링
    if (searchName.trim()) {
      filtered = filtered.filter(emp => 
        emp.employee_name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // 부서로 필터링
    if (searchDepartment) {
      filtered = filtered.filter(emp => emp.employee_department === searchDepartment);
    }

    // 직급으로 필터링
    if (searchGrade) {
      filtered = filtered.filter(emp => emp.employee_grade === searchGrade);
    }

    // 이메일로 필터링
    if (searchEmail.trim()) {
      filtered = filtered.filter(emp => 
        emp.employee_email.toLowerCase().includes(searchEmail.toLowerCase())
      );
    }

    setFilteredEmployees(filtered);
  }, [searchName, searchDepartment, searchGrade, searchEmail, employees]);

  // 검색 초기화
  const resetSearch = () => {
    setSearchName('');
    setSearchDepartment('');
    setSearchGrade('');
    setSearchEmail('');
  };

  const openEmployeeModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      padding: '2rem',
    },
    header: {
      marginBottom: '2rem',
      textAlign: 'center' as const,
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
      marginBottom: '2rem',
    },
    searchSection: {
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '25px',
      padding: '2rem',
      marginBottom: '2rem',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
      maxWidth: '1200px',
      margin: '0 auto 2rem',
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '1.5rem',
      textAlign: 'center' as const,
    },
    searchGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '1.5rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
    },
    label: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem',
    },
    input: {
      padding: '0.75rem',
      borderRadius: '10px',
      border: '2px solid #e5e7eb',
      fontSize: '1rem',
      background: 'white',
      color: '#1f2937',
      transition: 'all 0.3s ease',
    },
    inputFocus: {
      borderColor: '#4facfe',
      outline: 'none',
      boxShadow: '0 0 0 3px rgba(79, 172, 254, 0.1)',
    },
    select: {
      padding: '0.75rem',
      borderRadius: '10px',
      border: '2px solid #e5e7eb',
      fontSize: '1rem',
      background: 'white',
      color: '#1f2937',
      transition: 'all 0.3s ease',
    },
    resetButton: {
      padding: '0.75rem 1.5rem',
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      alignSelf: 'flex-end',
    },
    resetButtonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 25px rgba(255, 107, 107, 0.3)',
    },
    statsBar: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      padding: '1rem 2rem',
      marginBottom: '2rem',
      textAlign: 'center' as const,
      color: 'white',
      maxWidth: '1200px',
      margin: '0 auto 2rem',
    },
    statsText: {
      fontSize: '1.1rem',
      fontWeight: '500',
    },
    highlight: {
      color: '#fbbf24',
      fontWeight: 'bold',
    },
    resultsContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
    },
    employeeGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '1.5rem',
    },
    employeeCard: {
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      padding: '1.5rem',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    },
    employeeCardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    },
    employeeHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1rem',
    },
    employeeAvatar: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '1.3rem',
    },
    employeeInfo: {
      flex: 1,
    },
    employeeName: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '0.3rem',
    },
    employeeDept: {
      fontSize: '0.9rem',
      color: '#6b7280',
    },
    employeeDetails: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.75rem',
      marginBottom: '1rem',
    },
    detailItem: {
      display: 'flex',
      flexDirection: 'column' as const,
      padding: '0.75rem',
      background: '#f8fafc',
      borderRadius: '8px',
    },
    detailLabel: {
      fontSize: '0.7rem',
      color: '#6b7280',
      marginBottom: '0.2rem',
      textTransform: 'uppercase' as const,
      fontWeight: '600',
    },
    detailValue: {
      fontSize: '0.9rem',
      color: '#1f2937',
      fontWeight: '500',
    },
    viewButton: {
      width: '100%',
      padding: '0.75rem',
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    viewButtonHover: {
      transform: 'scale(1.02)',
    },
    emptyState: {
      textAlign: 'center' as const,
      padding: '4rem 2rem',
      color: 'white',
    },
    emptyIcon: {
      fontSize: '4rem',
      marginBottom: '1rem',
      opacity: 0.7,
    },
    emptyTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
    },
    emptyText: {
      fontSize: '1rem',
      opacity: 0.8,
    },
    modal: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modalContent: {
      background: 'white',
      borderRadius: '25px',
      padding: '2rem',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '80vh',
      overflowY: 'auto' as const,
    },
    modalHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '2rem',
      paddingBottom: '1rem',
      borderBottom: '2px solid #f3f4f6',
    },
    modalAvatar: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '2rem',
    },
    modalTitle: {
      fontSize: '1.8rem',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '0.3rem',
    },
    modalSubtitle: {
      fontSize: '1rem',
      color: '#6b7280',
    },
    modalGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1.5rem',
    },
    modalDetailItem: {
      padding: '1rem',
      background: '#f8fafc',
      borderRadius: '10px',
      border: '1px solid #e5e7eb',
    },
    modalDetailLabel: {
      fontSize: '0.8rem',
      color: '#6b7280',
      marginBottom: '0.5rem',
      textTransform: 'uppercase' as const,
      fontWeight: '600',
    },
    modalDetailValue: {
      fontSize: '1rem',
      color: '#1f2937',
      fontWeight: '500',
    },
    modalActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '2rem',
      paddingTop: '1rem',
      borderTop: '2px solid #f3f4f6',
    },
    closeButton: {
      padding: '0.75rem 2rem',
      background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
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
  };

  if (loading) {
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
        <h1 style={styles.title}>🔍 직원 검색</h1>
        <p style={styles.subtitle}>다양한 조건으로 직원 정보를 빠르고 정확하게 검색할 수 있습니다</p>
      </div>

      {/* 검색 필터 섹션 */}
      <div style={styles.searchSection}>
        <h2 style={styles.sectionTitle}>🎯 검색 필터</h2>
        <div style={styles.formGroup}>
          <button
            onClick={resetSearch}
            style={styles.resetButton}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, styles.resetButtonHover);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            🔄 초기화
          </button>
        </div>
        <div style={styles.searchGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>직원명</label>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="이름을 입력하세요"
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>부서</label>
            <select
              value={searchDepartment}
              onChange={(e) => setSearchDepartment(e.target.value)}
              style={styles.select}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">전체 부서</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>직급</label>
            <select
              value={searchGrade}
              onChange={(e) => setSearchGrade(e.target.value)}
              style={styles.select}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">전체 직급</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>이메일</label>
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>


        </div>
      </div>

      {/* 검색 결과 요약 */}
      <div style={styles.statsBar}>
        <div style={styles.statsText}>
          총 <span style={styles.highlight}>{employees.length}명</span> 중 
          <span style={styles.highlight}> {filteredEmployees.length}명</span> 검색됨
        </div>
      </div>

      {/* 검색 결과 */}
      <div style={styles.resultsContainer}>
        {filteredEmployees.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔍</div>
            <h3 style={styles.emptyTitle}>검색 결과가 없습니다</h3>
            <p style={styles.emptyText}>검색 조건을 변경해보세요.</p>
          </div>
        ) : (
          <div style={styles.employeeGrid}>
            {filteredEmployees.map((employee) => (
              <div
                key={employee.employee_no}
                style={styles.employeeCard}
                onClick={() => openEmployeeModal(employee)}
                onMouseEnter={(e) => {
                  Object.assign(e.currentTarget.style, styles.employeeCardHover);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={styles.employeeHeader}>
                  <div style={styles.employeeAvatar}>
                    {employee.employee_name.charAt(0)}
                  </div>
                  <div style={styles.employeeInfo}>
                    <div style={styles.employeeName}>{employee.employee_name}</div>
                    <div style={styles.employeeDept}>{employee.employee_department}</div>
                  </div>
                </div>

                <div style={styles.employeeDetails}>
                  <div style={styles.detailItem}>
                    <div style={styles.detailLabel}>직원 ID</div>
                    <div style={styles.detailValue}>{employee.employee_id}</div>
                  </div>
                  <div style={styles.detailItem}>
                    <div style={styles.detailLabel}>직급</div>
                    <div style={styles.detailValue}>{employee.employee_grade || '-'}</div>
                  </div>
                  <div style={styles.detailItem}>
                    <div style={styles.detailLabel}>이메일</div>
                    <div style={styles.detailValue}>{employee.employee_email}</div>
                  </div>
                  <div style={styles.detailItem}>
                    <div style={styles.detailLabel}>등록일</div>
                    <div style={styles.detailValue}>
                      {employee.employee_created_at 
                        ? new Date(employee.employee_created_at).toLocaleDateString()
                        : '-'
                      }
                    </div>
                  </div>
                </div>

                <button
                  style={styles.viewButton}
                  onMouseEnter={(e) => {
                    Object.assign(e.currentTarget.style, styles.viewButtonHover);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  👁️ 상세 정보 보기
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 직원 상세 정보 모달 */}
      {showModal && selectedEmployee && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalAvatar}>
                {selectedEmployee.employee_name.charAt(0)}
              </div>
              <div>
                <h3 style={styles.modalTitle}>{selectedEmployee.employee_name}</h3>
                <p style={styles.modalSubtitle}>{selectedEmployee.employee_department}</p>
              </div>
            </div>

            <div style={styles.modalGrid}>
              <div style={styles.modalDetailItem}>
                <div style={styles.modalDetailLabel}>직원 번호</div>
                <div style={styles.modalDetailValue}>{selectedEmployee.employee_no}</div>
              </div>
              <div style={styles.modalDetailItem}>
                <div style={styles.modalDetailLabel}>직원 ID</div>
                <div style={styles.modalDetailValue}>{selectedEmployee.employee_id}</div>
              </div>
              <div style={styles.modalDetailItem}>
                <div style={styles.modalDetailLabel}>이메일</div>
                <div style={styles.modalDetailValue}>{selectedEmployee.employee_email}</div>
              </div>
              <div style={styles.modalDetailItem}>
                <div style={styles.modalDetailLabel}>전화번호</div>
                <div style={styles.modalDetailValue}>{selectedEmployee.employee_phone || '-'}</div>
              </div>
              <div style={styles.modalDetailItem}>
                <div style={styles.modalDetailLabel}>생년월일</div>
                <div style={styles.modalDetailValue}>{selectedEmployee.employee_birth || '-'}</div>
              </div>
              <div style={styles.modalDetailItem}>
                <div style={styles.modalDetailLabel}>직급</div>
                <div style={styles.modalDetailValue}>{selectedEmployee.employee_grade || '-'}</div>
              </div>
              <div style={styles.modalDetailItem}>
                <div style={styles.modalDetailLabel}>등록일</div>
                <div style={styles.modalDetailValue}>
                  {selectedEmployee.employee_created_at 
                    ? new Date(selectedEmployee.employee_created_at).toLocaleDateString()
                    : '-'
                  }
                </div>
              </div>
              <div style={styles.modalDetailItem}>
                <div style={styles.modalDetailLabel}>수정일</div>
                <div style={styles.modalDetailValue}>
                  {selectedEmployee.employee_renewed_at 
                    ? new Date(selectedEmployee.employee_renewed_at).toLocaleDateString()
                    : '-'
                  }
                </div>
              </div>
            </div>

            <div style={styles.modalActions}>
              <button
                onClick={() => setShowModal(false)}
                style={styles.closeButton}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeSearch;