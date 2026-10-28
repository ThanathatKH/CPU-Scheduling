import React from 'react';
import type { GanttSegment } from '../types/scheduling';
import { getProcessColorByName } from '../utils/schedulingAlgorithms';

interface GanttChartProps {
  segments: GanttSegment[];
  totalTime: number;
  algorithmName?: string;
}

export const GanttChart: React.FC<GanttChartProps> = ({ segments, totalTime }) => {
  if (!segments || segments.length === 0 || totalTime <= 0) {
    return null;
  }

  // Extract unique processes in this Gantt Chart for the legend
  const uniqueProcesses = Array.from(
    new Map(segments.map((seg) => [seg.processName, seg])).values()
  ).sort((a, b) => a.processName.localeCompare(b.processName, undefined, { numeric: true }));

  // Collect all unique time boundary points for tick marks
  const timePoints = [0, ...segments.map((s) => s.endTime)];
  const uniqueTimePoints = Array.from(new Set(timePoints));

  return (
    <div className="gantt-wrapper">
      {/* Header & Process Legend */}
      <div className="gantt-header">
        <div className="gantt-title">
          <span>📊</span>
          <span>CPU Execution Gantt Chart</span>
        </div>
        <div className="gantt-legend">
          {uniqueProcesses.map((proc) => {
            const color = getProcessColorByName(proc.processName);
            return (
              <span key={proc.processName} className="gantt-legend-item">
                <span className="color-dot inline-dot" style={{ backgroundColor: color }} />
                <span>{proc.processName}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Scrollable Container for the Gantt bar and timeline */}
      <div className="gantt-scrollable-container">
        {/* Colorful Segmented Timeline Bar */}
        <div
          className="gantt-chart-bar"
          style={{ minWidth: `${Math.max(480, totalTime * 28)}px` }}
        >
          {segments.map((seg, idx) => {
            const duration = seg.endTime - seg.startTime;
            const color = getProcessColorByName(seg.processName);
            return (
              <div
                key={`${seg.processName}-${idx}-${seg.startTime}`}
                className="gantt-segment"
                style={{
                  flex: duration,
                  backgroundColor: color,
                }}
                title={`${seg.processName}: เวลา ${seg.startTime} ถึง ${seg.endTime} (ใช้ CPU ${duration} หน่วย)`}
              >
                <span className="gantt-seg-name">{seg.processName}</span>
                <span className="gantt-seg-duration">{duration}</span>
              </div>
            );
          })}
        </div>

        {/* Time Markers Axis below the bar */}
        <div
          className="gantt-timeline-axis"
          style={{ minWidth: `${Math.max(480, totalTime * 28)}px` }}
        >
          {uniqueTimePoints.map((time, idx) => {
            const percent = (time / totalTime) * 100;
            // Prevent clipping at the extreme left (0%) and right (100%)
            let transform = 'translateX(-50%)';
            if (idx === 0) transform = 'translateX(0)';
            else if (idx === uniqueTimePoints.length - 1) transform = 'translateX(-100%)';

            return (
              <div
                key={time}
                className="gantt-time-tick"
                style={{
                  left: `${percent}%`,
                  transform,
                }}
              >
                <div className="gantt-tick-mark" />
                <span className="gantt-time-label">{time}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Execution Sequence Trace */}
      <div className="gantt-sequence-wrap">
        <span className="gantt-sequence-label">ลำดับการทำงาน (CPU Execution Sequence):</span>
        <div className="gantt-chips-list">
          {segments.map((seg, idx) => {
            const color = getProcessColorByName(seg.processName);
            return (
              <span key={`chip-${idx}`} className="gantt-chip">
                <span
                  className="color-dot inline-dot"
                  style={{ backgroundColor: color, width: '8px', height: '8px' }}
                />
                <span className="font-semibold">{seg.processName}</span>
                <span className="gantt-chip-time">[{seg.startTime}→{seg.endTime}]</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
