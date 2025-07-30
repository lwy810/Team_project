import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import './App.css';
import Login from './components/Login'; // login 컴포넌트 임포트
import Signup from './components/Signup'; // Signup 컴포넌트 임포트
import Dashboard from './components/Dashboard'; // Signup 컴포넌트 임포트
import { AuthProvider } from './contexts/AuthContext'; // AuthProvider 임포트

function App() {
  return (
    <>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<h2>404 - 페이지를 찾을 수 없습니다!</h2>} />
        </Routes>
      </Router>
    </AuthProvider>
    </>
  );
};

export default App;
