import React from "react";
import { 
  TrendingUp, Clock, Activity, Eye, Users, Percent, RefreshCw, 
  Layers, Compass
} from "lucide-react";

interface AnalyticsPanelProps {
  analytics: {
    totalPageViews: number;
    uniqueVisitorsCount: number;
    topPaths: { path: string; count: number }[];
    browsersMap: Record<string, number>;
    chartData: { date: string; views: number }[];
    recentVisits: { id: string; path: string; timestamp: string; language: string; userAgent: string; referrer?: string }[];
  } | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function AnalyticsPanel({ analytics, isLoading, onRefresh }: AnalyticsPanelProps) {
  // Format relative timestamp helper
  const formatRelativeTime = (isoString: string) => {
    try {
      const diff = Date.now() - new Date(isoString).getTime();
      const secs = Math.floor(diff / 1000);
      if (secs < 60) return "Just now";
      const mins = Math.floor(secs / 60);
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      return `${days}d ago`;
    } catch (e) {
      return "Recent";
    }
  };

  // Safe analytics fallbacks
  const totalPageViews = analytics?.totalPageViews || 0;
  const uniqueVisitorsCount = analytics?.uniqueVisitorsCount || 0;
  const viewsPerVisitor = uniqueVisitorsCount > 0 
    ? (totalPageViews / uniqueVisitorsCount).toFixed(1) 
    : "0.0";
  const topPaths = analytics?.topPaths || [];
  const browsersMap = analytics?.browsersMap || {};
  const chartData = analytics?.chartData || [];
  const recentVisits = analytics?.recentVisits || [];

  // Parse total views for browser breakdown calculation
  const totalBrowserViews = Object.values(browsersMap).reduce((a, b) => a + b, 0) || 1;

  // Render SVG Line/Area chart dynamically
  const renderSVGChart = () => {
    if (chartData.length === 0) return null;

    const width = 600;
    const height = 180;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const maxViews = Math.max(...chartData.map(d => d.views), 5);
    const roundedMax = Math.ceil(maxViews / 5) * 5; // rounded to nearest multiple of 5

    // Map data points
    const points = chartData.map((d, index) => {
      const x = paddingLeft + (index / (chartData.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - (d.views / roundedMax) * chartHeight;
      return { x, y, ...d };
    });

    // Generate path descriptions
    let linePath = "";
    let areaPath = "";

    if (points.length > 0) {
      linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
      areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
    }

    return (
      <div className="w-full h-full relative" id="visitor-chart-container">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" referrerPolicy="no-referrer">
          {/* Gradients */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B600A8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#B600A8" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#B600A8" />
              <stop offset="50%" stopColor="#7621B0" />
              <stop offset="100%" stopColor="#BE4C00" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingTop + ratio * chartHeight;
            const val = Math.round(roundedMax * (1 - ratio));
            return (
              <g key={idx}>
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  className="stroke-white/5 stroke-[1] stroke-dasharray-[4,4]" 
                />
                <text 
                  x={paddingLeft - 8} 
                  y={y + 4} 
                  className="fill-white/30 text-[10px] font-mono font-medium text-right"
                  textAnchor="end"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Fill Area */}
          {areaPath && (
            <path d={areaPath} fill="url(#chartGradient)" />
          )}

          {/* Neon stroke line */}
          {linePath && (
            <path 
              d={linePath} 
              fill="none" 
              stroke="url(#lineGradient)" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          )}

          {/* Data nodes */}
          {points.map((p, idx) => (
            <g key={idx} className="group/node cursor-pointer">
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="4" 
                className="fill-white stroke-[#B600A8] stroke-[2] transition-all duration-200 hover:r-6" 
              />
              <text
                x={p.x}
                y={p.y - 10}
                className="fill-white text-[9px] font-bold text-center opacity-0 group-hover/node:opacity-100 transition-opacity bg-black pointer-events-none"
                textAnchor="middle"
              >
                {p.views}
              </text>
            </g>
          ))}

          {/* X axis labels */}
          {points.map((p, idx) => (
            <text 
              key={idx}
              x={p.x} 
              y={height - 8} 
              className="fill-white/30 text-[9px] font-semibold uppercase tracking-wider text-center" 
              textAnchor="middle"
            >
              {p.date}
            </text>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 animate-fadeIn" id="analytics-panel-root">
      
      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Page Views */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-[#D7E2EA]/40 uppercase tracking-wider">Page Views</p>
            <h3 className="text-3xl font-black text-white mt-1">
              {isLoading ? "..." : totalPageViews}
            </h3>
            <p className="text-[10px] text-green-400 font-medium mt-1.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live logging active
            </p>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/10">
            <Eye className="w-6 h-6" />
          </div>
        </div>

        {/* Unique Visitors */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-[#D7E2EA]/40 uppercase tracking-wider">Unique Visitors</p>
            <h3 className="text-3xl font-black text-white mt-1">
              {isLoading ? "..." : uniqueVisitorsCount}
            </h3>
            <p className="text-[10px] text-[#D7E2EA]/40 mt-1.5">
              Identified via unique sessions
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#B600A8]/10 text-[#B600A8] border border-[#B600A8]/10">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Views / Visitor Ratio */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-[#D7E2EA]/40 uppercase tracking-wider">Views / Visitor</p>
            <h3 className="text-3xl font-black text-white mt-1">
              {isLoading ? "..." : viewsPerVisitor}
            </h3>
            <p className="text-[10px] text-[#D7E2EA]/40 mt-1.5">
              Average interactive session depth
            </p>
          </div>
          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/10">
            <Percent className="w-6 h-6" />
          </div>
        </div>

        {/* Real-Time Pulse */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-[#D7E2EA]/40 uppercase tracking-wider">Platform Health</p>
            <h3 className="text-base font-black text-white mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Connected
            </h3>
            <p className="text-[10px] text-[#D7E2EA]/40 mt-2">
              Sync: Google Cloud Storage
            </p>
          </div>
          <div className="p-3 rounded-xl bg-green-500/10 text-green-400 border border-green-500/10">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* CHARTS & PAGES ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LINE/AREA CHART (2/3 col) */}
        <div className="bg-white/[0.01] border border-white/10 rounded-3xl p-6 lg:col-span-2 flex flex-col justify-between shadow-md">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">Daily Traffic Trend</h4>
              <p className="text-xs text-[#D7E2EA]/40 mt-0.5">Page views frequency over the last 7 days</p>
            </div>
            <button 
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-white/60 hover:text-white transition-all duration-200 shrink-0 cursor-pointer disabled:opacity-50"
              title="Refresh Analytics Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="h-[200px] w-full flex items-center justify-center">
            {isLoading && !analytics ? (
              <div className="text-xs text-[#D7E2EA]/40 animate-pulse flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#B600A8]" />
                Re-indexing live streams...
              </div>
            ) : chartData.length === 0 ? (
              <div className="text-xs text-[#D7E2EA]/30">No trend details recorded yet.</div>
            ) : (
              renderSVGChart()
            )}
          </div>
        </div>

        {/* TOP PATHS (1/3 col) */}
        <div className="bg-white/[0.01] border border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-md">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-1">Top Active Views</h4>
            <p className="text-xs text-[#D7E2EA]/40 mb-6">Most visited anchors & URL sections</p>
          </div>

          <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
            {topPaths.length === 0 ? (
              <div className="text-xs text-[#D7E2EA]/30 py-8 text-center">Waiting for interactions...</div>
            ) : (
              topPaths.slice(0, 5).map((tp, idx) => {
                const pct = totalPageViews > 0 ? (tp.count / totalPageViews) * 100 : 0;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono text-white/80 font-medium truncate max-w-[160px]" title={tp.path}>
                        {tp.path}
                      </span>
                      <span className="text-[#D7E2EA]/50 font-semibold">{tp.count} views</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${pct}%`,
                          background: "linear-gradient(90deg, #B600A8, #BE4C00)"
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* BROWSERS & LIVE FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* BROWSERS MAP */}
        <div className="bg-white/[0.01] border border-white/10 rounded-3xl p-6 flex flex-col shadow-md justify-between">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-1">Browsers & Agents</h4>
            <p className="text-xs text-[#D7E2EA]/40 mb-6">Distribution of visitor clients used</p>
          </div>

          <div className="space-y-3.5">
            {Object.keys(browsersMap).length === 0 ? (
              <div className="text-xs text-[#D7E2EA]/30 py-8 text-center">No agent data logged.</div>
            ) : (
              Object.entries(browsersMap).map(([browser, count], idx) => {
                const pct = Math.round((count / totalBrowserViews) * 100);
                return (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full" 
                        style={{
                          backgroundColor: idx === 0 ? "#B600A8" : idx === 1 ? "#7621B0" : idx === 2 ? "#BE4C00" : "#4A5568"
                        }}
                      />
                      <span className="text-xs font-semibold text-white/80">{browser}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-white">{count}</span>
                      <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-[#D7E2EA]/60 font-semibold">{pct}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* LIVE ACTIVITY FEED (2/3 col) */}
        <div className="bg-white/[0.01] border border-white/10 rounded-3xl p-6 lg:col-span-2 flex flex-col shadow-md">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">Live Activity Logs</h4>
              <p className="text-xs text-[#D7E2EA]/40 mt-0.5">Real-time terminal-grade record of visitor hits</p>
            </div>
            <div className="flex items-center gap-1.5 bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-500/15">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Stream Live
            </div>
          </div>

          <div className="overflow-y-auto max-h-[260px] space-y-3 pr-1">
            {recentVisits.length === 0 ? (
              <div className="text-xs text-[#D7E2EA]/30 py-12 text-center font-mono">
                &gt;_ INITIALIZING DATA LOGGERS... WAITING FOR INBOUND VIEW...
              </div>
            ) : (
              recentVisits.map((v, idx) => (
                <div 
                  key={v.id || idx} 
                  className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs font-mono transition-all hover:bg-white/[0.04]"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-white/5 text-[#D7E2EA]/60 shrink-0 border border-white/5 mt-0.5">
                      {v.path.includes("projects") ? (
                        <Layers className="w-3.5 h-3.5" />
                      ) : (
                        <Compass className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold tracking-tight truncate max-w-[150px] sm:max-w-[280px]">
                          {v.path}
                        </span>
                        <span className="text-[10px] text-[#B600A8] font-bold tracking-widest px-1.5 py-0.5 bg-[#B600A8]/10 rounded border border-[#B600A8]/10 uppercase">
                          HIT
                        </span>
                      </div>
                      <p className="text-[10px] text-[#D7E2EA]/40 truncate mt-1 max-w-[250px] sm:max-w-[450px]">
                        Ref: <span className="text-[#BE4C00] font-semibold">{v.referrer || "Direct / Organic"}</span> | Agent: {v.userAgent || "Anonymous Client"}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 sm:gap-1.5 text-[10px] shrink-0">
                    <span className="text-white/60 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#D7E2EA]/30" />
                      {formatRelativeTime(v.timestamp)}
                    </span>
                    <span className="text-[#D7E2EA]/30 bg-white/5 px-2 py-0.5 rounded-full font-bold">
                      Lang: {v.language.substring(0, 5)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
