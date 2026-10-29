import React, { useState } from 'react';
import type { AlgorithmResult } from '../types/scheduling';
import { getProcessColorByName } from '../utils/schedulingAlgorithms';
import { GanttChart } from './GanttChart';

interface ResultTableProps {
  result: AlgorithmResult;
  isBest?: boolean;
  isTableCollapsible?: boolean;
  isTableOpen?: boolean;
  onToggleTable?: () => void;
  defaultTableOpen?: boolean;
  noGanttScroll?: boolean;
}

export const ResultTable: React.FC<ResultTableProps> = ({
  result,
  isBest,
  isTableCollapsible = false,
  isTableOpen: controlledOpen,
  onToggleTable,
  defaultTableOpen = false,
  noGanttScroll = true,
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultTableOpen);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleToggle = () => {
    if (onToggleTable) {
      onToggleTable();
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  const tableContent = (
    <div className="table-responsive">
      <table className="clean-table">
        <thead>
          <tr>
            <th>Process</th>
            <th>Arrival Time (AT)</th>
            <th>Burst Time (BT)</th>
            <th>Start Time (ST)</th>
            <th>Completion Time (CT)</th>
            <th>Turnaround Time (TAT)</th>
            <th>Waiting Time (WT)</th>
          </tr>
        </thead>
        <tbody>
          {result.processResults.map((proc) => (
            <tr key={proc.id}>
              <td className="font-semibold">
                <span
                  className="color-dot inline-dot"
                  style={{ backgroundColor: getProcessColorByName(proc.name) }}
                />
                {proc.name}
              </td>
              <td>
                <span className="badge-fixed">{proc.arrivalTime}</span>
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
            <td colSpan={5} className="text-right font-bold">Averages:</td>
            <td className="tat-text font-bold">AVG TAT: {result.avgTurnaroundTime}</td>
            <td><span className="wt-badge highlight">AVG WT: {result.avgWaitingTime}</span></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

  return (
    <div className={`card clean-card ${isBest ? 'is-best' : ''}`}>
      <div className="card-header flex-between">
        <div>
          <h3>{result.algorithmName}</h3>
          <p className="card-desc">Detailed process execution schedule metrics</p>
        </div>
        {isBest && <span className="winner-tag">🏆 Best Performance</span>}
      </div>

      {/* Gantt Chart Timeline */}
      {result.ganttSegments && result.ganttSegments.length > 0 && (
        <GanttChart
          segments={result.ganttSegments}
          totalTime={result.totalExecutionTime}
          algorithmName={result.algorithmName}
          noScroll={noGanttScroll}
        />
      )}

      {/* Metrics Table (Rendered directly or collapsible inside formula-accordion) */}
      {isTableCollapsible ? (
        <div className="formula-accordion table-accordion">
          <div
            className="accordion-header flex-between"
            onClick={handleToggle}
            style={{ cursor: 'pointer' }}
          >
            <div className="flex-center gap-2">
              <span className="accordion-title-icon">📋</span>
              <h4 className="accordion-title-text">
                ตารางรายละเอียดตัวชี้วัด (Detailed Metrics Table) - {result.algorithmName}
              </h4>
              <span className="badge-pill">
                {isOpen ? 'ซ่อนตาราง' : 'แสดงตาราง'}
              </span>
            </div>
            <div className="flex-center gap-2">
              {!isOpen && (
                <div className="accordion-stats-preview">
                  <span className="preview-item">
                    AVG WT: <strong className="preview-val wt-text">{result.avgWaitingTime}</strong>
                  </span>
                  <span className="preview-divider">|</span>
                  <span className="preview-item">
                    AVG TAT: <strong className="preview-val tat-text">{result.avgTurnaroundTime}</strong>
                  </span>
                </div>
              )}
              <span className="arrow-icon">{isOpen ? '▲' : '▼'}</span>
            </div>
          </div>

          {isOpen && (
            <div className="margin-top">
              {tableContent}
            </div>
          )}
        </div>
      ) : (
        tableContent
      )}
    </div>
  );
};

