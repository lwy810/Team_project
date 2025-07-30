import EmployeeList from './EmployeeList'
import InventoryList from './InventoryList'
import ProductRegister from './ProductRegister'
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Dashboard() {
  const navigate = useNavigate();
  const [showInventory, setShowInventory] = useState(false);
  const [showProductRegister, setShowProductRegister] = useState(false);

  const goToLoginPage = () => { // <-- 로그인 페이지로 이동하는 함수 추가
    navigate('/login');
  };

  const goToSignupPage = () => { // <-- 로그인 페이지로 이동하는 함수 추가
    navigate('/signup');
  };

  const handleInventoryCheck = () => {
    setShowInventory(!showInventory);
    setShowProductRegister(false);
  };

  const handleProductRegister = () => {
    setShowProductRegister(!showProductRegister);
    setShowInventory(false);
  };

  const handleBackToDashboard = () => {
    setShowProductRegister(false);
    setShowInventory(false);
  };

  const handleRegistrationSuccess = () => {
    setShowProductRegister(false);
    setShowInventory(true); // 등록 성공 후 재고 목록으로 이동
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
                  <li>- 출결 관리</li>
                  <li>- 직원 검색</li>
                </ul>
              </li>
              <li>
                <p className="main_menu_title">■ 재고</p>
                <ul className="sub_menu">
                  <li>
                    <button
                      onClick={handleProductRegister}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: showProductRegister ? '#007bff' : 'inherit',
                        fontWeight: showProductRegister ? 'bold' : 'normal',
                        fontSize: 'inherit',
                        padding: 0,
                        textAlign: 'left'
                      }}
                    >
                      - 제품 등록
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleInventoryCheck}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: showInventory ? '#007bff' : 'inherit',
                        fontWeight: showInventory ? 'bold' : 'normal',
                        fontSize: 'inherit',
                        padding: 0,
                        textAlign: 'left'
                      }}
                    >
                      - 재고 확인
                    </button>
                  </li>
                </ul>
              </li>
              <li>
                <p className="main_menu_title">■ 발주</p>
                <ul className="sub_menu">
                  <li>- 발주 신청</li>
                  <li>- 발주 상태 확인</li>
                </ul>
              </li>
            </ul>

          </div>

          <div className="main_board">
            <h2>Dash Board</h2>

            {showProductRegister ? (
              <div style={{ marginTop: '20px' }}>
                <ProductRegister
                  onBack={handleBackToDashboard}
                  onSuccess={handleRegistrationSuccess}
                />
              </div>
            ) : showInventory ? (
              <div style={{ marginTop: '20px' }}>
                <InventoryList />
              </div>
            ) : (
              <div style={{ marginTop: '20px' }}>
                <EmployeeList />
              </div>
            )}

          </div>
        </section>
      </div>
    </>
  );
};

export default Dashboard;
