export interface ProcessInput {
  id: string;
  name: string;
  arrivalTime: number; // Fixed at 0
  burstTime: number | string;
}

export interface ProcessResult {
  id: string;
  name: string;
  arrivalTime: number;
  burstTime: number;
  startTime: number;
  completionTime: number;
  turnaroundTime: number;
  waitingTime: number;
}

export interface AlgorithmResult {
  algorithmName: string;
  algorithmKey: 'fcfs' | 'sjf' | 'rr';
  processResults: ProcessResult[];
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  totalExecutionTime: number;
}
