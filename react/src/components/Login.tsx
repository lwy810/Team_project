import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createClient } from '@supabase/supabase-js';

// Login.css 파일을 임포트합니다.
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
  const VITE_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

  const goToSignupPage = () => {
    navigate('/signup');
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabase
        .from('employee')
        .select('*')
        .eq('employee_email', email)
        .single();

      if (dbError) {
        console.error('DB 조회 에러:', dbError);
        setError('로그인 정보를 확인하는 중 오류가 발생했습니다.');
        return;
      }

      if (!data) {
        setError('잘못된 이메일 또는 비밀번호입니다.');
        return;
      }

      // 경고: 이 코드는 비밀번호를 평문으로 비교합니다.
      // 실제 서비스에서는 반드시 해싱된 비밀번호를 사용하세요.
      if (data.employee_pwd === password) {
        console.log('로그인 성공:', data);
        const { employee_pwd, ...userDataWithoutPassword } = data;
        // userDataWithoutPassword는 이제 employee_pwd를 제외한 모든 필드를 포함합니다.
        login(userDataWithoutPassword); // <-- 수정된 부분
        // 비밀번호 필드를 제외한 사용자 데이터를 Context의 login 함수로 전달
        navigate('/dashboard');
      } else {
        setError('잘못된 이메일 또는 비밀번호입니다.');
      }

    } catch (err: any) {
      setError(err.message || '로그인 중 오류가 발생했습니다.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Header */}
      <header className="login-header">
        <nav>
          <div className="login-nav-list">
            <p>편의점 ERP</p>
          </div>
        </nav>
      </header>

      {/* Main Content - Login Form */}
      <section className="login-main-content">
        <div className="login-card">
          <h2 className="login-title">로그인</h2>
          {/* Error Message */}
          {error && (
            <div className="login-error-message">
              ⚠️ {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="login-form">
            {/* Email Input */}
            <div className="form-group">
              <label htmlFor="email">이메일 주소</label>
              <div className="input-with-icon">
                <span className="icon">&#9993;</span>
                <input
                  className='input_email'
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label htmlFor="password">비밀번호</label>
              <div className="input-with-icon">
                <span className="icon">&#128274;</span>
                <input
                  className='input_pwd'
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  required
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                로그인 정보 저장
              </label>
              <a href="#" className="forgot-password">
                비밀번호를 잊으셨나요?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`login-button ${loading ? 'loading' : ''}`}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
            <button className='signup-button' onClick={goToSignupPage}>회원가입</button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Login;