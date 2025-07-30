import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 설정 (환경변수 사용)
const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const VITE_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Supabase 클라이언트 초기화
const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

// Inventory 데이터의 타입 정의 (실제 데이터베이스 스키마에 맞춰)
interface Inventory {
  inventory_id: number;
  inventory_item_name: string;
  inventory_item_category: string;
  inventory_item_numbers: string;
  inventory_buy_price: string;
  inventory_created_at: string;
  inventory_renewed_at: string;
}

function InventoryList() {
  // 재고 데이터를 저장할 상태
  const [inventory, setInventory] = useState<Inventory[]>([]);
  // 로딩 상태를 관리할 상태
  const [loading, setLoading] = useState<boolean>(true);
  // 에러 메시지를 저장할 상태
  const [error, setError] = useState<string | null>(null);

  // 컴포넌트가 마운트될 때 데이터를 가져오는 useEffect 훅
  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true); // 데이터 로딩 시작
      setError(null); // 이전 에러 초기화

      try {
        // 'inventory' 테이블에서 모든 데이터를 선택하여 가져옵니다.
        const { data, error: supabaseError } = await supabase
          .from('inventory')
          .select('*')
          .order('inventory_id', { ascending: true }); // inventory_id 기준으로 오름차순 정렬

        if (supabaseError) {
          // Supabase에서 에러가 발생한 경우
          throw new Error(supabaseError.message);
        }

        if (data) {
          // 데이터가 성공적으로 로드된 경우
          setInventory(data as Inventory[]);
        }
      } catch (err: any) {
        // 네트워크 에러 등 다른 종류의 에러 처리
        setError(err.message || '재고 데이터를 가져오는 데 실패했습니다.');
        console.error('Error fetching inventory:', err);
      } finally {
        setLoading(false); // 데이터 로딩 완료 (성공 또는 실패)
      }
    };

    fetchInventory(); // 함수 호출하여 데이터 가져오기 시작
  }, []); // 빈 의존성 배열: 컴포넌트가 처음 마운트될 때 한 번만 실행

  // 한국 원화 포맷팅 함수
  const formatCurrency = (amount: string): string => {
    const numAmount = parseInt(amount);
    return `₩${numAmount.toLocaleString('ko-KR')}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <p className="text-lg font-semibold text-gray-700">재고 데이터를 로딩 중입니다...</p>
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
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">재고 목록</h2>
      {inventory.length === 0 ? (
        <p className="text-center text-gray-600">등록된 재고가 없습니다.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">ID</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">재고명</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">구분</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">수량</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">단위 원가</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">생성일</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">갱신일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inventory.map((item) => (
                <tr key={item.inventory_id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">{item.inventory_id}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">{item.inventory_item_name}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">{item.inventory_item_category}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">{item.inventory_item_numbers}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.inventory_buy_price)}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">{new Date(item.inventory_created_at).toLocaleDateString('ko-KR')}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">{new Date(item.inventory_renewed_at).toLocaleDateString('ko-KR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default InventoryList;