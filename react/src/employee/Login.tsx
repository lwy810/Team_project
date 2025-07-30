import { useNavigate } from 'react-router-dom';

// import { createClient } from "@supabase/supabase-js";

function Login() {
  const navigate = useNavigate();

  const goToDashboard = () => {
    navigate('/');
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
              <button onClick={goToDashboard}><span>주문 발주 ERP</span></button>
            </li>
            <li className="login_bar">
              <button><span>로그인</span></button>
              <button onClick={goToSignupPage}><span>회원가입</span></button>
            </li>
          </ul>
        </nav>
      </header>

      <section>
        <div>
          <h2>로그인 페이지입니다.</h2>
        </div>
      </section>
    </div>
    </>
  );
};

export default Login;
