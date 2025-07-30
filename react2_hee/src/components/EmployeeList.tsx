import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js'; // Supabase 클라이언트 임포트

// IMPORTANT: Replace with your actual Supabase project URL and Anon Key
// Supabase 프로젝트 설정에서 API 키를 확인하여 여기에 입력하세요.
const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const VITE_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Supabase 클라이언트 초기화
const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

// Employee 데이터의 타입 정의 (테이블 스키마에 맞춰)
interface Employee {
  employee_id: number;
  employee_name: string;
  employee_pwd: string; // 실제 앱에서는 비밀번호를 클라이언트에서 직접 다루지 않아야 합니다.
  employee_email: string;
  employee_department: string;
  employee_created_at: string;
  employee_renewed_at: string;
}

function EmployeeList() {
  // 직원 데이터를 저장할 상태
  const [employees, setEmployees] = useState<Employee[]>([]);
  // 로딩 상태를 관리할 상태
  const [loading, setLoading] = useState<boolean>(true);
  // 에러 메시지를 저장할 상태
  const [error, setError] = useState<string | null>(null);

  // 컴포넌트가 마운트될 때 데이터를 가져오는 useEffect 훅
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true); // 데이터 로딩 시작
      setError(null); // 이전 에러 초기화

      try {
        // 'employee' 테이블에서 모든 데이터를 선택하여 가져옵니다.
        // .select('*')는 모든 컬럼을 의미합니다.
        const { data, error: supabaseError } = await supabase
          .from('employee')
          .select('*')
          .order('employee_id', { ascending: true }); // employee_id 기준으로 오름차순 정렬

        if (supabaseError) {
          // Supabase에서 에러가 발생한 경우
          throw new Error(supabaseError.message);
        }

        if (data) {
          // 데이터가 성공적으로 로드된 경우
          setEmployees(data as Employee[]);
        }
      } catch (err: any) {
        // 네트워크 에러 등 다른 종류의 에러 처리
        setError(err.message || '데이터를 가져오는 데 실패했습니다.');
        console.error('Error fetching employees:', err);
      } finally {
        setLoading(false); // 데이터 로딩 완료 (성공 또는 실패)
      }
    };

    fetchEmployees(); // 함수 호출하여 데이터 가져오기 시작
  }, []); // 빈 의존성 배열: 컴포넌트가 처음 마운트될 때 한 번만 실행

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <p className="text-lg font-semibold text-gray-700">직원 데이터를 로딩 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <p className="text-lg text-red-600 font-semibold">오류 발생: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">직원 목록</h2>
      {employees.length === 0 ? (
        <p className="text-center text-gray-600">등록된 직원이 없습니다.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">ID</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">이름</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">부서</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">이메일</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">등록일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.employee_id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">{employee.employee_id}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">{employee.employee_name}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">{employee.employee_department}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">{employee.employee_email}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">{new Date(employee.employee_created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default EmployeeList;