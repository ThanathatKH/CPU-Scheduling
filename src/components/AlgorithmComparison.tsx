import React from 'react';
import type { AlgorithmResult } from '../types/scheduling';
import { ResultTable } from './ResultTable';

interface AlgorithmComparisonProps {
  fcfs: AlgorithmResult;
  sjf: AlgorithmResult;
  rr: AlgorithmResult;
}

export const AlgorithmComparison: React.FC<AlgorithmComparisonProps> = ({ fcfs, sjf, rr }) => {
  const results = [fcfs, sjf, rr];

  // Calculate total waiting times
  const resultsWithTotals = results.map((res) => {
    const totalWT = res.processResults.reduce((acc, curr) => acc + curr.waitingTime, 0);
    return {
      ...res,
      totalWT,
    };
  });

  const minAvgWT = Math.min(...resultsWithTotals.map((r) => r.avgWaitingTime));

  return (
    <div className="comparison-view-container">
      {/* 1. All 3 Algorithm Detailed Result Tables Stacked / Grid */}
      <div className="tables-stacked-grid">
        {resultsWithTotals.map((res) => (
          <ResultTable
            key={res.algorithmKey}
            result={res}
            isBest={res.avgWaitingTime === minAvgWT}
          />
        ))}
      </div>

      {/* 2. Dedicated Algorithm Comparison Summary Table */}
      <div className="card clean-card summary-table-card">
        <div className="card-header flex-between">
          <div>
            <h3>🏆 Algorithm Comparison Summary Table</h3>
            <p className="card-desc">Overall evaluation of Waiting Time across all algorithms</p>
          </div>
        </div>

        <div className="table-responsive">
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
      </div>
    </div>
  );
};
