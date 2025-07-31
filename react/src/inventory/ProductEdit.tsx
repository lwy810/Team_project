import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 설정
const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const VITE_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

interface Inventory {
  inventory_id: number;
  inventory_item_name: string;
  inventory_item_category: string;
  inventory_item_numbers: string;
  inventory_buy_price: string;
  inventory_created_at: string;
  inventory_renewed_at: string;
}

interface ProductEditProps {
  inventoryId: number;
  onBack: () => void;
  onSuccess: () => void;
}

function ProductEdit({ inventoryId, onBack, onSuccess }: ProductEditProps) {
  const [formData, setFormData] = useState({
    inventory_item_name: '',
    inventory_item_category: '',
    inventory_item_numbers: '',
    inventory_buy_price: ''
  });
  const [originalData, setOriginalData] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 기존 데이터 불러오기
  useEffect(() => {
    const fetchInventoryItem = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from('inventory')
          .select('*')
          .eq('inventory_id', inventoryId)
          .single();

        if (supabaseError) {
          throw new Error(supabaseError.message);
        }

        if (data) {
          const inventoryData = data as Inventory;
          setOriginalData(inventoryData);
          setFormData({
            inventory_item_name: inventoryData.inventory_item_name,
            inventory_item_category: inventoryData.inventory_item_category,
            inventory_item_numbers: inventoryData.inventory_item_numbers,
            inventory_buy_price: inventoryData.inventory_buy_price
          });
        }
      } catch (err: any) {
        setError(err.message || '데이터를 불러오는데 실패했습니다.');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchInventoryItem();
  }, [inventoryId]);

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
      const { error: supabaseError } = await supabase
        .from('inventory')
        .update({
          ...formData,
          inventory_renewed_at: new Date().toISOString()
        })
        .eq('inventory_id', inventoryId);

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setSuccess(true);

      // 성공 메시지 표시 후 2초 뒤에 콜백 실행
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (err: any) {
      setError(err.message || '제품 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        padding: '40px'
      }}>
        <p style={{ fontSize: '18px', color: '#6b7280' }}>데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        padding: '40px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '60px 40px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%'
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
          }}>수정 완료!</h2>
          <p style={{
            fontSize: '16px',
            color: '#6b7280'
          }}>제품 정보가 성공적으로 수정되었습니다.</p>
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
          }}>제품 수정</h2>
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
            ← 뒤로가기
          </button>
        </div>

        {/* 기존 정보 표시 */}
        {originalData && (
          <div style={{
            marginBottom: '32px',
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
            }}>📋 현재 정보</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
              <div><strong>재고명:</strong> {originalData.inventory_item_name}</div>
              <div><strong>구분:</strong> {originalData.inventory_item_category}</div>
              <div><strong>수량:</strong> {originalData.inventory_item_numbers}</div>
              <div><strong>단위 원가:</strong> ₩{parseInt(originalData.inventory_buy_price).toLocaleString('ko-KR')}</div>
            </div>
          </div>
        )}

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
                marginBottom: '8px'
              }}>
                구분 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="inventory_item_category"
                value={formData.inventory_item_category}
                onChange={handleInputChange}
                placeholder="예: 인스턴트"
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

          {/* 수정 버튼 */}
          <div style={{ marginTop: '40px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '18px',
                backgroundColor: loading ? '#9ca3af' : '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(245, 158, 11, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#d97706';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#f59e0b';
              }}
            >
              {loading ? '수정 중...' : '✏️ 제품 수정'}
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
            color: '#f59e0b',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontFamily: 'monospace',
            overflowX: 'auto',
            lineHeight: '1.5'
          }}>
            UPDATE inventory SET<br />
            &nbsp;&nbsp;inventory_item_name = '{formData.inventory_item_name || '[재고명]'}',<br />
            &nbsp;&nbsp;inventory_item_category = '{formData.inventory_item_category || '[구분]'}',<br />
            &nbsp;&nbsp;inventory_item_numbers = '{formData.inventory_item_numbers || '[수량]'}',<br />
            &nbsp;&nbsp;inventory_buy_price = '{formData.inventory_buy_price || '[원가]'}',<br />
            &nbsp;&nbsp;inventory_renewed_at = CURRENT_TIMESTAMP<br />
            WHERE inventory_id = {inventoryId};
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductEdit;