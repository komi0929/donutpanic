-- ==========================================
-- ドーナツパニック ランキングテーブル
-- Supabase SQL Editor で実行してください
-- ==========================================
-- 1. ランキングテーブル作成
CREATE TABLE rankings (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'ななし',
    time_seconds DOUBLE PRECISION NOT NULL,
    level INTEGER NOT NULL DEFAULT 0,
    week_key TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- 2. パフォーマンス用インデックス
CREATE INDEX idx_rankings_week_time ON rankings (week_key, time_seconds ASC);
-- 3. Row Level Security (RLS) を有効化
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;
-- 4. RLS ポリシー: 誰でも読み取り可能
CREATE POLICY "Anyone can read rankings" ON rankings FOR
SELECT USING (true);
-- 5. RLS ポリシー: 誰でも挿入可能（名前とタイムの記録）
CREATE POLICY "Anyone can insert rankings" ON rankings FOR
INSERT WITH CHECK (true);
-- 6. 更新・削除は不可（不正防止）
-- (デフォルトでブロックされるため、ポリシー追加不要)