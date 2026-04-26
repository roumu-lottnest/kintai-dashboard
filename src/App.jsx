import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const GAS_URL = "https://script.google.com/a/macros/lottnest.co.jp/s/AKfycbzJZdXcb7YvP3gQBWbaK7i0NOT3w7TPFC4w0DD_e7IEnrMwckdoQl8ClqZzIsn9lTqA/exec";

const TYPES = ["有休", "遅刻", "早退", "半休", "欠勤", "リモート"];
const TYPE_COLOR = { 有休: "#10b981", 遅刻: "#f59e0b", 早退: "#ef4444", 半休: "#8b5cf6", 欠勤: "#f43f5e", リモート: "#0ea5e9" };
const TYPE_BG   = { 有休: "#d1fae5", 遅刻: "#fef3c7", 早退: "#fee2e2", 半休: "#ede9fe", 欠勤: "#ffe4e6", リモート: "#e0f2fe" };
const TYPE_ICON = { 有休: "🏖️", 遅刻: "⏰", 早退: "🚪", 半休: "🌓", 欠勤: "❌", リモート: "🏠" };

const monthOf = d => {
  const [year, month] = d.split("-");
  return `${parseInt(year)}年${parseInt(month)}月`;
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=DM+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f0f4f8; }
  .app {
    font-family: 'Noto Sans JP', sans-serif;
    background: #f0f4f8;
    min-height: 100vh;
    color: #1e293b;
    max-width: 480px;
    margin: 0 auto;
    padding: 20px 16px 48px;
  }
  .header {
    margin-bottom: 22px;
    padding-bottom: 18px;
    border-bottom: 1px solid #e2e8f0;
    position: relative;
  }
  .header::after {
    content: '';
    position: absolute;
    bottom: -1px; left: 0;
    width: 56px; height: 2px;
    background: linear-gradient(90deg, #0ea5e9, #a855f7);
    border-radius: 2px;
  }
  .header-title {
    font-size: 20px;
    font-weight: 900;
    color: #0f172a;
    letter-spacing: -0.5px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .header-badge {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    background: #e0f2fe;
    color: #0284c7;
    padding: 3px 8px;
    border-radius: 4px;
    letter-spacing: 0.5px;
    font-weight: 500;
    border: 1px solid #bae6fd;
  }
  .header-sub {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 4px;
    font-family: 'DM Mono', monospace;
  }
  .filters {
    display: flex;
    gap: 8px;
    margin-bottom: 14px;
  }
  .filter-select {
    flex: 1;
    padding: 9px 28px 9px 10px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    background: #fff;
    color: #334155;
    font-size: 12px;
    font-family: 'Noto Sans JP', sans-serif;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2394a3b8' fill='none' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    cursor: pointer;
    box-shadow: 0 1px 3px #0000000a;
  }
  .filter-select:focus {
    border-color: #0ea5e9;
    box-shadow: 0 0 0 3px #e0f2fe;
  }
  .tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 18px;
    background: #e2e8f0;
    border-radius: 12px;
    padding: 4px;
  }
  .tab-btn {
    flex: 1;
    padding: 9px 4px;
    border-radius: 9px;
    border: none;
    cursor: pointer;
    font-size: 12px;
    font-weight: 700;
    font-family: 'Noto Sans JP', sans-serif;
    transition: all 0.18s;
    background: transparent;
    color: #94a3b8;
  }
  .tab-btn.active {
    background: #fff;
    color: #0f172a;
    box-shadow: 0 1px 6px #00000014;
  }
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 14px;
  }
  .kpi-card {
    background: #fff;
    border-radius: 14px;
    padding: 14px 8px 12px;
    border: 1px solid #e2e8f0;
    text-align: center;
    position: relative;
    overflow: hidden;
    box-shadow: 0 1px 4px #0000000a;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .kpi-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px #00000012;
  }
  .kpi-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: var(--accent);
    border-radius: 14px 14px 0 0;
  }
  .kpi-icon { font-size: 18px; margin-bottom: 4px; }
  .kpi-value {
    font-size: 26px;
    font-weight: 900;
    color: var(--accent);
    font-family: 'DM Mono', monospace;
    line-height: 1;
    margin-bottom: 4px;
  }
  .kpi-label { font-size: 10px; color: #94a3b8; font-weight: 600; }
  .chart-card {
    background: #fff;
    border-radius: 14px;
    padding: 18px 12px 14px;
    margin-bottom: 12px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 4px #0000000a;
  }
  .chart-title {
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
    margin-bottom: 14px;
    letter-spacing: 0.3px;
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .chart-title::before {
    content: '';
    display: inline-block;
    width: 3px; height: 14px;
    background: linear-gradient(180deg, #0ea5e9, #a855f7);
    border-radius: 2px;
    flex-shrink: 0;
  }
  .group-section { margin-bottom: 18px; }
  .group-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }
  .group-bar { width: 3px; height: 18px; border-radius: 3px; }
  .group-name { font-size: 14px; font-weight: 900; letter-spacing: -0.3px; }
  .group-count { font-size: 11px; color: #94a3b8; font-family: 'DM Mono', monospace; }
  .member-list {
    background: #fff;
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 4px #0000000a;
  }
  .member-row {
    padding: 14px 16px;
    border-bottom: 1px solid #f1f5f9;
    transition: background 0.15s;
  }
  .member-row:last-child { border-bottom: none; }
  .member-row:hover { background: #f8fafc; }
  .member-name {
    font-size: 13px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .member-avatar {
    width: 22px; height: 22px;
    background: linear-gradient(135deg, #e0f2fe, #ede9fe);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    border: 1px solid #bae6fd;
    flex-shrink: 0;
  }
  .type-tags { display: flex; flex-wrap: wrap; gap: 5px; }
  .type-tag {
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 3px 9px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    border: 1px solid transparent;
  }
  .log-card {
    background: #fff;
    border-radius: 14px;
    padding: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 4px #0000000a;
  }
  .log-header {
    font-size: 11px;
    font-family: 'DM Mono', monospace;
    color: #94a3b8;
    margin-bottom: 14px;
    letter-spacing: 0.3px;
  }
  .log-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 13px 0;
    border-bottom: 1px solid #f1f5f9;
  }
  .log-row:last-child { border-bottom: none; }
  .log-icon-wrap {
    width: 36px; height: 36px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .log-body { flex: 1; min-width: 0; }
  .log-top {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 6px;
  }
  .log-name { font-size: 13px; font-weight: 700; color: #0f172a; }
  .log-tag {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 4px;
  }
  .log-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .log-date {
    font-size: 11px;
    color: #94a3b8;
    font-family: 'DM Mono', monospace;
    display: flex;
    align-items: center;
    gap: 3px;
  }
  .log-detail {
    font-size: 11px;
    color: #475569;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 5px;
    padding: 2px 8px;
    font-weight: 500;
  }
  .log-no-detail { font-size: 11px; color: #cbd5e1; }
  .empty-state {
    color: #cbd5e1;
    text-align: center;
    padding: 50px 20px;
    font-size: 13px;
  }
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    gap: 12px;
    color: #94a3b8;
    font-size: 13px;
  }
  .spinner {
    width: 32px; height: 32px;
    border: 3px solid #e2e8f0;
    border-top-color: #0ea5e9;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .error-state {
    background: #fff1f2;
    border: 1px solid #fecdd3;
    border-radius: 14px;
    padding: 20px 16px;
    color: #e11d48;
    font-size: 12px;
    line-height: 1.6;
  }
  .error-state strong { display: block; font-size: 13px; margin-bottom: 6px; }
  .reload-btn {
    margin-top: 12px;
    padding: 8px 18px;
    background: #0ea5e9;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'Noto Sans JP', sans-serif;
  }
  .reload-btn:hover { background: #0284c7; }
  .last-updated {
    font-size: 10px;
    color: #94a3b8;
    font-family: 'DM Mono', monospace;
    margin-top: 2px;
  }

  /* ── PC サイドバー（モバイルでは非表示） ── */
  .pc-body { display: block; }
  .sidebar { display: none; }
  .sidebar-nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    border: none;
    cursor: pointer;
    font-family: 'Noto Sans JP', sans-serif;
    text-align: left;
  }
  .main-content { /* モバイルでは追加スタイルなし */ }

  /* ── PC レイアウト（768px以上） ───────── */
  @media (min-width: 768px) {
    .app {
      max-width: 1280px;
      padding: 0;
    }
    .header {
      margin-bottom: 0;
      padding: 16px 32px;
      background: #fff;
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .header::after {
      left: 32px;
    }
    .header-sub {
      margin-top: 0;
      font-size: 12px;
    }
    .last-updated {
      margin-top: 0;
      margin-left: auto;
      font-size: 11px;
    }
    .pc-body {
      display: flex;
      align-items: flex-start;
      min-height: calc(100vh - 66px);
    }
    .sidebar {
      display: flex;
      flex-direction: column;
      width: 220px;
      flex-shrink: 0;
      background: #fff;
      border-right: 1px solid #e2e8f0;
      padding: 28px 12px;
      min-height: calc(100vh - 66px);
    }
    .sidebar-label {
      font-size: 10px;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 1.2px;
      padding: 0 12px;
      margin-bottom: 10px;
      font-family: 'DM Mono', monospace;
      text-transform: uppercase;
    }
    .sidebar-nav-item {
      padding: 11px 14px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      background: transparent;
      color: #64748b;
      transition: all 0.15s;
      margin-bottom: 4px;
    }
    .sidebar-nav-item:hover {
      background: #f1f5f9;
      color: #1e293b;
    }
    .sidebar-nav-item.active {
      background: #e0f2fe;
      color: #0284c7;
      font-weight: 700;
    }
    .main-content {
      flex: 1;
      padding: 28px 36px;
      min-width: 0;
    }
    .tabs { display: none; }
    .kpi-grid {
      grid-template-columns: repeat(6, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .kpi-card { padding: 16px 10px 14px; }
    .kpi-value { font-size: 24px; }
    .kpi-label { font-size: 11px; }
    .filters {
      gap: 12px;
      margin-bottom: 20px;
      max-width: 600px;
    }
    .filter-select { font-size: 13px; }
    .chart-card {
      padding: 20px 16px 16px;
      margin-bottom: 14px;
    }
    .chart-title { font-size: 13px; }
  }
`;

const tooltipStyle = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  color: '#1e293b',
  fontSize: 11,
  boxShadow: '0 4px 12px #00000012',
};

const NAV_ITEMS = [
  ["overview", "📈", "概要"],
  ["member",   "👤", "社員別"],
  ["log",      "📋", "ログ"],
];

export default function App() {
  const [rawData, setRawData] = useState([]);
  const [members, setMembers] = useState([]);
  const [groupConfig, setGroupConfig] = useState([]);
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState("全グループ");
  const [selectedMember, setSelectedMember] = useState("全員");
  const [tab, setTab] = useState("overview");

  const fetchData = () => {
    setLoading(true);
    setError(null);
    fetch(GAS_URL)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        const records = data.records ?? [];
        const memberList = data.members ?? [];
        const groups = data.groups ?? [];
        const monthList = data.months ?? [];

        setRawData(records);
        setMembers(memberList);
        setGroupConfig(groups);
        setMonths(monthList);
        setSelectedMonth(prev => prev ?? monthList[monthList.length - 1] ?? null);
        setLastUpdated(new Date().toLocaleTimeString("ja-JP"));
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => { fetchData(); }, []);

  const GROUPS = groupConfig.map(g => g.name);
  const GROUP_COLOR = Object.fromEntries(groupConfig.map(g => [g.name, g.color]));

  const filteredMembers = members.filter(m => selectedGroup === "全グループ" || m.group === selectedGroup);
  const filteredMemberNames = filteredMembers.map(m => m.name);
  const filtered = rawData.filter(r =>
    monthOf(r.date) === selectedMonth &&
    filteredMemberNames.includes(r.name) &&
    (selectedMember === "全員" || r.name === selectedMember)
  );

  const count = t => filtered.filter(r => r.type === t).length;
  const kpis = TYPES.map(t => ({ label: t, value: count(t), color: TYPE_COLOR[t], icon: TYPE_ICON[t] }));

  const memberStats = filteredMembers.map(m => {
    const rows = rawData.filter(r => monthOf(r.date) === selectedMonth && r.name === m.name);
    const obj = { name: m.name.slice(0, 3) };
    TYPES.forEach(t => obj[t] = rows.filter(r => r.type === t).length);
    return obj;
  });

  const pieData = TYPES.map(t => ({ name: t, value: filtered.filter(r => r.type === t).length })).filter(d => d.value > 0);

  const trendData = months.map(mo => {
    const rows = rawData.filter(r => monthOf(r.date) === mo && filteredMemberNames.includes(r.name));
    const obj = { month: mo };
    TYPES.forEach(t => obj[t] = rows.filter(r => r.type === t).length);
    return obj;
  });

  return (
    <>
      <style>{styles}</style>
      <div className="app">

        {/* ヘッダー（PC・モバイル共通） */}
        <div className="header">
          <div className="header-title">
            <span>📊</span>
            <span>勤怠ダッシュボード</span>
            <span className="header-badge">LIVE</span>
          </div>
          <div className="header-sub">Chatwork連携 · 自動集計システム</div>
          {lastUpdated && <div className="last-updated">最終更新: {lastUpdated}</div>}
        </div>

        {/* PC: サイドバー + メインコンテンツ / モバイル: ブロック */}
        <div className="pc-body">

          {/* サイドバーナビゲーション（PCのみ表示） */}
          <aside className="sidebar">
            <div className="sidebar-label">MENU</div>
            {NAV_ITEMS.map(([t, icon, label]) => (
              <button
                key={t}
                className={`sidebar-nav-item ${tab === t ? "active" : ""}`}
                onClick={() => setTab(t)}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </aside>

          {/* メインコンテンツエリア */}
          <div className="main-content">

            {loading && (
              <div className="loading-state">
                <div className="spinner" />
                <span>データを読み込んでいます…</span>
              </div>
            )}

            {error && (
              <div className="error-state">
                <strong>データの取得に失敗しました</strong>
                {error}
                <br />
                <button className="reload-btn" onClick={fetchData}>再読み込み</button>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="filters">
                  <select className="filter-select" value={selectedMonth ?? ""}
                    onChange={e => setSelectedMonth(e.target.value)}>
                    {months.map(m => <option key={m}>{m}</option>)}
                  </select>
                  <select className="filter-select" value={selectedGroup} style={{ flex: 2 }}
                    onChange={e => { setSelectedGroup(e.target.value); setSelectedMember("全員"); }}>
                    <option>全グループ</option>
                    {GROUPS.map(g => <option key={g}>{g}</option>)}
                  </select>
                  <select className="filter-select" value={selectedMember} style={{ flex: 2 }}
                    onChange={e => setSelectedMember(e.target.value)}>
                    <option>全員</option>
                    {filteredMembers.map(m => <option key={m.name}>{m.name}</option>)}
                  </select>
                </div>

                {/* タブナビゲーション（モバイルのみ表示） */}
                <div className="tabs">
                  {NAV_ITEMS.map(([t, , label]) => (
                    <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`}
                      onClick={() => setTab(t)}>{label}</button>
                  ))}
                </div>

                {tab === "overview" && (
                  <>
                    <div className="kpi-grid">
                      {kpis.map(k => (
                        <div key={k.label} className="kpi-card" style={{ "--accent": k.color }}>
                          <div className="kpi-icon">{k.icon}</div>
                          <div className="kpi-value">{k.value}</div>
                          <div className="kpi-label">{k.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="chart-card">
                      <div className="chart-title">社員別内訳（{selectedMonth}）</div>
                      <ResponsiveContainer width="100%" height={170}>
                        <BarChart data={memberStats} margin={{ left: -28, right: 4 }}>
                          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f8fafc' }} />
                          <Legend wrapperStyle={{ fontSize: 10 }} iconSize={7} />
                          {TYPES.map(t => <Bar key={t} dataKey={t} stackId="a" fill={TYPE_COLOR[t]} />)}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="chart-card">
                      <div className="chart-title">種別割合（{selectedMonth}）</div>
                      {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={170}>
                          <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" outerRadius={65} innerRadius={28}
                              dataKey="value" label={({ name, value }) => `${name} ${value}`}
                              labelLine={false} style={{ fontSize: 10 }}>
                              {pieData.map((e, i) => <Cell key={i} fill={TYPE_COLOR[e.name]} />)}
                            </Pie>
                            <Tooltip contentStyle={tooltipStyle} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : <div className="empty-state">データなし</div>}
                    </div>
                    <div className="chart-card">
                      <div className="chart-title">月別トレンド</div>
                      <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={trendData} margin={{ left: -28, right: 4 }}>
                          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f8fafc' }} />
                          <Legend wrapperStyle={{ fontSize: 10 }} iconSize={7} />
                          {TYPES.map(t => <Bar key={t} dataKey={t} stackId="a" fill={TYPE_COLOR[t]} />)}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                )}

                {tab === "member" && (
                  <div>
                    {GROUPS.filter(g => selectedGroup === "全グループ" || g === selectedGroup).map(g => {
                      const gMembers = members.filter(m => m.group === g);
                      return (
                        <div key={g} className="group-section">
                          <div className="group-header">
                            <div className="group-bar" style={{ background: GROUP_COLOR[g] }} />
                            <span className="group-name" style={{ color: GROUP_COLOR[g] }}>{g}</span>
                            <span className="group-count">{gMembers.length}名</span>
                          </div>
                          <div className="member-list">
                            {gMembers.map(m => {
                              const rows = rawData.filter(r => monthOf(r.date) === selectedMonth && r.name === m.name);
                              return (
                                <div key={m.name} className="member-row">
                                  <div className="member-name">
                                    <div className="member-avatar">👤</div>
                                    {m.name}
                                  </div>
                                  <div className="type-tags">
                                    {TYPES.map(t => {
                                      const c = rows.filter(r => r.type === t).length;
                                      return (
                                        <div key={t} className="type-tag" style={{
                                          background: c > 0 ? TYPE_BG[t] : "#f8fafc",
                                          borderColor: c > 0 ? TYPE_COLOR[t] + "44" : "#e2e8f0",
                                          color: c > 0 ? TYPE_COLOR[t] : "#cbd5e1",
                                        }}>
                                          <span style={{ fontSize: 10 }}>{TYPE_ICON[t]}</span>
                                          <span>{t} {c > 0 ? c : "—"}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {tab === "log" && (
                  <div className="log-card">
                    <div className="log-header">
                      {selectedMonth} / {selectedGroup} / {selectedMember} — {filtered.length}件
                    </div>
                    {filtered.length === 0
                      ? <div className="empty-state">該当データなし</div>
                      : [...filtered].sort((a, b) => a.date < b.date ? -1 : 1).map((r, i) => {
                        const grp = members.find(m => m.name === r.name)?.group;
                        return (
                          <div key={i} className="log-row">
                            <div className="log-icon-wrap" style={{ background: TYPE_BG[r.type] }}>
                              {TYPE_ICON[r.type]}
                            </div>
                            <div className="log-body">
                              <div className="log-top">
                                <span className="log-name">{r.name}</span>
                                {grp && (
                                  <span className="log-tag" style={{
                                    background: GROUP_COLOR[grp] + "20",
                                    color: GROUP_COLOR[grp],
                                  }}>{grp}</span>
                                )}
                                <span className="log-tag" style={{
                                  background: TYPE_BG[r.type],
                                  color: TYPE_COLOR[r.type],
                                }}>{r.type}</span>
                              </div>
                              <div className="log-meta">
                                <span className="log-date">📅 {r.date}</span>
                                {r.detail
                                  ? <span className="log-detail">📝 {r.detail}</span>
                                  : <span className="log-no-detail">詳細なし</span>
                                }
                              </div>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                )}
              </>
            )}

          </div>{/* /main-content */}
        </div>{/* /pc-body */}

      </div>
    </>
  );
}
