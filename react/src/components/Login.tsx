import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext'
import { createClient } from '@supabase/supabase-js'; // Supabase 클라이언트 임포트

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const VITE_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Supabase 클라이언트 초기화
  const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

  const goToDashboard = () => {
    navigate('/');
  };

  const goToSignupPage = () => {
    navigate('/signup');
  };

  // 데이터베이스 계정으로 로그인 처리 함수
  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault(); // 폼 기본 제출 동작 방지
    setLoading(true);
    setError(null); // 이전 에러 초기화

    try {
      // 1. 이메일로 직원 정보 조회
      const { data, error: dbError } = await supabase
        .from('employee')
        .select('*')
        .eq('employee_email', email)
        .single(); // 단일 레코드만 가져오기

      if (dbError) {
        // 데이터베이스 조회 중 에러 발생 (예: 네트워크 문제, 권한 문제)
        console.error('DB 조회 에러:', dbError);
        setError('로그인 정보를 확인하는 중 오류가 발생했습니다.');
        return;
      }

      if (!data) {
        // 해당 이메일의 사용자를 찾을 수 없는 경우
        setError('잘못된 이메일 또는 비밀번호입니다.');
        return;
      }

      // 2. 비밀번호 일치 여부 확인 (매우 중요: 실제로는 안전한 해싱된 비밀번호와 비교해야 함)
      // !!! 경고: 이 코드는 비밀번호를 평문으로 비교합니다. 절대 실제 서비스에 사용해서는 안 됩니다.
      // !!! 실제로는 DB에 해싱된 비밀번호를 저장하고, 입력받은 비밀번호를 해싱하여 비교해야 합니다.
      if (data.employee_pwd === password) {
        // 로그인 성공
        console.log('로그인 성공:', data);
        login();
        // 로그인 성공 후 대시보드 또는 다른 페이지로 이동
        // 여기에서 사용자 정보를 전역 상태 (Context API, Redux 등) 또는 로컬 스토리지에 저장하여
        // 로그인 상태를 유지할 수 있습니다.
        navigate('/');
      } else {
        // 비밀번호가 일치하지 않는 경우
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
            <form onSubmit={handleLogin}>
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
              <button type="submit" disabled={loading}>
                {loading ? '로그인 중...' : '로그인'}
              </button>
              {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
          </div>
        </section>
      </div>
    </>
  );
}

export default Login;
