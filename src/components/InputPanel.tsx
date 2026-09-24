import React from 'react';
import type { ProcessInput } from '../types/scheduling';
import { getProcessColor } from '../utils/schedulingAlgorithms';

interface InputPanelProps {
  processes: ProcessInput[];
  timeQuantum: number | string;
  selectedAlgorithm: 'fcfs' | 'sjf' | 'rr';
  errors: string[];
  onProcessChange: (id: string, field: keyof ProcessInput, value: string | number) => void;
  onAddProcess: () => void;
  onRemoveProcess: (id: string) => void;
  onRandomizeBT: () => void;
  onTimeQuantumChange: (value: string) => void;
  onAlgorithmChange: (algo: 'fcfs' | 'sjf' | 'rr') => void;
  onProcessExecute: () => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  processes,
  timeQuantum,
  selectedAlgorithm,
  errors,
  onProcessChange,
  onAddProcess,
  onRemoveProcess,
  onRandomizeBT,
  onTimeQuantumChange,
  onAlgorithmChange,
  onProcessExecute,
}) => {
  return (
    <div className="card clean-card input-card">
      <div className="card-header flex-between">
        <div>
          <h2>⚡ CPU Process Configuration</h2>
          <p className="card-desc">Set processes, burst times, and algorithm choice (Arrival Time = 0)</p>
        </div>
        <div className="action-row">
          <button type="button" className="btn btn-secondary" onClick={onRandomizeBT}>
            🎲 Random BTs
          </button>
          <button type="button" className="btn btn-primary" onClick={onAddProcess}>
            ➕ Add Process ({processes.length})
          </button>
        </div>
      </div>

      {/* Validation Error Banner */}
      {errors.length > 0 && (
        <div className="alert-error">
          <span className="alert-icon">⚠️</span>
          <div className="alert-content">
            {errors.map((err, idx) => (
              <div key={idx}>{err}</div>
            ))}
          </div>
        </div>
      )}

      <div className="input-grid">
        <div className="table-responsive">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Process</th>
                <th>Arrival Time</th>
                <th>Burst Time (BT)</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((p, index) => (
                <tr key={p.id}>
                  <td className="font-semibold">
                    <span
                      className="color-dot inline-dot"
                      style={{ backgroundColor: getProcessColor(index) }}
                    />
                    {p.name}
                  </td>
                  <td>
                    <span className="badge-fixed">0 (Fixed)</span>
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      className="input-number"
                      value={p.burstTime}
                      onChange={(e) => onProcessChange(p.id, 'burstTime', e.target.value)}
                      placeholder="BT > 0"
                    />
                  </td>
                  <td className="text-center">
                    <button
                      type="button"
                      className="btn-icon-danger"
                      onClick={() => onRemoveProcess(p.id)}
                      disabled={processes.length <= 3}
                      title={processes.length <= 3 ? 'Minimum 3 processes required' : 'Remove process'}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="side-controls-column">
          {/* Algorithm Dropdown Selection */}
          <div className="control-box">
            <label htmlFor="algoSelect" className="control-label">
              เลือกอัลกอริทึม (Algorithm)
            </label>
            <select
              id="algoSelect"
              className="select-dropdown"
              value={selectedAlgorithm}
              onChange={(e) => onAlgorithmChange(e.target.value as 'fcfs' | 'sjf' | 'rr')}
            >
              <option value="fcfs">First-Come, First-Served: FCFS</option>
              <option value="sjf">Shortest Job First: SJF</option>
              <option value="rr">Round Robin: RR</option>
            </select>
          </div>

          {/* Round Robin Time Quantum */}
          {selectedAlgorithm === 'rr' && (
            <div className="control-box">
              <label htmlFor="timeQuantum" className="control-label">
                Round Robin Quantum (Q)
              </label>
              <div className="quantum-input-wrap">
                <input
                  id="timeQuantum"
                  type="number"
                  min="1"
                  step="1"
                  className="input-number quantum-input"
                  value={timeQuantum}
                  onChange={(e) => onTimeQuantumChange(e.target.value)}
                  placeholder="e.g. 2"
                />
                <span className="quantum-unit">units</span>
              </div>
            </div>
          )}

          {/* Process Execution Button */}
          <button
            type="button"
            className="btn btn-process"
            onClick={onProcessExecute}
          >
            🚀 Process (คำนวณผลลัพธ์)
          </button>
        </div>
      </div>
    </div>
  );
};
