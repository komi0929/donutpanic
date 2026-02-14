// === Supabase Configuration ===
// Supabase ダッシュボード → Settings → API から取得してください

const SUPABASE_URL = 'https://ksnayietrresyyfnlsps.supabase.co';

// ↓↓↓ ここに anon key を貼り付けてください ↓↓↓
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';
// ↑↑↑ Supabase Dashboard → Settings → API → anon public ↑↑↑

// Supabase client (CDN版のグローバル変数から生成)
let supabase = null;

function initSupabase() {
  if (SUPABASE_ANON_KEY === 'YOUR_ANON_KEY_HERE') {
    console.warn('[Supabase] anon key が未設定です。localStorageフォールバックを使用します。');
    return false;
  }
  try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('[Supabase] 接続成功');
    return true;
  } catch (e) {
    console.error('[Supabase] 初期化エラー:', e);
    return false;
  }
}
