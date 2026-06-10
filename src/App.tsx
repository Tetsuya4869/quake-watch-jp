import React, { useState, useEffect, useCallback } from 'react';
import EarthquakeMap from './components/EarthquakeMap';
import { Activity, Clock, ShieldAlert, List, X, AlertTriangle, RefreshCw } from 'lucide-react';
import { formatIntensity } from './utils/formatIntensity';
import { formatQuakeTime } from './utils/formatQuakeTime';
import type { Quake, P2PQuakeRecord } from './types/quake';

const API_URL = 'https://api.p2pquake.net/v2/history?codes=551&limit=10';
const POLL_INTERVAL_MS = 60_000;

function App() {
  const [quakes, setQuakes] = useState<Quake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);

  const fetchQuakes = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`APIリクエストが失敗しました (HTTP ${response.status})`);
      }
      const data: P2PQuakeRecord[] = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('APIレスポンスの形式が不正です');
      }

      const formattedQuakes: Quake[] = data.map((item) => ({
        id: item._id,
        time: item.earthquake.time,
        magnitude: item.earthquake.hypocenter.magnitude,
        maxIntensity: formatIntensity(item.earthquake.maxIntensity),
        hypocenter: item.earthquake.hypocenter.name,
        lat: item.earthquake.hypocenter.latitude,
        lng: item.earthquake.hypocenter.longitude,
      }));

      setQuakes(formattedQuakes);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch quakes:', err);
      setError('地震情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuakes();
    const interval = setInterval(fetchQuakes, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchQuakes]);

  return (
    <div className="flex h-dvh bg-slate-950 text-white font-sans overflow-hidden">

      {/* Backdrop (mobile only) */}
      {listOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-10 md:hidden"
          aria-hidden="true"
          onClick={() => setListOpen(false)}
        />
      )}

      {/* Sidebar — fixed bottom sheet on mobile, static left column on desktop */}
      <aside
        aria-label="地震情報リスト"
        className={`
          fixed inset-x-0 bottom-0 z-20 max-h-[72vh]
          md:static md:w-80 md:h-auto md:max-h-none md:flex-shrink-0
          bg-slate-900 border-t md:border-t-0 md:border-r border-slate-800
          flex flex-col shadow-2xl
          rounded-t-2xl md:rounded-none
          transition-transform duration-300 ease-out
          ${listOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
        `}
      >
        {/* Drag handle (mobile only) */}
        <div className="md:hidden flex justify-center pt-3 pb-1" aria-hidden="true">
          <div className="w-10 h-1 rounded-full bg-slate-600" />
        </div>

        <header className="px-6 py-4 md:p-6 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Activity className="text-red-500 animate-pulse" size={24} aria-hidden="true" />
            <h1 className="text-xl font-black tracking-tighter">QUAKE WATCH <span className="text-red-500">JP</span></h1>
          </div>
          <button
            className="md:hidden p-1 text-slate-400 hover:text-white transition-colors"
            aria-label="リストを閉じる"
            onClick={() => setListOpen(false)}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Recent Events</h2>

          {/* 取得済みデータがある状態でポーリングが失敗した場合の警告 */}
          {error && quakes.length > 0 && (
            <div
              role="alert"
              className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-xs"
            >
              <AlertTriangle size={14} className="shrink-0" aria-hidden="true" />
              最新情報の取得に失敗しました。前回取得したデータを表示しています。
            </div>
          )}

          {loading ? (
            <div className="p-4 text-slate-500" role="status">Loading live data...</div>
          ) : error && quakes.length === 0 ? (
            <div role="alert" className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
                <AlertTriangle size={16} aria-hidden="true" /> {error}
              </div>
              <button
                onClick={fetchQuakes}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors"
              >
                <RefreshCw size={14} aria-hidden="true" /> 再試行
              </button>
            </div>
          ) : quakes.length === 0 ? (
            <p className="p-4 text-slate-500 text-sm">表示できる地震情報がありません</p>
          ) : (
            <ul className="space-y-4">
              {quakes.map(quake => (
                <li key={quake.id}>
                  <article className="p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-500 transition-all group cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock size={12} aria-hidden="true" /> {formatQuakeTime(quake.time)}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${quake.magnitude > 5 ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        M{quake.magnitude}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm mb-1 group-hover:text-blue-400 transition-colors">{quake.hypocenter}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black italic text-white">震度 {quake.maxIntensity}</span>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="p-4 pb-safe bg-red-950/20 border-t border-red-900/30 md:pb-4">
          {error ? (
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
              <AlertTriangle size={14} aria-hidden="true" /> 接続に問題があります
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
              <ShieldAlert size={14} aria-hidden="true" /> リアルタイム監視中
            </div>
          )}
        </footer>
      </aside>

      {/* Main Map */}
      <main className="flex-1 relative" aria-label="地震マップ">
        <EarthquakeMap quakes={quakes} />

        {/* Status Overlay */}
        <div className="absolute top-4 left-4 pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-3 md:p-4 rounded-2xl shadow-2xl">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Current Status</div>
            <div className="flex items-center gap-3">
              {error ? (
                <>
                  <div className="w-3 h-3 bg-amber-500 rounded-full" aria-hidden="true" />
                  <div className="text-base md:text-lg font-bold">接続エラー</div>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-ping" aria-hidden="true" />
                  <div className="text-base md:text-lg font-bold">日本国内 全域正常</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* List toggle button (mobile only) */}
        <button
          className="md:hidden absolute bottom-safe left-1/2 -translate-x-1/2 z-10
            flex items-center gap-2 px-5 py-3
            bg-slate-900/90 backdrop-blur-md border border-slate-700
            rounded-full text-sm font-bold shadow-xl
            hover:bg-slate-800 transition-colors"
          aria-expanded={listOpen}
          onClick={() => setListOpen(true)}
        >
          <List size={16} aria-hidden="true" /> 地震リスト
        </button>
      </main>
    </div>
  );
}

export default App;
