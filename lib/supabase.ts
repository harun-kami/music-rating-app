import { createClient } from '@supabase/supabase-js';

// .env.local から鍵を読み込む
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Supabase クライアントを作成してエクスポート
export const supabase = createClient(supabaseUrl, supabaseAnonKey);