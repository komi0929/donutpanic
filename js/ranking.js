// === Daily Ranking System (Supabase + localStorage fallback) ===

const Ranking = {
  MAX_ENTRIES: 10,
  _useSupabase: false,
  _cachedRankings: [],      // プリロード済みランキング
  _cacheLoaded: false,

  /**
   * Initialize ranking system
   */
  init() {
    this._useSupabase = initSupabase();
    if (this._useSupabase) {
      this.preloadRankings();
    } else {
      this._cachedRankings = this._getLocalRanking();
      this._cacheLoaded = true;
    }
  },

  /**
   * Get the current day key in JST (resets at midnight 00:00 JST).
   * Returns YYYY-MM-DD in JST timezone.
   */
  _dayKey() {
    const now = new Date();
    // Convert to JST (UTC+9)
    const jstMs = now.getTime() + (now.getTimezoneOffset() * 60000) + (9 * 3600000);
    const jst = new Date(jstMs);

    const y = jst.getFullYear();
    const m = String(jst.getMonth() + 1).padStart(2, '0');
    const d = String(jst.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  _localStorageKey() {
    return `donutpanic_ranking_${this._dayKey()}`;
  },

  // ==================
  // localStorage 系
  // ==================

  _getLocalRanking() {
    try {
      const data = localStorage.getItem(this._localStorageKey());
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  _saveLocalRanking(rankings) {
    try {
      localStorage.setItem(this._localStorageKey(), JSON.stringify(rankings));
    } catch {
      // Storage full
    }
  },

  // ==================
  // Supabase 系
  // ==================

  /**
   * Preload rankings from Supabase (called once at init and after save)
   */
  async preloadRankings() {
    if (!this._useSupabase) {
      this._cachedRankings = this._getLocalRanking();
      this._cacheLoaded = true;
      return;
    }
    try {
      const dayKey = this._dayKey();
      const { data, error } = await supabaseClient
        .from('rankings')
        .select('name, time_seconds, level, created_at')
        .eq('week_key', dayKey)
        .order('time_seconds', { ascending: true })
        .limit(this.MAX_ENTRIES);

      if (error) throw error;

      this._cachedRankings = (data || []).map(r => ({
        name: r.name,
        time: r.time_seconds,
        level: r.level,
        date: r.created_at,
      }));
      this._cacheLoaded = true;
    } catch (e) {
      console.error('[Ranking] Supabase fetch失敗、localStorageにフォールバック:', e);
      this._cachedRankings = this._getLocalRanking();
      this._cacheLoaded = true;
    }
  },

  /**
   * Get cached daily rankings (synchronous — uses preloaded data)
   */
  getDailyRanking() {
    return this._cachedRankings;
  },

  /**
   * Check if a time qualifies for top 10
   * Returns the rank (1-based) or 0 if not qualified
   */
  checkRank(timeSeconds) {
    const rankings = this._cachedRankings;
    if (rankings.length < this.MAX_ENTRIES) {
      const pos = rankings.findIndex(r => timeSeconds < r.time);
      return pos === -1 ? rankings.length + 1 : pos + 1;
    }
    const pos = rankings.findIndex(r => timeSeconds < r.time);
    return pos === -1 ? 0 : pos + 1;
  },

  /**
   * Add a new ranking entry (async — writes to Supabase or localStorage)
   */
  async addEntry(name, timeSeconds, level) {
    const entryName = name || 'ななし';

    if (this._useSupabase) {
      try {
        const { error } = await supabaseClient
          .from('rankings')
          .insert({
            name: entryName,
            time_seconds: timeSeconds,
            level: level,
            week_key: this._dayKey(),
          });

        if (error) throw error;

        // 保存後にキャッシュを更新
        await this.preloadRankings();
        // localStorageにもバックアップ
        this._saveLocalRanking(this._cachedRankings);
        return this._cachedRankings;
      } catch (e) {
        console.error('[Ranking] Supabase保存失敗、localStorageにフォールバック:', e);
        return this._addLocalEntry(entryName, timeSeconds, level);
      }
    } else {
      return this._addLocalEntry(entryName, timeSeconds, level);
    }
  },

  _addLocalEntry(name, timeSeconds, level) {
    const rankings = this._getLocalRanking();
    rankings.push({
      name: name,
      time: timeSeconds,
      level: level,
      date: new Date().toISOString(),
    });
    rankings.sort((a, b) => a.time - b.time);
    if (rankings.length > this.MAX_ENTRIES) {
      rankings.length = this.MAX_ENTRIES;
    }
    this._saveLocalRanking(rankings);
    this._cachedRankings = rankings;
    return rankings;
  },

  /**
   * Format seconds as M:SS.ms
   */
  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${m}:${String(s).padStart(2, '0')}.${ms}`;
  },
};
