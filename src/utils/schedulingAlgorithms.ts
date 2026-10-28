import type { ProcessInput, ProcessResult, AlgorithmResult, GanttSegment } from '../types/scheduling';

// Color palette for processes
export const PROCESS_COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#8b5cf6', // Purple
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#ef4444', // Red
  '#84cc16', // Lime
];

export const getProcessColor = (index: number): string => {
  return PROCESS_COLORS[index % PROCESS_COLORS.length];
};

/**
 * Get distinct color for a process consistently based on its name (P1, P2, ...)
 */
export const getProcessColorByName = (name: string): string => {
  const match = name.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    return PROCESS_COLORS[(num - 1 + PROCESS_COLORS.length) % PROCESS_COLORS.length];
  }
  return PROCESS_COLORS[0];
};

/**
 * Validate input processes and time quantum
 */
export const validateInputs = (
  processes: ProcessInput[],
  timeQuantum: number | string
): string[] => {
  const errors: string[] = [];

  if (processes.length < 3) {
    errors.push('At least 3 processes (P1, P2, P3) are required.');
  }

  processes.forEach((p, index) => {
    const bt = typeof p.burstTime === 'string' ? parseFloat(p.burstTime) : p.burstTime;
    if (p.burstTime === '' || isNaN(bt)) {
      errors.push(`Process ${p.name} (Row ${index + 1}): Burst Time cannot be empty.`);
    } else if (!Number.isInteger(bt) || bt <= 0) {
      errors.push(`Process ${p.name} (Row ${index + 1}): Burst Time must be a positive integer (> 0).`);
    }
  });

  const tq = typeof timeQuantum === 'string' ? parseFloat(timeQuantum) : timeQuantum;
  if (timeQuantum === '' || isNaN(tq)) {
    errors.push('Round Robin Time Quantum cannot be empty.');
  } else if (!Number.isInteger(tq) || tq <= 0) {
    errors.push('Round Robin Time Quantum must be a positive integer (> 0).');
  }

  return errors;
};

/**
 * 1. FCFS (First-Come, First-Served) Algorithm
 */
export const calculateFCFS = (processes: ProcessInput[]): AlgorithmResult => {
  let currentTime = 0;
  const processResults: ProcessResult[] = [];
  const ganttSegments: GanttSegment[] = [];

  processes.forEach((p) => {
    const bt = Number(p.burstTime);
    const startTime = currentTime;
    const completionTime = startTime + bt;
    const turnaroundTime = completionTime - p.arrivalTime; // AT = 0
    const waitingTime = turnaroundTime - bt;

    ganttSegments.push({
      processId: p.id,
      processName: p.name,
      startTime,
      endTime: completionTime,
    });

    processResults.push({
      id: p.id,
      name: p.name,
      arrivalTime: p.arrivalTime,
      burstTime: bt,
      startTime,
      completionTime,
      turnaroundTime,
      waitingTime,
    });

    currentTime = completionTime;
  });

  const totalWT = processResults.reduce((acc, curr) => acc + curr.waitingTime, 0);
  const totalTAT = processResults.reduce((acc, curr) => acc + curr.turnaroundTime, 0);
  const n = processResults.length;

  return {
    algorithmName: 'FCFS (First-Come, First-Served)',
    algorithmKey: 'fcfs',
    processResults,
    ganttSegments,
    avgWaitingTime: Number((totalWT / n).toFixed(2)),
    avgTurnaroundTime: Number((totalTAT / n).toFixed(2)),
    totalExecutionTime: currentTime,
  };
};

/**
 * 2. SJF (Shortest Job First - Non-preemptive) Algorithm
 */
export const calculateSJF = (processes: ProcessInput[]): AlgorithmResult => {
  const indexedProcesses = processes.map((p, originalIndex) => ({
    ...p,
    burstTimeNum: Number(p.burstTime),
    originalIndex,
  }));

  // Tie-breaker rule: if BT is equal, use original process order P1–Pn
  const sortedProcesses = [...indexedProcesses].sort((a, b) => {
    if (a.burstTimeNum !== b.burstTimeNum) {
      return a.burstTimeNum - b.burstTimeNum;
    }
    return a.originalIndex - b.originalIndex;
  });

  let currentTime = 0;
  const resultMap = new Map<string, ProcessResult>();
  const ganttSegments: GanttSegment[] = [];

  sortedProcesses.forEach((p) => {
    const bt = p.burstTimeNum;
    const startTime = currentTime;
    const completionTime = startTime + bt;
    const turnaroundTime = completionTime - p.arrivalTime;
    const waitingTime = turnaroundTime - bt;

    ganttSegments.push({
      processId: p.id,
      processName: p.name,
      startTime,
      endTime: completionTime,
    });

    resultMap.set(p.id, {
      id: p.id,
      name: p.name,
      arrivalTime: p.arrivalTime,
      burstTime: bt,
      startTime,
      completionTime,
      turnaroundTime,
      waitingTime,
    });

    currentTime = completionTime;
  });

  // Preserve original process order for display
  const processResults = processes.map((p) => resultMap.get(p.id)!);

  const totalWT = processResults.reduce((acc, curr) => acc + curr.waitingTime, 0);
  const totalTAT = processResults.reduce((acc, curr) => acc + curr.turnaroundTime, 0);
  const n = processResults.length;

  return {
    algorithmName: 'SJF (Shortest Job First - Non-Preemptive)',
    algorithmKey: 'sjf',
    processResults,
    ganttSegments,
    avgWaitingTime: Number((totalWT / n).toFixed(2)),
    avgTurnaroundTime: Number((totalTAT / n).toFixed(2)),
    totalExecutionTime: currentTime,
  };
};

/**
 * 3. Round Robin (RR) Algorithm
 */
export const calculateRoundRobin = (
  processes: ProcessInput[],
  timeQuantum: number
): AlgorithmResult => {
  const remBT: { [id: string]: number } = {};
  const startTimeMap: { [id: string]: number } = {};
  const completionTimeMap: { [id: string]: number } = {};
  const ganttSegments: GanttSegment[] = [];

  processes.forEach((p) => {
    remBT[p.id] = Number(p.burstTime);
  });

  const readyQueue: ProcessInput[] = [...processes];
  let currentTime = 0;

  while (readyQueue.length > 0) {
    const currentProc = readyQueue.shift()!;
    const pId = currentProc.id;

    // Start time is recorded when the process first gets CPU
    if (startTimeMap[pId] === undefined) {
      startTimeMap[pId] = currentTime;
    }

    const execTime = Math.min(remBT[pId], timeQuantum);
    const start = currentTime;
    currentTime += execTime;
    remBT[pId] -= execTime;

    ganttSegments.push({
      processId: pId,
      processName: currentProc.name,
      startTime: start,
      endTime: currentTime,
    });

    if (remBT[pId] > 0) {
      readyQueue.push(currentProc);
    } else {
      completionTimeMap[pId] = currentTime;
    }
  }

  const processResults: ProcessResult[] = processes.map((p) => {
    const bt = Number(p.burstTime);
    const startTime = startTimeMap[p.id];
    const completionTime = completionTimeMap[p.id];
    const turnaroundTime = completionTime - p.arrivalTime;
    const waitingTime = turnaroundTime - bt;

    return {
      id: p.id,
      name: p.name,
      arrivalTime: p.arrivalTime,
      burstTime: bt,
      startTime,
      completionTime,
      turnaroundTime,
      waitingTime,
    };
  });

  const totalWT = processResults.reduce((acc, curr) => acc + curr.waitingTime, 0);
  const totalTAT = processResults.reduce((acc, curr) => acc + curr.turnaroundTime, 0);
  const n = processResults.length;

  return {
    algorithmName: `Round Robin (Time Quantum = ${timeQuantum})`,
    algorithmKey: 'rr',
    processResults,
    ganttSegments,
    avgWaitingTime: Number((totalWT / n).toFixed(2)),
    avgTurnaroundTime: Number((totalTAT / n).toFixed(2)),
    totalExecutionTime: currentTime,
  };
};

