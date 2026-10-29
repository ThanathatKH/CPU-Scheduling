import React, { useState } from 'react';
import type { AlgorithmResult } from '../types/scheduling';
import { ResultTable } from './ResultTable';

interface AlgorithmComparisonProps {
  fcfs: AlgorithmResult;
  sjf: AlgorithmResult;
  rr: AlgorithmResult;
}

export const AlgorithmComparison: React.FC<AlgorithmComparisonProps> = ({ fcfs, sjf, rr }) => {
  const results = [fcfs, sjf, rr];

  // Track accordion open/close state for summary table (default: closed)
  const [isSummaryTableOpen, setIsSummaryTableOpen] = useState<boolean>(false);

  // Track accordion open/close state for each algorithm's detailed metrics table (default: closed)
  const [openTables, setOpenTables] = useState<Record<string, boolean>>({
    fcfs: false,
    sjf: false,
    rr: false,
  });

  const toggleTable = (key: string) => {
    setOpenTables((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const areAllOpen = Object.values(openTables).every(Boolean);

  const toggleAllTables = () => {
    const nextState = !areAllOpen;
    setOpenTables({
      fcfs: nextState,
      sjf: nextState,
      rr: nextState,
    });
  };

  // Calculate total waiting times
  const resultsWithTotals = results.map((res) => {
    const totalWT = res.processResults.reduce((acc, curr) => acc + curr.waitingTime, 0);
    return {
      ...res,
      totalWT,
    };
  });

  const minAvgWT = Math.min(...resultsWithTotals.map((r) => r.avgWaitingTime));
  const minAvgTAT = Math.min(...resultsWithTotals.map((r) => r.avgTurnaroundTime));

  const maxAvgWT = Math.max(...resultsWithTotals.map((r) => r.avgWaitingTime), 0.01);
  const maxAvgTAT = Math.max(...resultsWithTotals.map((r) => r.avgTurnaroundTime), 0.01);

  const getAlgoColor = (key: string): string => {
    if (key === 'fcfs') return '#6366f1'; // Indigo
    if (key === 'sjf') return '#a855f7'; // Purple
    if (key === 'rr') return '#06b6d4'; // Cyan
    return '#10b981';
  };

  const getAlgoShortName = (key: string): string => {
    if (key === 'fcfs') return 'FCFS';
    if (key === 'sjf') return 'SJF';
    if (key === 'rr') return 'RR';
    return key.toUpperCase();
  };

  return (
    <div className="comparison-view-container">
      {/* 1. Algorithm Comparison Summary Section (Graphs & Collapsible Table) */}
      <div className="card clean-card summary-table-card">
        <div className="card-header flex-between">
          <div>
            <h3>🏆 Algorithm Comparison Summary</h3>
            <p className="card-desc">Overall evaluation of Waiting Time and Turnaround Time across all algorithms</p>
          </div>
        </div>

        {/* Comparison Bar Charts (Waiting Time & Turnaround Time) */}
        <div className="comparison-charts-grid">
          {/* Average Waiting Time Chart Card */}
          <div className="metric-chart-card">
            <div className="metric-chart-header">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="metric-chart-icon"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <h4 className="metric-chart-title">Average Waiting Time</h4>
            </div>
            <div className="metric-bars-list">
              {resultsWithTotals.map((res) => {
                const isBest = res.avgWaitingTime === minAvgWT;
                const widthPercent = Math.min(100, Math.max(8, (res.avgWaitingTime / maxAvgWT) * 95));
                return (
                  <div key={`wt-${res.algorithmKey}`} className="metric-bar-item">
                    <div className="metric-bar-meta">
                      <span className="metric-algo-name">{getAlgoShortName(res.algorithmKey)}</span>
                      <div className="metric-value-wrap">
                        <span className="metric-num-value">{res.avgWaitingTime.toFixed(2)}</span>
                        {isBest && <span className="metric-best-pill">BEST</span>}
                      </div>
                    </div>
                    <div className="metric-track">
                      <div
                        className="metric-fill-bar"
                        style={{
                          width: `${widthPercent}%`,
                          backgroundColor: getAlgoColor(res.algorithmKey),
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Average Turnaround Time Chart Card */}
          <div className="metric-chart-card">
            <div className="metric-chart-header">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="metric-chart-icon"
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <h4 className="metric-chart-title">Average Turnaround Time</h4>
            </div>
            <div className="metric-bars-list">
              {resultsWithTotals.map((res) => {
                const isBest = res.avgTurnaroundTime === minAvgTAT;
                const widthPercent = Math.min(100, Math.max(8, (res.avgTurnaroundTime / maxAvgTAT) * 95));
                return (
                  <div key={`tat-${res.algorithmKey}`} className="metric-bar-item">
                    <div className="metric-bar-meta">
                      <span className="metric-algo-name">{getAlgoShortName(res.algorithmKey)}</span>
                      <div className="metric-value-wrap">
                        <span className="metric-num-value">{res.avgTurnaroundTime.toFixed(2)}</span>
                        {isBest && <span className="metric-best-pill">BEST</span>}
                      </div>
                    </div>
                    <div className="metric-track">
                      <div
                        className="metric-fill-bar"
                        style={{
                          width: `${widthPercent}%`,
                          backgroundColor: getAlgoColor(res.algorithmKey),
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dedicated Algorithm Comparison Summary Table in formula-accordion */}
        <div className="formula-accordion table-accordion summary-table-accordion">
          <div
            className="accordion-header flex-between"
            onClick={() => setIsSummaryTableOpen(!isSummaryTableOpen)}
            style={{ cursor: 'pointer' }}
          >
            <div className="flex-center gap-2">
              <span className="accordion-title-icon">📋</span>
              <h4 className="accordion-title-text">
                ตารางสรุปผลเปรียบเทียบเชิงตัวเลข (Algorithm Comparison Summary Table)
              </h4>
              <span className="badge-pill">
                {isSummaryTableOpen ? 'ซ่อนตาราง' : 'แสดงตาราง'}
              </span>
            </div>
            <div className="flex-center gap-2">
              {!isSummaryTableOpen && (
                <span className="accordion-summary-hint">
                  🥇 Best WT: <strong>{getAlgoShortName(resultsWithTotals.find((r) => r.avgWaitingTime === minAvgWT)?.algorithmKey || '')} ({minAvgWT})</strong>
                </span>
              )}
              <span className="arrow-icon">{isSummaryTableOpen ? '▲' : '▼'}</span>
            </div>
          </div>

          {isSummaryTableOpen && (
            <div className="table-responsive margin-top">
              <table className="clean-table comparison-summary-table">
                <thead>
                  <tr>
                    <th>Algorithm Name</th>
                    <th>Total Waiting Time (Sum WT)</th>
                    <th>Average Waiting Time (AVG WT)</th>
                    <th>Average Turnaround Time (AVG TAT)</th>
                    <th>Performance Status</th>
                  </tr>
                </thead>
                <tbody>
                  {resultsWithTotals.map((res) => {
                    const isBest = res.avgWaitingTime === minAvgWT;
                    return (
                      <tr key={res.algorithmKey} className={isBest ? 'best-row' : ''}>
                        <td className="font-semibold">
                          {res.algorithmName}
                        </td>
                        <td className="wt-badge">{res.totalWT} units</td>
                        <td>
                          <span className={`wt-badge ${isBest ? 'highlight' : ''}`}>
                            {res.avgWaitingTime} units
                          </span>
                        </td>
                        <td className="tat-text">{res.avgTurnaroundTime} units</td>
                        <td>
                          {isBest ? (
                            <span className="winner-tag">🥇 Best (Lowest AVG WT)</span>
                          ) : (
                            <span className="status-standard">Standard</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 2. Visual Gantt Chart Comparison Section Header with Controls */}
      <div className="comparison-section-bar flex-between">
        <div>
          <h3 className="comparison-section-title">
            📊 แผนผัง Gantt Chart เปรียบเทียบทั้ง 3 อัลกอริทึม
          </h3>
          <p className="comparison-section-subtitle">
            เปรียบเทียบ Timeline การใช้ CPU แบบไม่มี Scroll (Fit-to-width) สเกลเวลาเดียวกันชัดเจน
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-toggle-all"
          onClick={toggleAllTables}
          title={areAllOpen ? 'ซ่อนตารางรายละเอียดของทั้ง 3 อัลกอริทึม' : 'แสดงตารางรายละเอียดของทั้ง 3 อัลกอริทึม'}
        >
          {areAllOpen ? '📁 ซ่อนตารางรายละเอียดทั้งหมด' : '📂 แสดงตารางรายละเอียดทั้งหมด'}
        </button>
      </div>

      {/* 3. All 3 Algorithm Detailed Result Cards Stacked (Gantt Chart No-Scroll + Table in Accordion) */}
      <div className="tables-stacked-grid">
        {resultsWithTotals.map((res) => (
          <ResultTable
            key={res.algorithmKey}
            result={res}
            isBest={res.avgWaitingTime === minAvgWT}
            isTableCollapsible={true}
            isTableOpen={!!openTables[res.algorithmKey]}
            onToggleTable={() => toggleTable(res.algorithmKey)}
            noGanttScroll={true}
          />
        ))}
      </div>
    </div>
  );
};
