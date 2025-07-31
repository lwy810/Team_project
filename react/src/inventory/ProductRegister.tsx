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
  // 카테고리 옵션들
  const categories = [
    '인스턴트',
    '유제품',
    '육류',
    '해산물',
    '채소',
    '과일',
    '곡물',
    '음료',
    '조미료',
    '냉동식품',
    '베이커리',
    '기타'
  ];

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

  // 카테고리 선택 함수
  const handleCategorySelect = (category: string) => {
    setFormData(prev => ({
      ...prev,
      inventory_item_category: category
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
      const { error: supabaseError } = await supabase
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
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        // alignItems: 'center',
        width: '100%',
        padding: '40px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          marginTop: '80px',
          padding: '60px 40px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%',
          height:'500px'
        }}>
          <div style={{
            fontSize: '80px',
            color: '#10b981',
            marginBottom: '20px'
          }}>✓</div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#10b981',
            marginBottom: '16px'
          }}>등록 완료!</h2>
          <p style={{
            fontSize: '16px',
            color: '#6b7280'
          }}>제품이 성공적으로 등록되었습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      width: '100%',
      padding: '20px',
      minHeight: '100vh'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        maxWidth: '600px',
        width: '100%'
      }}>
        {/* 헤더 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
          paddingBottom: '20px',
          borderBottom: '2px solid #f3f4f6'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0
          }}>제품 등록</h2>
          <button
            onClick={onBack}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
          >
            이전 페이지
          </button>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            fontSize: '14px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* 폼 */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '24px' }}>
            {/* 재고명 */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                재고명 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="inventory_item_name"
                value={formData.inventory_item_name}
                onChange={handleInputChange}
                placeholder="예: 라면"
                required
                style={{
                  width: '100%',
                  padding: '16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* 구분 */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '12px'
              }}>
                구분 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '12px',
                marginBottom: '8px'
              }}>
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategorySelect(category)}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: formData.inventory_item_category === category ? '#3b82f6' : '#f8fafc',
                      color: formData.inventory_item_category === category ? 'white' : '#374151',
                      border: formData.inventory_item_category === category ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => {
                      if (formData.inventory_item_category !== category) {
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (formData.inventory_item_category !== category) {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
              {formData.inventory_item_category && (
                <p style={{
                  fontSize: '14px',
                  color: '#10b981',
                  marginTop: '8px',
                  fontWeight: '500'
                }}>
                  ✓ 선택됨: {formData.inventory_item_category}
                </p>
              )}
            </div>

            {/* 2열 그리드 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* 재고 수량 */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  재고 수량 <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  name="inventory_item_numbers"
                  value={formData.inventory_item_numbers}
                  onChange={handleInputChange}
                  placeholder="예: 5"
                  required
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              {/* 단위 원가 */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  단위 원가 <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  name="inventory_buy_price"
                  value={formData.inventory_buy_price}
                  onChange={handleInputChange}
                  placeholder="예: 1000"
                  required
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>
          </div>

          {/* 등록 버튼 */}
          <div style={{ marginTop: '40px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '18px',
                backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#3b82f6';
              }}
            >
              {loading ? '등록 중...' : '✓ 제품 등록'}
            </button>
          </div>
        </form>

        {/* SQL 미리보기 */}
        <div style={{
          marginTop: '32px',
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#475569',
            marginBottom: '12px',
            margin: 0
          }}>💾 실행될 SQL 쿼리</h3>
          <div style={{
            backgroundColor: '#1e293b',
            color: '#10b981',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontFamily: 'monospace',
            overflowX: 'auto',
            lineHeight: '1.5'
          }}>
            INSERT INTO inventory (<br />
            &nbsp;&nbsp;inventory_item_name,<br />
            &nbsp;&nbsp;inventory_item_category,<br />
            &nbsp;&nbsp;inventory_item_numbers,<br />
            &nbsp;&nbsp;inventory_buy_price<br />
            )<br />
            VALUES (<br />
            &nbsp;&nbsp;'{formData.inventory_item_name || '[재고명]'}',<br />
            &nbsp;&nbsp;'{formData.inventory_item_category || '[구분]'}',<br />
            &nbsp;&nbsp;'{formData.inventory_item_numbers || '[수량]'}',<br />
            &nbsp;&nbsp;'{formData.inventory_buy_price || '[원가]'}'<br />
            );
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductRegister;