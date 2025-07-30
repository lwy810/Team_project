import { createClient, SupabaseClient } from '@supabase/supabase-js';

// .env 파일에서 환경 변수를 불러옵니다.
// Vite를 사용하고 있으므로 import.meta.env를 사용합니다.
const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 환경 변수가 올바르게 설정되었는지 확인 (필수)
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL 또는 Anon Key 환경 변수가 설정되지 않았습니다.');
}

// Supabase 클라이언트 생성
// 여기에 제너릭 타입 <Database>를 추가하여 Supabase CLI로 생성한 데이터베이스 타입을 연결할 수 있습니다.
// 아직 Database 타입이 없다면 일단 <any>로 두어도 무방하지만, 타입 안전성을 위해 나중에 꼭 추가하세요.
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// 발주 항목의 타입 정의 (App.tsx에서 사용하던 Order, NewOrder)
// 실제 Supabase 테이블 스키마에 맞게 조정해야 합니다.
// 예를 들어, order_id는 Supabase에서 자동으로 생성되므로 NewOrder에는 포함되지 않을 수 있습니다.
export interface Order {
  order_id: number;
  order_administrator: string;
  order_item_name: string;
  order_item_numbers: string; // 수량은 문자열보다는 number 타입이 더 적절할 수 있습니다.
  order_sales_price: string; // 단가도 number 타입이 더 적절할 수 있습니다.
  order_state: '승인대기' | '승인완료' | '취소';
  inventory_created_at: string; // ISO 8601 형식의 날짜 문자열
  inventory_renewed_at: string; // ISO 8601 형식의 날짜 문자열
}

// 새 발주 신청 시 필요한 데이터 타입
export interface NewOrder {
  order_administrator: string;
  order_item_name: string;
  order_item_numbers: string;
  order_sales_price: string;
}

// Supabase CLI로 데이터베이스 타입을 생성하는 경우
// 나중에 이 파일에 `database.types.ts`에서 생성된 `Database` 타입을 임포트하여 사용할 수 있습니다.
// 예: import type { Database } from '../database.types';
// 그리고 `createClient<Database>(supabaseUrl, supabaseAnonKey)` 이런 식으로 사용합니다.