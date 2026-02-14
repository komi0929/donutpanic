// === Supabase Configuration ===
// Supabase ダッシュボード → Settings → API から取得してください

const SUPABASE_URL = 'https://ksnayietrresyyfnlsps.supabase.co';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbmF5aWV0cnJlc3l5Zm5sc3BzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMTAyOTQsImV4cCI6MjA4NjY4NjI5NH0.qQxt_Ng9iFmITNFxgWuh4wh8FsVLMUg9S6LQu_etqy8';

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
