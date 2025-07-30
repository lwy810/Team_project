import { useNavigate } from 'react-router-dom';

// import { createClient } from "@supabase/supabase-js";


// Supabase 클라이언트 설정 (환경변수에서 로드)
// const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
// const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 실제 Supabase 클라이언트 생성
// const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function Signup() {
  const navigate = useNavigate();

  const goToDashboard = () => {
    navigate('/');
  };

  const goToLoginPage = () => { // <-- 로그인 페이지로 이동하는 함수 추가
    navigate('/login');
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
              <button onClick={goToLoginPage}><span>로그인</span></button>
              <button><span>회원가입</span></button>
            </li>
          </ul>
        </nav>
      </header>
      <section>
        <div>
          <h2>회원 등록 페이지입니다.</h2>
        </div>
      </section>
    </div>
    </>
  );
};

export default Signup;
