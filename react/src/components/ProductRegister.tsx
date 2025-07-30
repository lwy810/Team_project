import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 설정
const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const VITE_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

interface ProductRegisterProps {
  onBack: () => void;
  onSuccess: () => void;
}

function ProductRegister({ onBack, onSuccess }: ProductRegisterProps) {
  const [formData, setFormData] = useState({
    inventory_item_name: '',
    inventory_item_category: '',
    inventory_item_numbers: '',
    inventory_buy_price: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 입력값 검증
    if (!formData.inventory_item_name || !formData.inventory_item_category || 
        !formData.inventory_item_numbers || !formData.inventory_buy_price) {
      setError('모든 필드를 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: supabaseError } = await supabase
        .from('inventory')
        .insert([formData])
        .select();

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setSuccess(true);
      setFormData({
        inventory_item_name: '',
        inventory_item_category: '',
        inventory_item_numbers: '',
        inventory_buy_price: ''
      });

      // 성공 메시지 표시 후 2초 뒤에 콜백 실행
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (err: any) {
      setError(err.message || '제품 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
        <div className="text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-green-600 mb-4">등록 완료!</h2>
          <p className="text-gray-600">제품이 성공적으로 등록되었습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">제품 등록</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          뒤로가기
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="inventory_item_name" className="block text-sm font-medium text-gray-700 mb-2">
            재고명 *
          </label>
          <input
            type="text"
            id="inventory_item_name"
            name="inventory_item_name"
            value={formData.inventory_item_name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: 라면"
            required
          />
        </div>

        <div>
          <label htmlFor="inventory_item_category" className="block text-sm font-medium text-gray-700 mb-2">
            구분 *
          </label>
          <input
            type="text"
            id="inventory_item_category"
            name="inventory_item_category"
            value={formData.inventory_item_category}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: 인스턴트"
            required
          />
        </div>

        <div>
          <label htmlFor="inventory_item_numbers" className="block text-sm font-medium text-gray-700 mb-2">
            재고 수량 *
          </label>
          <input
            type="text"
            id="inventory_item_numbers"
            name="inventory_item_numbers"
            value={formData.inventory_item_numbers}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: 5"
            required
          />
        </div>

        <div>
          <label htmlFor="inventory_buy_price" className="block text-sm font-medium text-gray-700 mb-2">
            재고 단위 원가 *
          </label>
          <input
            type="text"
            id="inventory_buy_price"
            name="inventory_buy_price"
            value={formData.inventory_buy_price}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: 1000"
            required
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {loading ? '등록 중...' : '제품 등록'}
          </button>
        </div>
      </form>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">실행될 SQL 쿼리:</h3>
        <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
          INSERT INTO inventory (inventory_item_name, inventory_item_category, inventory_item_numbers, inventory_buy_price)
          <br />
          VALUES ('{formData.inventory_item_name || '[재고명]'}', '{formData.inventory_item_category || '[구분]'}', '{formData.inventory_item_numbers || '[수량]'}', '{formData.inventory_buy_price || '[원가]'}');
        </code>
      </div>
    </div>
  );
}

export default ProductRegister;