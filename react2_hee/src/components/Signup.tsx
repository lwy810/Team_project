import { useNavigate } from 'react-router-dom';
import { createClient } from "@supabase/supabase-js";

function Mypage() {
  const navigate = useNavigate();

  const goToDashboard = () => {
    navigate('/');
  };

  const goToLoginPage = () => { // <-- 로그인 페이지로 이동하는 함수 추가
    navigate('/login');

  const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const VITE_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Supabase 클라이언트 초기화
  const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY); 
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
              <button onClick={goToDashboard}><span>뒤로</span></button>
              <button onClick={goToLoginPage}><span>로그아웃</span></button>
            </li>
          </ul>
        </nav>
      </header>
      <section>
        <div>
          <h2>마이 페이지입니다.</h2>
        </div>
      </section>
    </div>
    </>
  );
};

export default Mypage;
