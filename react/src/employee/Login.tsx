
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap'; 

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
          <ul className="nav_bar">
            <li>
              <button onClick={goToDashboard}>주문 발주 ERP</button>
            </li>
            <li>
              <button><span>1.</span><span>로그인</span></button>
              <button onClick={goToSignupPage}><span>2.</span><span>회원가입</span></button>
            </li>
          </ul>
        </nav>
      </header>

      <section>
        <div>
          <h1>로그인 페이지입니다.</h1>
        </div>
      </section>
    </div>
    </>
  );
};

export default Login;
