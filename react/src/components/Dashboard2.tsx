import EmployeeList from './EmployeeList'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // useAuth 훅 임포트
import { useEffect } from 'react'; // 초기 로그인 상태를 로컬 스토리지에서 확인하기 위해 사용

function Dashboard() {
  const navigate = useNavigate();
  const { isLoggedIn, logout, login } = useAuth(); // AuthContext에서 상태 및 함수 가져오기

  // 컴포넌트 마운트 시 로컬 스토리지에서 로그인 상태 확인 (새로고침 시 상태 유지)
  useEffect(() => {
    const storedLoginStatus = localStorage.getItem('isLoggedIn');
    console.log("Dashboard useEffect: storedLoginStatus =", storedLoginStatus, ", current isLoggedIn =", isLoggedIn); // <-- 추가
    if (storedLoginStatus === 'true' && !isLoggedIn) {
      login(); // Context 상태를 로컬 스토리지와 동기화
    }
  }, [isLoggedIn, login]); // isLoggedIn, login이 변경될 때만 실행
  
  const handleLogout = () => {
    logout(); // <--- 로그아웃 시 Context의 logout 함수 호출
    navigate('/login'); // 로그아웃 후 로그인 페이지로 이동
  };

  const goToMyPage = () => {
    // 마이페이지로 이동하는 로직
    console.log('마이페이지로 이동');
    // navigate('/mypage'); // 실제 마이페이지 라우트가 있다면 주석 해제
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
              <button onClick={goToMyPage}><span>뒤로</span></button>
              <button onClick={handleLogout}><span>로그아웃</span></button>
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
