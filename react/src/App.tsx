import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import './App.css';
import Login from './employee/Login'; // login 컴포넌트 임포트
import Signup from './employee/Signup'; // login 컴포넌트 임포트
import Dashboard from './components/Dashboard'; // login 컴포넌트 임포트

// import { createClient } from "@supabase/supabase-js";


// Supabase 클라이언트 설정 (환경변수에서 로드)
// const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
// const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 실제 Supabase 클라이언트 생성
// const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function App() {
  return (
    <>
    <div>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="*" element={<h2>404 - 페이지를 찾을 수 없습니다!</h2>} />
        </Routes>
      </Router>
    </div>
    </>
  );
};

export default App;
