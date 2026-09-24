import React from 'react';
import type { AlgorithmResult } from '../types/scheduling';
import { getProcessColor } from '../utils/schedulingAlgorithms';

interface ResultTableProps {
  result: AlgorithmResult;
  isBest?: boolean;
}

export const ResultTable: React.FC<ResultTableProps> = ({ result, isBest }) => {
  return (
    <div className={`card clean-card ${isBest ? 'is-best' : ''}`}>
      <div className="card-header flex-between">
        <div>
          <h3>{result.algorithmName}</h3>
          <p className="card-desc">Detailed process execution schedule metrics</p>
        </div>
        {isBest && <span className="winner-tag">🏆 Best Performance</span>}
      </div>

      <div className="table-responsive">
        <table className="clean-table">
          <thead>
            <tr>
              <th>Process</th>
              <th>Burst Time (BT)</th>
              <th>Start Time (ST)</th>
              <th>Completion Time (CT)</th>
              <th>Turnaround Time (TAT)</th>
              <th>Waiting Time (WT)</th>
            </tr>
          </thead>
          <tbody>
            {result.processResults.map((proc, index) => (
              <tr key={proc.id}>
                <td className="font-semibold">
                  <span
                    className="color-dot inline-dot"
                    style={{ backgroundColor: getProcessColor(index) }}
                  />
                  {proc.name}
                </td>
                <td>{proc.burstTime}</td>
                <td>{proc.startTime}</td>
                <td>{proc.completionTime}</td>
                <td className="tat-text">{proc.turnaroundTime}</td>
                <td className="wt-badge">{proc.waitingTime}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="summary-row">
              <td colSpan={4} className="text-right font-bold">Averages:</td>
              <td className="tat-text font-bold">AVG TAT: {result.avgTurnaroundTime}</td>
              <td><span className="wt-badge highlight">AVG WT: {result.avgWaitingTime}</span></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
