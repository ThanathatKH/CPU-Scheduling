import { useState, useMemo, useRef } from 'react';
import type { ProcessInput } from './types/scheduling';
import {
  validateInputs,
  calculateFCFS,
  calculateSJF,
  calculateRoundRobin,
} from './utils/schedulingAlgorithms';
import { InputPanel } from './components/InputPanel';
import { ResultTable } from './components/ResultTable';
import { AlgorithmComparison } from './components/AlgorithmComparison';
import { FormulaGuide } from './components/FormulaGuide';
import './App.css';

// Initial default process set (minimum 3 processes)
const INITIAL_PROCESSES: ProcessInput[] = [
  { id: 'p1', name: 'P1', arrivalTime: 0, burstTime: 10 },
  { id: 'p2', name: 'P2', arrivalTime: 0, burstTime: 5 },
  { id: 'p3', name: 'P3', arrivalTime: 0, burstTime: 8 },
];

export function App() {
  const [processes, setProcesses] = useState<ProcessInput[]>(INITIAL_PROCESSES);
  const [timeQuantum, setTimeQuantum] = useState<number | string>(2);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'fcfs' | 'sjf' | 'rr'>('fcfs');
  
  // Track if simulation has been executed via "Process" button
  const [hasProcessed, setHasProcessed] = useState<boolean>(false);
  
  // View mode tab state: 'selected' (show dropdown choice) or 'comparison' (show all 3 tables)
  const [activeView, setActiveView] = useState<'selected' | 'comparison'>('selected');

  const resultSectionRef = useRef<HTMLDivElement>(null);

  // Handle process field changes
  const handleProcessChange = (
    id: string,
    field: keyof ProcessInput,
    value: string | number
  ) => {
    setProcesses((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  // Add dynamic new process (P4, P5, ... Pn)
  const handleAddProcess = () => {
    const nextNum = processes.length + 1;
    const defaultBT = Math.floor(Math.random() * 12) + 2;
    const newProc: ProcessInput = {
      id: `p_${Date.now()}_${Math.random()}`,
      name: `P${nextNum}`,
      arrivalTime: 0,
      burstTime: defaultBT,
    };
    setProcesses((prev) => [...prev, newProc]);
  };

  // Remove process (min 3 processes rule enforced)
  const handleRemoveProcess = (id: string) => {
    if (processes.length <= 3) return;
    setProcesses((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      return filtered.map((p, index) => ({
        ...p,
        name: `P${index + 1}`,
      }));
    });
  };

  // Randomize all burst times with positive integers > 0
  const handleRandomizeBT = () => {
    setProcesses((prev) =>
      prev.map((p) => ({
        ...p,
        burstTime: Math.floor(Math.random() * 18) + 2,
      }))
    );
  };

  // Validation
  const errors = useMemo(() => {
    return validateInputs(processes, timeQuantum);
  }, [processes, timeQuantum]);

  // Execute Simulation Process
  const handleProcessExecute = () => {
    if (errors.length === 0) {
      setHasProcessed(true);
      setTimeout(() => {
        resultSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      setHasProcessed(false);
    }
  };

  // Calculate algorithm results
  const { fcfsResult, sjfResult, rrResult, minAvgWT } = useMemo(() => {
    if (errors.length > 0) {
      return { fcfsResult: null, sjfResult: null, rrResult: null, minAvgWT: null };
    }

    const tqNum = Number(timeQuantum);
    const fcfs = calculateFCFS(processes);
    const sjf = calculateSJF(processes);
    const rr = calculateRoundRobin(processes, tqNum);

    const minWT = Math.min(
      fcfs.avgWaitingTime,
      sjf.avgWaitingTime,
      rr.avgWaitingTime
    );

    return { fcfsResult: fcfs, sjfResult: sjf, rrResult: rr, minAvgWT: minWT };
  }, [processes, timeQuantum, errors]);

  // Get current active single algorithm result
  const currentSelectedResult = useMemo(() => {
    if (!fcfsResult || !sjfResult || !rrResult) return null;
    if (selectedAlgorithm === 'fcfs') return fcfsResult;
    if (selectedAlgorithm === 'sjf') return sjfResult;
    return rrResult;
  }, [selectedAlgorithm, fcfsResult, sjfResult, rrResult]);

  return (
    <div className="app-container">
      {/* Top Branding Header */}
      <header className="top-nav">
        <div className="nav-title">
          <span className="logo-icon">💻</span>
          <h2>CPU Scheduling Simulator</h2>
        </div>
        <div className="nav-subtitle">CS422 Operating Systems • Arrival Time (AT) = 0</div>
      </header>

      <main className="app-main">
        {/* Input & Dropdown Configuration Panel */}
        <InputPanel
          processes={processes}
          timeQuantum={timeQuantum}
          selectedAlgorithm={selectedAlgorithm}
          errors={errors}
          onProcessChange={handleProcessChange}
          onAddProcess={handleAddProcess}
          onRemoveProcess={handleRemoveProcess}
          onRandomizeBT={handleRandomizeBT}
          onTimeQuantumChange={(val) => setTimeQuantum(val)}
          onAlgorithmChange={(algo) => setSelectedAlgorithm(algo)}
          onProcessExecute={handleProcessExecute}
        />

        {/* Results Section (Appears after clicking Process) */}
        {hasProcessed && errors.length === 0 && fcfsResult && sjfResult && rrResult && currentSelectedResult && (
          <section className="results-section" ref={resultSectionRef}>
            {/* Navigation Tabs for Viewing Single vs Comparison */}
            <div className="view-switcher-bar flex-between">
              <div className="view-mode-toggle">
                <button
                  type="button"
                  className={`view-toggle-btn ${activeView === 'selected' ? 'active' : ''}`}
                  onClick={() => setActiveView('selected')}
                >
                  🎯 ผลลัพธ์เฉพาะ: {currentSelectedResult.algorithmName}
                </button>
                <button
                  type="button"
                  className={`view-toggle-btn ${activeView === 'comparison' ? 'active' : ''}`}
                  onClick={() => setActiveView('comparison')}
                >
                  📊 ผลลัพธ์เปรียบเทียบ 3 ตาราง (ดูอัลกอริทึมที่ไวที่สุด)
                </button>
              </div>
            </div>

            {/* 1. Selected Single Algorithm View */}
            {activeView === 'selected' && (
              <div className="single-view-container">
                <ResultTable
                  result={currentSelectedResult}
                  isBest={currentSelectedResult.avgWaitingTime === minAvgWT}
                />
              </div>
            )}

            {/* 2. Compare All 3 View */}
            {activeView === 'comparison' && (
              <AlgorithmComparison
                fcfs={fcfsResult}
                sjf={sjfResult}
                rr={rrResult}
              />
            )}
          </section>
        )}

        {/* Formula Reference */}
        <FormulaGuide />
      </main>
    </div>
  );
}

export default App;
