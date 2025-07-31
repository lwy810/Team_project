import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const VITE_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

interface Product {
  id: number;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  supplier: string;
  lastUpdated: string;
  location: string;
  barcode: string;
}

interface StockMovement {
  id: number;
  productName: string;
  type: 'in' | 'out';
  quantity: number;
  date: string;
  reason: string;
  employee: string;
}

function InventoryDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [recentMovements, setRecentMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터베이스에서 상품 데이터 불러오기
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: supabaseError } = await supabase
          .from('products')
          .select('*')
          .order('id', { ascending: true })
          .limit(3);

        if (supabaseError) {
          throw new Error(supabaseError.message);
        }

        if (data) {
          setProducts(data as Product[]);
        }
      } catch (err: any) {
        setError(err.message || '상품 데이터를 가져오는 데 실패했습니다.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchStockMovements = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from('stock_movements')
          .select('*')
          .order('date', { ascending: false })
          .limit(10);

        if (supabaseError) {
          throw new Error(supabaseError.message);
        }

        if (data) {
          setRecentMovements(data as StockMovement[]);
        }
      } catch (err: any) {
        console.error('Error fetching stock movements:', err);
      }
    };

    fetchProducts();
    fetchStockMovements();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  const totalValue = products.reduce((sum, product) => sum + (product.currentStock * product.unitPrice), 0);
  const lowStockItems = products.filter(product => product.currentStock <= product.minStock);
  const criticalItems = products.filter(product => product.currentStock <= product.minStock * 0.5);

  return (
    <div style={{
      height: '100vw',
      minHeight: '100vw',
      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      padding: '2rem'
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '0.5rem'
          }}>
            📦 재고 현황 대시보드
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
            실시간 재고 현황과 입출고 내역을 한눈에 확인하세요
          </p>
        </div>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          padding: '1rem 2rem',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>
            총 재고 가치
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
            {formatCurrency(totalValue)}
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {[
          {
            title: '전체 상품',
            value: products.length,
            icon: '📦',
            color: '#3b82f6',
            bg: '#dbeafe',
            subtext: '개 상품'
          },
          {
            title: '재고 부족',
            value: lowStockItems.length,
            icon: '⚠️',
            color: '#ef4444',
            bg: '#fecaca',
            subtext: '개 상품'
          },
          {
            title: '긴급 보충',
            value: criticalItems.length,
            icon: '🚨',
            color: '#dc2626',
            bg: '#fee2e2',
            subtext: '개 상품'
          },
          {
            title: '오늘 입출고',
            value: recentMovements.filter(m => m.date === '2025-01-30').length,
            icon: '📊',
            color: '#10b981',
            bg: '#dcfce7',
            subtext: '건'
          }
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#6b7280',
                  marginBottom: '0.5rem'
                }}>
                  {stat.title}
                </div>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: stat.color,
                  marginBottom: '0.5rem'
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#6b7280'
                }}>
                  {stat.subtext}
                </div>
              </div>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: stat.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem'
              }}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* 재고 현황 테이블 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            padding: '1.5rem 2rem',
            background: 'rgba(5, 150, 105, 0.1)',
            borderBottom: '1px solid rgba(5, 150, 105, 0.2)'
          }}>
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0
            }}>
              📋 재고 현황
            </h3>
          </div>

          <div style={{ padding: '2rem' }}>
            {loading ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#6b7280'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #e5e7eb',
                  borderTop: '4px solid #059669',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 1rem'
                }}></div>
                <p>상품 데이터를 불러오는 중...</p>
              </div>
            ) : error ? (
              <div style={{
                textAlign: 'center',
                color: '#ef4444'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.7 }}>⚠️</div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#1f2937' }}>
                  데이터 로딩 오류
                </h3>
                <p style={{ marginBottom: '2rem' }}>
                  {error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '15px',
                    padding: '1rem 2rem',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  다시 시도
                </button>
              </div>
            ) : products.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.7 }}>📦</div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#1f2937' }}>
                  등록된 상품이 없습니다
                </h3>
                <p style={{ marginBottom: '2rem' }}>
                  데이터베이스에 products 테이블을 생성하고<br />
                  상품 데이터를 추가해주세요.
                </p>
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  padding: '1rem',
                  fontSize: '0.9rem',
                  color: '#166534',
                  textAlign: 'left'
                }}>
                  <strong>필요한 테이블:</strong><br />
                  • products (상품 정보)<br />
                  • stock_movements (입출고 내역)
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {products.map((product) => {
                  const stockStatus = product.currentStock <= product.minStock 
                    ? { status: 'critical', color: '#ef4444', text: '부족' }
                    : product.currentStock <= product.minStock * 1.5
                    ? { status: 'warning', color: '#f59e0b', text: '주의' }
                    : { status: 'good', color: '#10b981', text: '양호' };
                  
                  const stockPercentage = (product.currentStock / product.maxStock) * 100;
                  const categoryIcon = product.category === '전자제품' ? '💻' : 
                                     product.category === '가구' ? '🪑' : 
                                     product.category === '사무용품' ? '📄' : '📦';
                  
                  return (
                    <div
                      key={product.id}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '15px',
                        padding: '1.5rem',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            background: '#f3f4f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem'
                          }}>
                            {categoryIcon}
                          </div>
                          <div>
                            <div style={{
                              fontSize: '1.1rem',
                              fontWeight: 'bold',
                              color: '#1f2937',
                              marginBottom: '0.3rem'
                            }}>
                              {product.name}
                            </div>
                            <div style={{
                              fontSize: '0.9rem',
                              color: '#6b7280'
                            }}>
                              {product.category} • {product.location} • {product.supplier}
                            </div>
                          </div>
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem'
                        }}>
                          <div style={{
                            background: stockStatus.color,
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                          }}>
                            {stockStatus.text}
                          </div>
                          <div style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: stockStatus.color
                          }}>
                            {product.currentStock}
                          </div>
                        </div>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '1rem',
                        marginBottom: '1rem'
                      }}>
                        <div style={{
                          background: '#f8fafc',
                          padding: '0.75rem',
                          borderRadius: '10px',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.3rem' }}>
                            최소 재고
                          </div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#374151' }}>
                            {product.minStock}
                          </div>
                        </div>
                        <div style={{
                          background: '#f8fafc',
                          padding: '0.75rem',
                          borderRadius: '10px',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.3rem' }}>
                            최대 재고
                          </div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#374151' }}>
                            {product.maxStock}
                          </div>
                        </div>
                        <div style={{
                          background: '#f8fafc',
                          padding: '0.75rem',
                          borderRadius: '10px',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.3rem' }}>
                            단가
                          </div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#374151' }}>
                            {formatCurrency(product.unitPrice)}
                          </div>
                        </div>
                      </div>

                      <div style={{
                        background: '#f3f4f6',
                        borderRadius: '10px',
                        height: '10px',
                        overflow: 'hidden',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{
                          background: stockStatus.color,
                          height: '100%',
                          width: `${Math.min(stockPercentage, 100)}%`,
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.8rem',
                        color: '#6b7280'
                      }}>
                        <span>재고율: {stockPercentage.toFixed(1)}%</span>
                        <span>최종 업데이트: {product.lastUpdated}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 최근 입출고 내역 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          height: 'fit-content'
        }}>
          <div style={{
            padding: '1.5rem 2rem',
            background: 'rgba(5, 150, 105, 0.1)',
            borderBottom: '1px solid rgba(5, 150, 105, 0.2)'
          }}>
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0
            }}>
              📊 최근 입출고
            </h3>
          </div>

          <div style={{ padding: '1.5rem' }}>
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.7 }}>📊</div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#1f2937' }}>
                입출고 내역이 없습니다
              </h4>
              <p style={{ fontSize: '0.9rem' }}>
                상품 입고 또는 출고 시<br />내역이 여기에 표시됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InventoryDashboard;