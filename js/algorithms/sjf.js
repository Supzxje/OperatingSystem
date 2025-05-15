// Shortest Job First (SJF) Scheduling (Non-preemptive)
export function runSJF(processes) {
  // Create a deep copy of processes
  const processesCopy = JSON.parse(JSON.stringify(processes));

  let currentTime = 0;
  let completed = 0;
  const ganttChart = [];
  const n = processesCopy.length;

  // Array to track if a process is completed
  const isCompleted = Array(n).fill(false);
  const resultProcesses = [...processesCopy];

  while (completed !== n) {
    // Find process with minimum burst time among the processes that have arrived
    let minBurstIndex = -1;
    let minBurst = Number.MAX_VALUE;

    for (let i = 0; i < n; i++) {
      if (processesCopy[i].arrivalTime <= currentTime && !isCompleted[i]) {
        if (processesCopy[i].burstTime < minBurst) {
          minBurst = processesCopy[i].burstTime;
          minBurstIndex = i;
        }
      }
    }

    // If no process is found, increment current time
    if (minBurstIndex === -1) {
      currentTime++;
      continue;
    }

    // Process the selected process
    const startTime = currentTime;
    const completionTime = currentTime + processesCopy[minBurstIndex].burstTime;

    resultProcesses[minBurstIndex] = {
      ...resultProcesses[minBurstIndex],
      startTime,
      completionTime
    };

    // Add to Gantt chart
    ganttChart.push({
      processId: processesCopy[minBurstIndex].id,
      startTime,
      endTime: completionTime
    });

    currentTime = completionTime;
    isCompleted[minBurstIndex] = true;
    completed++;
  }

  return {
    processes: calculateTimes(resultProcesses),
    ganttChart
  };
}

function calculateTimes(processes) {
  return processes.map(process => {
    if (process.completionTime === undefined) return process;

    const turnaroundTime = process.completionTime - process.arrivalTime;
    const waitingTime = turnaroundTime - process.burstTime;

    return {
      ...process,
      turnaroundTime,
      waitingTime
    };
  });
}