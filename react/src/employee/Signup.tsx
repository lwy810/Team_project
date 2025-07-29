import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap'; 

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
          <ul className="nav_bar">
            <li>
              <button onClick={goToDashboard}>주문 발주 ERP</button>
            </li>
            <li>
              <button onClick={goToLoginPage} variant="secondary"><span>1.</span><span>로그인</span></button>
              <button><span>2.</span><span>회원가입</span></button>
            </li>
          </ul>
        </nav>
      </header>
      <section>
        <div>
          <h1>회원 등록 페이지입니다.</h1>
        </div>
      </section>
    </div>
    </>
  );
};

export default Signup;
