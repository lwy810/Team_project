import { useNavigate } from 'react-router-dom';
import { useState } from 'react'

import { createClient } from "@supabase/supabase-js";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  const goToDashboard = () => {
    navigate('/');
  };

  const goToSignupPage = () => { // <-- 로그인 페이지로 이동하는 함수 추가
    navigate('/signup');
  };

  const handleLogin = async (e) => {
    e.preventDefault(); // 폼의 기본 제출 동작(페이지 새로고침) 방지

    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL as string, 
      import.meta.env.VITE_SUPABASE_ANON_KEY as string);
    
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

    // 지금은 콘솔에 자격 증명을 기록하고 대시보드로 이동합니다.
    console.log('로그인 시도:', { email, password });

    // 성공적인 로그인을 시뮬레이션하고 이동 (실제 앱에서는 인증 성공 시에만 이동)
    goToDashboard();
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
          <form onSubmit={handleLogin}> {/* 폼과 onSubmit 핸들러 추가 */}
            <div>
              <label htmlFor="email">이메일:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password">비밀번호:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">로그인</button> {/* 폼 제출 버튼 */}
          </form>
        </div>
      </section>
    </div>
    </>
  );
};

export default Login;
