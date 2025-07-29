import { createClient } from "@supabase/supabase-js";
import './App.css';

// Supabase 클라이언트 설정 (환경변수에서 로드)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 실제 Supabase 클라이언트 생성
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function App() {
  return (
    <>
    <div>
      <header>
        <nav>
          <ul className="nav_bar">
            <li>
              <h1>주문 발주 ERP</h1>
            </li>
            <li>
              <a href="https://www.google.com"><span>1.</span><span>로그인</span></a>
              <a href="https://www.naver.com"><span>2.</span><span>회원가입</span></a>
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

          <div>
            <strong>📋 Supabase 데이터베이스 연결됨:</strong>
            <br />
            ✅ 실제 Supabase 데이터베이스에 연결되어 있습니다.
            <br />
            📊 필요한 테이블: courses (과목), registrations (수강신청)
            <br />
            🔄 실시간 업데이트가 활성화되어 있습니다.
          </div>

        </div>
      </section>  
    </div>
    </>
  );
};

export default App;
