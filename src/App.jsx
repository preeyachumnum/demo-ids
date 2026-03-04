import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  Activity, 
  Settings, 
  Server, 
  CheckCircle,
  Play,
  Pause,
  Cpu,
  Wifi,
  Lock
} from 'lucide-react';

// --- Mock Data Generators ---
const endpoints = [
  '/api/v1/users', '/auth/login', '/api/v2/products', '/query', '/checkout', '/system/logs'
];
const methods = ['GET', 'POST', 'PUT', 'DELETE'];
const attackPayloads = {
  SQLI: ["' OR 1=1--", "admin' --", "UNION SELECT * FROM users", "'; DROP TABLE users;--"],
  XSS: ["<script>alert(1)</script>", "javascript:eval()", "<img src=x onerror=alert('XSS')>"]
};

const generateMockIP = () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

const App = () => {
  // --- State Management ---
  const [logs, setLogs] = useState([]);
  const [isSimulating, setIsSimulating] = useState(true);
  
  // Configurations
  const [blockMode, setBlockMode] = useState(true);
  const [threshold, setThreshold] = useState(0.85);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    blocked: 0,
    sqli: 0,
    xss: 0,
    safe: 0
  });

  // --- Simulation Engine ---
  useEffect(() => {
    let interval;
    if (isSimulating) {
      interval = setInterval(() => {
        const rand = Math.random();
        let type = 'SAFE';
        let score = Math.random() * 0.4; 
        let endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

        if (rand > 0.85) {
          type = 'SQLI';
          score = 0.7 + (Math.random() * 0.3);
          endpoint += `?q=${attackPayloads.SQLI[Math.floor(Math.random() * attackPayloads.SQLI.length)]}`;
        } else if (rand > 0.7) {
          type = 'XSS';
          score = 0.7 + (Math.random() * 0.3);
          endpoint += `?search=${attackPayloads.XSS[Math.floor(Math.random() * attackPayloads.XSS.length)]}`;
        } else if (rand > 0.65) {
          type = 'SUSPICIOUS';
          score = 0.4 + (Math.random() * 0.4);
        }

        const isMalicious = score > threshold;
        const action = isMalicious && blockMode ? 'BLOCKED' : 'ALLOWED';

        const newLog = {
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric", fractionalSecondDigits: 2 }),
          ip: generateMockIP(),
          method: methods[Math.floor(Math.random() * methods.length)],
          endpoint: endpoint,
          type: type,
          score: score.toFixed(3),
          action: action
        };

        setLogs(prev => [newLog, ...prev].slice(0, 50)); 
        
        setStats(prev => ({
          total: prev.total + 1,
          blocked: action === 'BLOCKED' ? prev.blocked + 1 : prev.blocked,
          sqli: type === 'SQLI' ? prev.sqli + 1 : prev.sqli,
          xss: type === 'XSS' ? prev.xss + 1 : prev.xss,
          safe: type === 'SAFE' ? prev.safe + 1 : prev.safe,
        }));

      }, 600); 
    }
    return () => clearInterval(interval);
  }, [isSimulating, blockMode, threshold]);


  // --- UI Helpers ---
  const getScoreColor = (score) => {
    if (score >= threshold) return 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]';
    if (score >= 0.5) return 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]';
    return 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]';
  };

  const getTypeBadge = (type) => {
    switch(type) {
      case 'SQLI': return <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-md text-[10px] font-black tracking-widest uppercase shadow-[0_0_10px_rgba(244,63,94,0.15)]">SQLI</span>;
      case 'XSS': return <span className="px-2.5 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/30 rounded-md text-[10px] font-black tracking-widest uppercase shadow-[0_0_10px_rgba(249,115,22,0.15)]">XSS</span>;
      case 'SUSPICIOUS': return <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-md text-[10px] font-black tracking-widest uppercase">SUSP</span>;
      default: return <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-md text-[10px] font-black tracking-widest uppercase">SAFE</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans p-4 md:p-6 lg:p-8 selection:bg-cyan-500/30 relative overflow-hidden">
      
      {/* Background Grid Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-cyan-500 opacity-20 blur-[100px]"></div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-6 relative z-10 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
              <Lock className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" size={24} />
            </div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight">
              NEURAL<span className="text-white font-light">GATE</span> ML-IDS
            </h1>
          </div>
          <p className="text-slate-500 text-sm font-mono flex items-center gap-2">
            <Wifi size={14} className="text-cyan-500/50" />
            REALTIME THREAT INTELLIGENCE DASHBOARD
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="px-4 py-2 flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSimulating ? 'bg-cyan-400' : 'bg-slate-600'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isSimulating ? 'bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-slate-600'}`}></span>
            </span>
            <span className="text-xs font-bold tracking-widest uppercase text-slate-400 font-mono">
              Engine Status
            </span>
          </div>
          <button 
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-6 py-2 rounded-lg flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
              isSimulating 
                ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/50 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]' 
                : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]'
            }`}
          >
            {isSimulating ? <><Pause size={14}/> HALT</> : <><Play size={14}/> INITIALIZE</>}
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8 relative z-10">
        
        {/* Left: Control Panel */}
        <div className="xl:col-span-8 bg-black/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-3 mb-6">
            <Settings size={18} className="text-cyan-500" />
            <h2 className="text-sm font-bold tracking-widest uppercase text-slate-200">System Configuration</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Block Mode Toggle */}
            <div className="bg-white/[0.02] p-5 rounded-xl border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-blue-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-bold text-slate-200 text-sm">Active Defense</label>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono uppercase">Auto-drop malicious packets</p>
                </div>
                <button 
                  onClick={() => setBlockMode(!blockMode)}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 outline-none ${blockMode ? 'bg-cyan-500/20 border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-slate-800 border border-slate-700'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full transition-all duration-300 ${blockMode ? 'translate-x-7 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)]' : 'translate-x-1 bg-slate-500'}`} />
                </button>
              </div>
            </div>

            {/* Threshold Slider */}
            <div className="bg-white/[0.02] p-5 rounded-xl border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <label className="font-bold text-slate-200 text-sm">Detection Sensitivity</label>
                <div className="px-3 py-1 bg-black/50 border border-white/10 rounded-md font-mono text-cyan-400 text-sm shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                  {threshold.toFixed(2)}
                </div>
              </div>
              <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                  style={{ width: `${((threshold - 0.5) / 0.49) * 100}%` }}
                ></div>
                <input 
                  type="range" 
                  min="0.50" 
                  max="0.99" 
                  step="0.01" 
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider text-slate-500 mt-3 font-mono">
                <span>Aggressive (0.50)</span>
                <span>Lenient (0.99)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Stats Summary */}
        <div className="xl:col-span-4 relative group">
          {/* Animated Glowing Border Effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
          
          <div className="relative h-full bg-[#0a0f1c] backdrop-blur-xl p-6 rounded-2xl border border-cyan-500/20 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Cpu size={100} className="text-cyan-500" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-xs font-bold tracking-widest uppercase text-cyan-500/80 mb-2 flex items-center gap-2">
                <Activity size={14} /> Global Traffic
              </h2>
              <div className="text-5xl font-black text-white font-mono tracking-tighter mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                {stats.total.toLocaleString()}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-3 backdrop-blur-sm">
                  <div className="text-[10px] font-bold tracking-wider uppercase text-rose-500/70 mb-1">Dropped</div>
                  <div className="text-xl font-mono text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]">
                    {stats.blocked.toLocaleString()}
                  </div>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 backdrop-blur-sm">
                  <div className="text-[10px] font-bold tracking-wider uppercase text-emerald-500/70 mb-1">Passed</div>
                  <div className="text-xl font-mono text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                    {stats.safe.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal/Log Table (FR-05) */}
      <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden relative z-10">
        
        {/* Table Header Section */}
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <h2 className="text-sm font-bold tracking-widest uppercase flex items-center gap-2 text-slate-200">
            <Server size={16} className="text-blue-400" />
            Live Event Stream
          </h2>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)] animate-pulse"></span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-400/80 font-mono">Stream Active</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 text-slate-500 text-[10px] uppercase tracking-widest font-bold border-b border-white/5">
                <th className="p-4 pl-6 whitespace-nowrap">Timestamp</th>
                <th className="p-4">Source IP</th>
                <th className="p-4">Req</th>
                <th className="p-4">Target Vector</th>
                <th className="p-4">Analysis</th>
                <th className="p-4">Confidence</th>
                <th className="p-4 pr-6 text-right">Defense Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-white/5 font-mono">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-600 font-sans tracking-wide">
                    Awaiting data packets...
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr 
                    key={log.id} 
                    className={`group hover:bg-white/[0.02] transition-colors duration-200 ${
                      log.action === 'BLOCKED' ? 'bg-rose-500/[0.03] hover:bg-rose-500/[0.05]' : ''
                    } ${index === 0 ? 'animate-[pulse_1s_ease-out_1]' : ''}`}
                  >
                    <td className="p-4 pl-6 text-slate-500 text-xs whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-4 text-cyan-200/70 text-xs group-hover:text-cyan-300 transition-colors">{log.ip}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                        log.method === 'GET' ? 'bg-blue-500/10 text-blue-400' :
                        log.method === 'POST' ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-slate-500/10 text-slate-400'
                      }`}>
                        {log.method}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300 text-xs max-w-xs truncate" title={log.endpoint}>
                      <span className="opacity-50 group-hover:opacity-100 transition-opacity">&gt;_ </span>
                      {log.endpoint}
                    </td>
                    <td className="p-4">
                      {getTypeBadge(log.type)}
                    </td>
                    <td className="p-4 text-xs">
                      <span className={getScoreColor(log.score)}>{log.score}</span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {log.action === 'BLOCKED' ? (
                        <div className="inline-flex flex-col items-end">
                          <span className="flex items-center gap-1.5 text-rose-500 text-[10px] font-black tracking-widest uppercase drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                            <ShieldAlert size={12} /> BLOCKED
                          </span>
                          <span className="text-[8px] text-rose-500/50 uppercase tracking-widest mt-0.5">Connection Dropped</span>
                        </div>
                      ) : (
                        <div className="inline-flex flex-col items-end">
                          <span className="flex items-center gap-1.5 text-emerald-500/70 text-[10px] font-black tracking-widest uppercase">
                            <CheckCircle size={12} /> ALLOWED
                          </span>
                          <span className="text-[8px] text-emerald-500/40 uppercase tracking-widest mt-0.5">Traffic Forwarded</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default App;