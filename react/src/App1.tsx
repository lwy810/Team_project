import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';

// 예시: 홈 페이지 컴포넌트
function HomePage() {
  const navigate = useNavigate(); // v6 부터 useNavigate 훅 사용

  const goToAboutPage = () => {
    navigate('/about'); // '/about' 경로로 이동
  };

  return (
    <div>
      <h1>홈 페이지</h1>
      {/* 1. Link 컴포넌트 사용 (가장 일반적) */}
      <p><Link to="/about">소개 페이지로 이동 (Link)</Link></p>

      {/* 2. 네비게이트 함수를 사용하여 버튼 클릭 시 이동 */}
      <button onClick={goToAboutPage}>소개 페이지로 이동 (Button)</button>

      {/* 외부 링크는 일반 <a> 태그 사용 */}
      <p><a href="https://www.google.com" target="_blank" rel="noopener noreferrer">구글로 이동 (외부 링크)</a></p>
    </div>
  );
}

// 예시: 소개 페이지 컴포넌트
function AboutPage() {
  return (
    <div>
      <h1>소개 페이지</h1>
      <p>저희 서비스에 대해 알아보세요.</p>
      <p><Link to="/">홈으로 돌아가기</Link></p>
    </div>
  );
}

// 메인 앱 컴포넌트
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        {/* 필요한 만큼 Route 추가 */}
      </Routes>
    </Router>
  );
}

export default App;