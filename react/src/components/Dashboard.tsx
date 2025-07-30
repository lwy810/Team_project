import EmployeeList from './EmployeeList'
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  const goToLoginPage = () => { // <-- 로그인 페이지로 이동하는 함수 추가
    navigate('/login');
  };

  const goToSignupPage = () => { // <-- 로그인 페이지로 이동하는 함수 추가
    navigate('/signup');
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
                <li>- 제품 등록</li>
                <li>- 재고 확인</li>
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

   
          <div style={{ marginTop: '20px' }}>
            <EmployeeList />
          </div>

        </div>
      </section>
    </div>
    </>
  );
};

export default Dashboard;
