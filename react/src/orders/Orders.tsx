import React, { useState, useEffect } from 'react';
import './Orders.css';
import { supabase } from './supabaseClient';
import type { Order, NewOrder } from './supabaseClient';

function App() {
    const [activeTab, setActiveTab] = useState<'create' | 'status'>('create');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

    // 새 발주 신청 폼 상태
    const [newOrder, setNewOrder] = useState<NewOrder>({
        order_administrator: '',
        order_item_name: '',
        order_item_numbers: '',
        order_sales_price: ''
    });

    // 발주 목록 조회 - Supabase 연동
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('inventory_created_at', { ascending: false });

            if (error) {
                throw error;
            }

            setOrders(data || []);
        } catch (error) {
            console.error('발주 목록 조회 실패:', error);
            alert('발주 목록을 불러오는데 실패했습니다. 네트워크 연결과 Supabase 설정을 확인해주세요.');
        } finally {
            setLoading(false);
        }
    };

    // 새 발주 신청 - Supabase 연동
    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newOrder.order_administrator || !newOrder.order_item_name ||
            !newOrder.order_item_numbers || !newOrder.order_sales_price) {
            alert('모든 필드를 입력해주세요.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('orders')
                .insert([{
                    ...newOrder,
                    order_state: '승인대기'
                }]);

            if (error) {
                throw error;
            }

            // 폼 초기화
            setNewOrder({
                order_administrator: '',
                order_item_name: '',
                order_item_numbers: '',
                order_sales_price: ''
            });

            // 발주 목록 새로고침
            await fetchOrders();

            alert('발주 신청이 완료되었습니다.');
        } catch (error) {
            console.error('발주 신청 실패:', error);
            alert('발주 신청에 실패했습니다. 네트워크 연결과 Supabase 설정을 확인해주세요.');
        } finally {
            setLoading(false);
        }
    };

    // 발주 상태 업데이트
    const updateOrderStatus = async (orderId: number, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({
                    order_state: newStatus,
                    inventory_renewed_at: new Date().toISOString()
                })
                .eq('order_id', orderId);

            if (error) {
                throw error;
            }

            // 발주 목록 새로고침
            await fetchOrders();
            alert('발주 상태가 업데이트되었습니다.');
        } catch (error) {
            console.error('상태 업데이트 실패:', error);
            alert('상태 업데이트에 실패했습니다.');
        }
    };

    // 컴포넌트 마운트 시 발주 목록 조회
    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div className="app">
            <header className="app-header">
                <h1>발주 관리 시스템</h1>
                <nav className="tab-nav">
                    <button
                        className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
                        onClick={() => setActiveTab('create')}
                    >
                        발주 신청
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'status' ? 'active' : ''}`}
                        onClick={() => setActiveTab('status')}
                    >
                        발주 상태 확인
                    </button>
                </nav>
            </header>

            <main className="app-main">
                {activeTab === 'create' && (
                    <div className="create-order-section">
                        <h2>새 발주 신청</h2>
                        <form onSubmit={handleSubmitOrder} className="order-form">
                            <div className="form-group">
                                <label htmlFor="administrator">발주 작성자</label>
                                <input
                                    type="text"
                                    id="administrator"
                                    value={newOrder.order_administrator}
                                    onChange={(e) => setNewOrder({ ...newOrder, order_administrator: e.target.value })}
                                    placeholder="작성자명을 입력하세요"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="itemName">발주 제품명</label>
                                <input
                                    type="text"
                                    id="itemName"
                                    value={newOrder.order_item_name}
                                    onChange={(e) => setNewOrder({ ...newOrder, order_item_name: e.target.value })}
                                    placeholder="제품명을 입력하세요"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="itemNumbers">발주 수량</label>
                                <input
                                    type="text"
                                    id="itemNumbers"
                                    value={newOrder.order_item_numbers}
                                    onChange={(e) => setNewOrder({ ...newOrder, order_item_numbers: e.target.value })}
                                    placeholder="수량을 입력하세요"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="salesPrice">발주 단가</label>
                                <input
                                    type="text"
                                    id="salesPrice"
                                    value={newOrder.order_sales_price}
                                    onChange={(e) => setNewOrder({ ...newOrder, order_sales_price: e.target.value })}
                                    placeholder="단가를 입력하세요"
                                    required
                                />
                            </div>

                            <button type="submit" className="submit-button" disabled={loading}>
                                {loading ? '신청 중...' : '발주 신청'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'status' && (
                    <div className="status-section">
                        <div className="section-header">
                            <h2>발주 상태 확인</h2>
                            <button onClick={fetchOrders} className="refresh-button" disabled={loading}>
                                {loading ? '조회 중...' : '새로고침'}
                            </button>
                        </div>

                        {loading ? (
                            <div className="loading">발주 목록을 불러오는 중...</div>
                        ) : (
                            <div className="orders-table-container">
                                <table className="orders-table">
                                    <thead>
                                        <tr>
                                            <th>발주번호</th>
                                            <th>작성자</th>
                                            <th>제품명</th>
                                            <th>수량</th>
                                            <th>단가</th>
                                            <th>상태</th>
                                            <th>신청일시</th>
                                            <th>수정일시</th>
                                            <th>처리</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="no-data">발주 내역이 없습니다.</td>
                                            </tr>
                                        ) : (
                                            orders.map((order) => (
                                                <tr key={order.order_id}>
                                                    <td>{order.order_id}</td>
                                                    <td>{order.order_administrator}</td>
                                                    <td>{order.order_item_name}</td>
                                                    <td>{order.order_item_numbers}</td>
                                                    <td>{Number(order.order_sales_price).toLocaleString()}원</td>
                                                    <td>
                                                        <span className={`status-badge ${order.order_state === '승인완료' ? 'approved' :
                                                            order.order_state === '취소' ? 'cancelled' : 'pending'
                                                            }`}>
                                                            {order.order_state}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(order.inventory_created_at).toLocaleDateString()}</td>
                                                    <td>{new Date(order.inventory_renewed_at).toLocaleDateString()}</td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            {order.order_state === '승인대기' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => updateOrderStatus(order.order_id, '승인완료')}
                                                                        className="action-button approve"
                                                                        disabled={loading}
                                                                    >
                                                                        승인
                                                                    </button>
                                                                    <button
                                                                        onClick={() => updateOrderStatus(order.order_id, '취소')}
                                                                        className="action-button cancel"
                                                                        disabled={loading}
                                                                    >
                                                                        취소
                                                                    </button>
                                                                </>
                                                            )}
                                                            {(order.order_state === '승인완료' || order.order_state === '취소') && (
                                                                <span className="status-final">처리완료</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;
