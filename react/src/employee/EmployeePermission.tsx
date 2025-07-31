import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const VITE_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

interface Employee {
  employee_no: number;
  employee_name: string;
  employee_department: string;
  employee_email: string;
}

interface Permission {
  employee_no: number;
  employee_name: string;
  role: 'admin' | 'manager' | 'staff' | 'viewer';
  inventory_view: boolean;
  inventory_edit: boolean;
  order_view: boolean;
  order_create: boolean;
  order_approve: boolean;
  stock_in: boolean;
  stock_out: boolean;
  reports_view: boolean;
  user_manage: boolean;
}

const ROLE_PERMISSIONS = {
  admin: {
    inventory_view: true,
    inventory_edit: true,
    order_view: true,
    order_create: true,
    order_approve: true,
    stock_in: true,
    stock_out: true,
    reports_view: true,
    user_manage: true,
  },
  manager: {
    inventory_view: true,
    inventory_edit: true,
    order_view: true,
    order_create: true,
    order_approve: true,
    stock_in: true,
    stock_out: true,
    reports_view: true,
    user_manage: false,
  },
  staff: {
    inventory_view: true,
    inventory_edit: false,
    order_view: true,
    order_create: true,
    order_approve: false,
    stock_in: true,
    stock_out: true,
    reports_view: false,
    user_manage: false,
  },
  viewer: {
    inventory_view: true,
    inventory_edit: false,
    order_view: true,
    order_create: false,
    order_approve: false,
    stock_in: false,
    stock_out: false,
    reports_view: false,
    user_manage: false,
  },
};

interface EmployeePermissionProps {
  currentUserRole: string;
  currentUserId: number;
}

function EmployeePermission({ currentUserRole, currentUserId }: EmployeePermissionProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Permission | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('employee')
          .select('employee_no, employee_name, employee_department, employee_email')
          .order('employee_name');

        if (data && !error) {
          setEmployees(data);
          const dummyPermissions: Permission[] = data.map(emp => ({
            employee_no: emp.employee_no,
            employee_name: emp.employee_name,
            role: emp.employee_department === '관리자' ? 'admin' : 'staff',
            ...ROLE_PERMISSIONS[emp.employee_department === '관리자' ? 'admin' : 'staff']
          }));
          setPermissions(dummyPermissions);
        }
      } catch (err) {
        console.error('Error fetching employees:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return '시스템 관리자';
      case 'manager': return '부서 관리자';
      case 'staff': return '일반 직원';
      case 'viewer': return '조회 전용';
      default: return '미설정';
    }
  };

  // 권한별 접근 제어 함수들
  const canViewEmployee = (employeePermission: Permission): boolean => {
    // 시스템 관리자는 모든 직원 정보 조회 가능
    if (currentUserRole === 'admin') return true;
    
    // 부서 관리자는 같은 부서 직원만 조회 가능
    if (currentUserRole === 'manager') {
      const currentUserDept = employees.find(emp => emp.employee_no === currentUserId)?.employee_department;
      const targetUserDept = employees.find(emp => emp.employee_no === employeePermission.employee_no)?.employee_department;
      return currentUserDept === targetUserDept;
    }
    
    // 일반 직원과 조회 전용은 본인 정보만 조회 가능
    return employeePermission.employee_no === currentUserId;
  };

  const canEditEmployee = (employeePermission: Permission): boolean => {
    // 시스템 관리자는 모든 직원 권한 수정 가능
    if (currentUserRole === 'admin') return true;
    
    // 부서 관리자는 같은 부서 직원의 권한만 수정 가능 (단, 본인보다 높은 권한은 수정 불가)
    if (currentUserRole === 'manager') {
      const currentUserDept = employees.find(emp => emp.employee_no === currentUserId)?.employee_department;
      const targetUserDept = employees.find(emp => emp.employee_no === employeePermission.employee_no)?.employee_department;
      return currentUserDept === targetUserDept && employeePermission.role !== 'admin';
    }
    
    // 일반 직원과 조회 전용은 권한 수정 불가
    return false;
  };

  const canViewRole = (role: string): boolean => {
    // 시스템 관리자는 모든 권한 등급 조회 가능
    if (currentUserRole === 'admin') return true;
    
    // 부서 관리자는 admin 권한 제외하고 조회 가능
    if (currentUserRole === 'manager') return role !== 'admin';
    
    // 일반 직원과 조회 전용은 본인 권한만 조회 가능
    return false;
  };

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'admin': return { bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white' };
      case 'manager': return { bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white' };
      case 'staff': return { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' };
      case 'viewer': return { bg: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)', color: 'white' };
      default: return { bg: '#f1f5f9', color: '#64748b' };
    }
  };

  const handleRoleChange = (employeeNo: number, newRole: 'admin' | 'manager' | 'staff' | 'viewer') => {
    const targetPermission = permissions.find(perm => perm.employee_no === employeeNo);
    
    if (!targetPermission) return;
    
    // 권한 수정 가능 여부 확인
    if (!canEditEmployee(targetPermission)) {
      alert('이 직원의 권한을 수정할 권한이 없습니다.');
      return;
    }
    
    // 권한 등급 변경 제한
    if (currentUserRole === 'manager' && newRole === 'admin') {
      alert('부서 관리자는 시스템 관리자 권한을 부여할 수 없습니다.');
      return;
    }
    
    setPermissions(prev => prev.map(perm => 
      perm.employee_no === employeeNo 
        ? { ...perm, role: newRole, ...ROLE_PERMISSIONS[newRole] }
        : perm
    ));
  };

  const openPermissionModal = (permission: Permission) => {
    // 권한 수정 가능 여부 확인
    if (!canEditEmployee(permission)) {
      alert('이 직원의 권한을 수정할 권한이 없습니다.');
      return;
    }
    
    setSelectedEmployee({ ...permission });
    setShowModal(true);
  };

  const savePermissions = () => {
    if (selectedEmployee) {
      setPermissions(prev => prev.map(perm => 
        perm.employee_no === selectedEmployee.employee_no ? selectedEmployee : perm
      ));
      setShowModal(false);
      setSelectedEmployee(null);
    }
  };

  const updatePermission = (key: keyof Permission, value: boolean) => {
    if (selectedEmployee) {
      setSelectedEmployee(prev => prev ? { ...prev, [key]: value } : null);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
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
    securityBadge: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      padding: '1.5rem',
      color: 'white',
      textAlign: 'center' as const,
    },
    securityLabel: {
      fontSize: '0.9rem',
      opacity: 0.9,
      marginBottom: '0.5rem',
    },
    securityLevel: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#fbbf24',
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
    },
    statTitle: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#6b7280',
      marginBottom: '0.5rem',
    },
    statNumber: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
    },
    statSubtext: {
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
    permissionSection: {
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    },
    sectionHeader: {
      padding: '1.5rem 2rem',
      background: 'rgba(139, 92, 246, 0.1)',
      borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
    },
    sectionTitle: {
      fontSize: '1.3rem',
      fontWeight: 'bold',
      color: '#1f2937',
    },
    permissionGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
      gap: '2rem',
      padding: '2rem',
    },
    permissionCard: {
      border: '1px solid #e5e7eb',
      borderRadius: '20px',
      padding: '2rem',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    },
    permissionCardHover: {
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
      transform: 'translateY(-3px)',
    },
    employeeHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    employeeInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    employeeAvatar: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '1.3rem',
    },
    employeeName: {
      fontSize: '1.3rem',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '0.3rem',
    },
    employeeDept: {
      fontSize: '0.9rem',
      color: '#6b7280',
    },
    roleSelect: {
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      border: 'none',
      fontSize: '0.8rem',
      fontWeight: '500',
      cursor: 'pointer',
    },
    permissionGrid2: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.75rem',
      marginBottom: '1.5rem',
    },
    permissionItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem',
      background: '#f8fafc',
      borderRadius: '10px',
      fontSize: '0.85rem',
    },
    permissionLabel: {
      color: '#374151',
      fontWeight: '500',
    },
    permissionDot: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
    },
    progressSection: {
      marginBottom: '1.5rem',
    },
    progressHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.5rem',
      fontSize: '0.85rem',
      color: '#6b7280',
    },
    progressBar: {
      width: '100%',
      height: '10px',
      background: '#f3f4f6',
      borderRadius: '5px',
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: '5px',
      transition: 'width 0.3s ease',
    },
    actionSection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '1.5rem',
      borderTop: '1px solid #f3f4f6',
    },
    badgeContainer: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap' as const,
    },
    badge: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.3rem',
      padding: '0.3rem 0.6rem',
      borderRadius: '15px',
      fontSize: '0.7rem',
      fontWeight: '500',
    },
    detailButton: {
      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '20px',
      fontSize: '0.9rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
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
      borderRadius: '20px',
      padding: '2rem',
      width: '90%',
      maxWidth: '500px',
      maxHeight: '80vh',
      overflowY: 'auto' as const,
    },
    modalHeader: {
      fontSize: '1.3rem',
      fontWeight: 'bold',
      marginBottom: '1.5rem',
      color: '#1f2937',
    },
    modalPermissionItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      marginBottom: '0.5rem',
      background: '#f8fafc',
      borderRadius: '10px',
    },
    modalActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1rem',
      marginTop: '2rem',
    },
    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: '10px',
      border: 'none',
      fontSize: '0.9rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    cancelButton: {
      background: '#6b7280',
      color: 'white',
    },
    saveButton: {
      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      color: 'white',
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
            <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>권한 데이터를 로딩 중입니다...</p>
          </div>
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
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>🔐 권한 관리</h1>
          <p style={styles.subtitle}>직원들의 시스템 접근 권한을 체계적으로 관리하고 제어할 수 있습니다</p>
          <div style={{ 
            marginTop: '10px', 
            padding: '10px', 
            background: 'rgba(255,255,255,0.1)', 
            borderRadius: '10px',
            fontSize: '14px'
          }}>
            <strong>현재 사용자:</strong> {getRoleText(currentUserRole)} | 
            <strong>접근 가능:</strong> {permissions.filter(p => canViewEmployee(p)).length}명의 직원
          </div>
        </div>
        <div style={styles.securityBadge}>
          <div style={styles.securityLabel}>보안 등급</div>
          <div style={styles.securityLevel}>HIGH</div>
        </div>
      </div>

      <div style={styles.statsGrid}>
        {[
          { 
            title: '시스템 관리자', 
            count: permissions.filter(p => p.role === 'admin').length,
            color: '#ef4444',
            bg: '#fecaca',
            icon: '👑',
            subtext: '최고 권한'
          },
          { 
            title: '부서 관리자', 
            count: permissions.filter(p => p.role === 'manager').length,
            color: '#3b82f6',
            bg: '#dbeafe',
            icon: '🏢',
            subtext: '관리 권한'
          },
          { 
            title: '일반 직원', 
            count: permissions.filter(p => p.role === 'staff').length,
            color: '#10b981',
            bg: '#dcfce7',
            icon: '👤',
            subtext: '기본 권한'
          },
          { 
            title: '조회 전용', 
            count: permissions.filter(p => p.role === 'viewer').length,
            color: '#6b7280',
            bg: '#f1f5f9',
            icon: '👁️',
            subtext: '읽기 전용'
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
                <div style={styles.statSubtext}>{stat.subtext}</div>
              </div>
              <div style={{ ...styles.statIcon, background: stat.bg }}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.permissionSection}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>🔐 직원별 권한 현황</h3>
        </div>

        <div style={styles.permissionGrid}>
          {permissions
            .filter(permission => canViewEmployee(permission)) // 조회 가능한 직원만 필터링
            .map((permission) => {
            const roleStyle = getRoleStyle(permission.role);
            const activePermissions = [
              permission.inventory_view,
              permission.inventory_edit,
              permission.order_view,
              permission.order_create,
              permission.order_approve,
              permission.stock_in,
              permission.stock_out,
              permission.reports_view,
              permission.user_manage
            ].filter(Boolean).length;
            const totalPermissions = 9;
            const progressPercent = (activePermissions / totalPermissions) * 100;

            return (
              <div
                key={permission.employee_no}
                style={styles.permissionCard}
                onMouseEnter={(e) => {
                  Object.assign(e.currentTarget.style, styles.permissionCardHover);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={styles.employeeHeader}>
                  <div style={styles.employeeInfo}>
                    <div style={{ ...styles.employeeAvatar, background: roleStyle.bg }}>
                      {permission.employee_name.charAt(0)}
                    </div>
                    <div>
                      <div style={styles.employeeName}>{permission.employee_name}</div>
                      <div style={styles.employeeDept}>
                        {employees.find(emp => emp.employee_no === permission.employee_no)?.employee_department}
                      </div>
                    </div>
                  </div>
                  <select
                    value={permission.role}
                    onChange={(e) => handleRoleChange(permission.employee_no, e.target.value as any)}
                    style={{ ...styles.roleSelect, background: roleStyle.bg, color: roleStyle.color }}
                    disabled={!canEditEmployee(permission)}
                  >
                    {canViewRole('admin') && <option value="admin">시스템 관리자</option>}
                    {canViewRole('manager') && <option value="manager">부서 관리자</option>}
                    <option value="staff">일반 직원</option>
                    <option value="viewer">조회 전용</option>
                  </select>
                </div>

                <div style={styles.permissionGrid2}>
                  {[
                    { key: 'inventory_view', label: '재고 조회', value: permission.inventory_view },
                    { key: 'inventory_edit', label: '재고 수정', value: permission.inventory_edit },
                    { key: 'order_approve', label: '발주 승인', value: permission.order_approve },
                    { key: 'user_manage', label: '사용자 관리', value: permission.user_manage }
                  ].map((item) => (
                    <div key={item.key} style={styles.permissionItem}>
                      <span style={styles.permissionLabel}>{item.label}</span>
                      <div 
                        style={{
                          ...styles.permissionDot,
                          background: item.value ? '#10b981' : '#ef4444'
                        }}
                      ></div>
                    </div>
                  ))}
                </div>

                <div style={styles.progressSection}>
                  <div style={styles.progressHeader}>
                    <span>권한 활성화율</span>
                    <span>{Math.round(progressPercent)}%</span>
                  </div>
                  <div style={styles.progressBar}>
                    <div 
                      style={{
                        ...styles.progressFill,
                        background: roleStyle.bg,
                        width: `${progressPercent}%`
                      }}
                    ></div>
                  </div>
                </div>

                <div style={styles.actionSection}>
                  <div style={styles.badgeContainer}>
                    {permission.inventory_view && (
                      <div style={{ ...styles.badge, background: '#dbeafe', color: '#1e40af' }}>
                        👁️ 조회
                      </div>
                    )}
                    {permission.order_approve && (
                      <div style={{ ...styles.badge, background: '#dcfce7', color: '#166534' }}>
                        ✅ 승인
                      </div>
                    )}
                    {permission.user_manage && (
                      <div style={{ ...styles.badge, background: '#fce7f3', color: '#be185d' }}>
                        ⚙️ 관리
                      </div>
                    )}
                  </div>
                  
                  {canEditEmployee(permission) && (
                    <button
                      onClick={() => openPermissionModal(permission)}
                      style={styles.detailButton}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      상세 설정
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 권한 상세 설정 모달 */}
      {showModal && selectedEmployee && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalHeader}>{selectedEmployee.employee_name} 권한 설정</h3>
            
            <div>
              {[
                { key: 'inventory_view', label: '재고 조회' },
                { key: 'inventory_edit', label: '재고 수정' },
                { key: 'order_view', label: '발주 조회' },
                { key: 'order_create', label: '발주 생성' },
                { key: 'order_approve', label: '발주 승인' },
                { key: 'stock_in', label: '입고 처리' },
                { key: 'stock_out', label: '출고 처리' },
                { key: 'reports_view', label: '보고서 조회' },
                { key: 'user_manage', label: '사용자 관리' }
              ].map((item) => (
                <div key={item.key} style={styles.modalPermissionItem}>
                  <span>{item.label}</span>
                  <input
                    type="checkbox"
                    checked={selectedEmployee[item.key as keyof Permission] as boolean}
                    onChange={(e) => updatePermission(item.key as keyof Permission, e.target.checked)}
                    style={{ transform: 'scale(1.2)' }}
                  />
                </div>
              ))}
            </div>

            <div style={styles.modalActions}>
              <button
                onClick={() => setShowModal(false)}
                style={{ ...styles.button, ...styles.cancelButton }}
              >
                취소
              </button>
              <button
                onClick={savePermissions}
                style={{ ...styles.button, ...styles.saveButton }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeePermission;