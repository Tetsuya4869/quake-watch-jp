import React, { useState, useEffect } from 'react';
import EarthquakeMap from './components/EarthquakeMap';
import { Activity, Clock, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';

interface Quake {
  id: string;
  time: string;
  magnitude: number;
  maxIntensity: string;
  hypocenter: string;
  lat: number;
  lng: number;
}

function App() {
  const [quakes, setQuakes] = useState<Quake[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuakes = async () => {
    try {
      const response = await fetch('https://api.p2pquake.net/v2/history?codes=551&limit=10');
      const data = await response.json();
      
      const formattedQuakes = data.map((item: any) => ({
        id: item._id,
        time: item.earthquake.time,
        magnitude: item.earthquake.hypocenter.magnitude,
        maxIntensity: formatIntensity(item.earthquake.maxIntensity),
        hypocenter: item.earthquake.hypocenter.name,
        lat: item.earthquake.hypocenter.latitude,
        lng: item.earthquake.hypocenter.longitude,
      }));
      
      setQuakes(formattedQuakes);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch quakes:', error);
    }
  };

  const formatIntensity = (intensity: number) => {
    const mapping: Record<number, string> = {
      10: '1', 20: '2', 30: '3', 40: '4',
      45: '5弱', 50: '5強', 55: '6弱', 60: '6強', 70: '7'
    };
    return mapping[intensity] || '不明';
  };

  useEffect(() => {
    fetchQuakes();
    const interval = setInterval(fetchQuakes, 60000); // 1 min update
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-slate-950 text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col z-10 shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <Activity className="text-red-500 animate-pulse" size={24} />
          <h1 className="text-xl font-black tracking-tighter">QUAKE WATCH <span className="text-red-500">JP</span></h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Recent Events</h2>
          {loading ? (
            <div className="p-4 text-slate-500">Loading live data...</div>
          ) : (
            quakes.map(quake => (
              <div key={quake.id} className="p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-500 transition-all group cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={12} /> {format(new Date(quake.time.replace(/\//g, '-')), 'MM/dd HH:mm')}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${quake.magnitude > 5 ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    M{quake.magnitude}
                  </span>
                </div>
                <h3 className="font-bold text-sm mb-1 group-hover:text-blue-400 transition-colors">{quake.hypocenter}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black italic text-white">震度 {quake.maxIntensity}</span>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 bg-red-950/20 border-t border-red-900/30">
          <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
            <ShieldAlert size={14} /> リアルタイム監視中
          </div>
        </div>
      </div>

      {/* Main Map */}
      <div className="flex-1 relative">
        <EarthquakeMap quakes={quakes} />
        
        {/* Header Overlay */}
        <div className="absolute top-6 left-6 pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Current Status</div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-ping" />
              <div className="text-lg font-bold">日本国内 全域正常</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
