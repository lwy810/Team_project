
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AttendanceManagement from '../employee/AttendanceManagement' // 출결 관리 컴포넌트 임포트
import EmployeeSearch from '../employee/EmployeeSearch' // 직원 검색 컴포넌트 임포트
import EmployeePermission from '../employee/EmployeePermission'  // 권한 관리 컴포넌트 임포트
import QRAttendance from '../employee/QRAttendance';  // QR 출결 컴포넌트 임포트


function Dashboard() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');

  const goToLoginPage = () => {
    navigate('/login');
  };

  const goToSignupPage = () => {
    navigate('/signup');
  };

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
  };

  return (
    <>
      <div>
        <header>
          <nav>
            <ul className="container">
              <li className="nav_bar">
                <button><span>주문 발주 ERP</span></button>
              </li>
              <li className="login_bar">
                <button onClick={goToLoginPage}><span>로그인</span></button>
                <button onClick={goToSignupPage}><span>회원가입</span></button>
              </li>
            </ul>
          </nav>
        </header>

        <section>
          <div className="side_bar">
            <ul id="main_menu">
              <li>
                <p className="main_menu_title">■ 직원</p>
                <ul className="sub_menu">
                  <li
                    className={activeMenu === 'attendance' ? 'active' : ''}
                    onClick={() => handleMenuClick('attendance')}
                    style={{ cursor: 'pointer' }}
                  >
                    - 출결 관리
                  </li>
                  <li
                    className={activeMenu === 'search' ? 'active' : ''}
                    onClick={() => handleMenuClick('search')}
                    style={{ cursor: 'pointer' }}
                  >
                    - 직원 검색
                  </li>
                  <li
                    className={activeMenu === 'permission' ? 'active' : ''}
                    onClick={() => handleMenuClick('permission')}
                    style={{ cursor: 'pointer' }}
                  >
                    - 권한 관리
                  </li>
                  <li
                    className={activeMenu === 'qr_attendance' ? 'active' : ''}
                    onClick={() => handleMenuClick('qr_attendance')}
                    style={{ cursor: 'pointer' }}
                  >
                    - QR 출결
                  </li>

                </ul>
              </li>
              <li>
                <p className="main_menu_title">■ 재고</p>
                <ul className="sub_menu">
                  <li
                    className={activeMenu === 'inventory' ? 'active' : ''}
                    onClick={() => handleMenuClick('inventory')}
                    style={{ cursor: 'pointer' }}
                  >
                    - 재고 현황
                  </li>
                  <li>- 제품 등록</li>
                  <li>- 입출고 관리</li>
                </ul>
              </li>
              <li>
                <p className="main_menu_title">■ 발주</p>
                <ul className="sub_menu">
                  <li>- 발주 신청</li>
                  <li>- 발주 상태 확인</li>
                </ul>
              </li>
              <li>
                <p className="main_menu_title">■ 대시보드</p>
                <ul className="sub_menu">
                  <li
                    className={activeMenu === 'dashboard' ? 'active' : ''}
                    onClick={() => handleMenuClick('dashboard')}
                    style={{ cursor: 'pointer' }}
                  >
                    - 메인 대시보드
                  </li>
                </ul>
              </li>
            </ul>
          </div>

          <div className="main_board">
            {activeMenu === 'dashboard' && (
              <>
                <h2>Dash Board</h2>
              </>
            )}

            {activeMenu === 'attendance' && (
              <AttendanceManagement />
            )}

            {activeMenu === 'search' && (
              <EmployeeSearch />
            )}

            {activeMenu === 'permission' && (
              <EmployeePermission
                currentUserRole="admin"
                currentUserId={1}
              />
            )}

            {activeMenu === 'inventory' && (
              <InventoryDashboard />
            )}

            {activeMenu === 'qr_attendance' && (
              <QRAttendance 
                currentUser={{
                  employee_id: 1,
                  employee_name: "관리자",
                  employee_department: "IT팀",
                  employee_email: "admin@company.com"
                }}
              />
            )}




          </div>
        </section>
      </div>
    </>
  );
};

export default Dashboard;