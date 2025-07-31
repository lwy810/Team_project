
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import '../App.css'
import { useAuth } from '../contexts/AuthContext'; // useAuth 훅 임포트
import { useEffect } from 'react'; // 초기 로그인 상태를 로컬 스토리지에서 확인하기 위해 사용
import AttendanceManagement from '../employee/AttendanceManagement' // 출결 관리 컴포넌트 임포트
import EmployeeSearch from '../employee/EmployeeSearch' // 직원 검색 컴포넌트 임포트
import EmployeePermission from '../employee/EmployeePermission'  // 권한 관리 컴포넌트 임포트
import QRAttendance from '../employee/QRAttendance';  // QR 출결 컴포넌트 임포트
import InventoryDashboard from '../employee/InventoryDashboard';  // 메인 대시보드 컴포넌트 임포트
import InventoryList from '../inventory/InventoryList' // 재고 현황 컴포넌트 임포트
import ProductRegister from '../inventory/ProductRegister' // 제품 등록 컴포넌트 임포트
import Orders from '../orders/Orders' // 제품 등록 컴포넌트 임포트

function Dashboard() {
  const navigate = useNavigate();
  const { isLoggedIn, logout, currentUser  } = useAuth(); // AuthContext에서 상태 및 함수 가져오기

  // 컴포넌트 마운트 시 로컬 스토리지에서 로그인 상태 확인 (새로고침 시 상태 유지)
  useEffect(() => {
    const storedLoginStatus = localStorage.getItem('isLoggedIn');
    console.log("Dashboard useEffect: storedLoginStatus =", storedLoginStatus, ", current isLoggedIn =", isLoggedIn); // <-- 추가
    if ( !isLoggedIn ) {
      navigate('/')
    }
  }, [isLoggedIn, navigate]); // isLoggedIn, login이 변경될 때만 실행
  
  const handleLogout = () => {
    logout(); // <--- 로그아웃 시 Context의 logout 함수 호출
    navigate('/'); // 로그아웃 후 로그인 페이지로 이동
  };

  const goToMyPage = () => {
    // 마이페이지로 이동하는 로직
    console.log('마이페이지로 이동');
    if (currentUser) {
      console.log('현재 로그인 사용자 :', currentUser.employee_name, "|", '파트 :', currentUser.employee_department);
      // 예: navigate(`/mypage/${currentUser.employee_id}`);
      // navigate('/mypage'); // 실제 마이페이지 라우트가 있다면 주석 해제
    };
  }

  const [activeMenu, setActiveMenu] = useState<string>('dashboard');

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
  };

  // --- ProductRegister를 위한 콜백 함수들 추가 ---
  // ProductRegister에서 '뒤로가기' 버튼 클릭 시 호출될 함수
  const handleBackFromProductRegister = () => {
    setActiveMenu('dashboard'); // 메인 대시보드 화면으로 돌아가기 (또는 'inventory_list')
    console.log('제품 등록 화면에서 뒤로가기');
  };

  // ProductRegister에서 제품 등록 성공 시 호출될 함수
  const handleProductRegisterSuccess = () => {
    setActiveMenu('inventory_list'); // 제품 등록 성공 후 재고 현황 목록으로 자동 전환
    console.log('제품 등록 성공! 재고 현황으로 이동');
    // 필요하다면 여기서 InventoryList 컴포넌트가 데이터를 새로고침하도록 트리거할 수 있습니다.
    // (예: InventoryList가 props로 refresh 트리거를 받도록 구현되어 있다면)
  };

  const is_admin = currentUser?.employee_department === '관리자';
  const hr_manager = currentUser?.employee_department === '인사';
  const inven_manager = currentUser?.employee_department === '재고'
  const order_manager = currentUser?.employee_department === '발주'

  if (!isLoggedIn) {
    return <div>로그인 확인 중...</div>;
  }

  return (
    <>
      <div>
        <header>
          <nav>
            <ul className="container">
              <li className="nav_bar">
                <button><span>편의점 ERP</span></button>
              </li>
              <li className="login_bar">
                <span>{currentUser?.employee_department} 팀</span>
                <span>{currentUser?.employee_name} 님 안녕하세요</span>
                {currentUser && (// currentUser가 있을 때만 마이페이지 버튼 표시
                  <button onClick={goToMyPage}> 
                  {/* currentUser?.employee_department를 안전하게 사용 */}
                    <span>My Page</span></button>
                )}
                  <button onClick={handleLogout}><span>Log Out</span></button>
                
              </li>
            </ul>
          </nav>
        </header>

        <section>
          <div className="side_bar">
            <ul id="main_menu">
              {( is_admin || hr_manager ) && (
                <li>
                  <p className="main_menu_title">■ 인사 관리</p>
                  <ul className="sub_menu">
                    <li>
                      <button className={activeMenu === 'search' ? 'active' : ''} onClick={() => handleMenuClick('search')}>
                        - 검색 관리
                      </button>
                    </li>
                    <li>
                      <button className={activeMenu === 'permission' ? 'active' : ''} onClick={() => handleMenuClick('permission')}>
                        - 권한 관리
                      </button>
                    </li>
                  </ul>
                </li>
              )}

              {( is_admin || inven_manager ) && (
                <li>
                  <p className="main_menu_title">■ 재고 관리</p>
                  <ul className="sub_menu">
                    <li>
                      <button className={activeMenu === 'inventory_list' ? 'active' : ''} onClick={() => handleMenuClick('inventory_list')}>
                        - 재고 현황
                      </button>
                    </li>
                    <li>
                      <button className={activeMenu === 'product_register' ? 'active' : ''} onClick={() => handleMenuClick('product_register')}>
                        - 제품 등록
                      </button>
                    </li>
                  </ul>
                </li>
              )}

              {(is_admin || order_manager) && (
                <li>
                  <p className="main_menu_title">■ 발주 관리</p>
                  <ul className="sub_menu">
                    <li>
                      <button className={activeMenu === 'orders' ? 'active' : ''} onClick={() => handleMenuClick('orders')}>
                        - 발주 신청 / 확인
                      </button>
                    </li>
                  </ul>
                </li>
              )}

              <li>
                <p className="main_menu_title">■ 대시보드</p>
                <ul className="sub_menu">
                  <li
                    className={activeMenu === 'dashboard' ? 'active' : ''}
                    onClick={() => handleMenuClick('dashboard')}> - 메인 대시보드 
                  </li>
                  <li>
                    <button className={activeMenu === 'qr_attendance' ? 'active' : ''} onClick={() => handleMenuClick('qr_attendance')}>
                      - QR 출결
                    </button>
                  </li>
                  <li>
                    <button className={activeMenu === 'attendance' ? 'active' : ''} onClick={() => handleMenuClick('attendance')}>
                      - 출결 관리
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        
          <div className="main_board">
            {activeMenu === 'dashboard' && (
              <>
                <InventoryDashboard />
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

            {activeMenu === 'inventory_list' && (
              <InventoryList />
            )}

            {activeMenu === 'product_register' && (
              <ProductRegister 
                onBack={handleBackFromProductRegister}
                onSuccess={handleProductRegisterSuccess}
              />
            )}

            {activeMenu === 'orders' && (
              <Orders />
            )}

          </div>
        </section>
      </div>

    </>
  );
};

export default Dashboard;