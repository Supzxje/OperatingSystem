// Round Robin Scheduling
export function runRoundRobin(processes, timeQuantum) {
  // Create a deep copy of processes
  const processesCopy = JSON.parse(JSON.stringify(processes)).map(p => ({
    ...p,
    remainingTime: p.burstTime
  }));

  // Sort processes by arrival time
  processesCopy.sort((a, b) => a.arrivalTime - b.arrivalTime);

  let currentTime = 0;
  const ganttChart = [];
  const n = processesCopy.length;

  // Create a queue for ready processes
  const readyQueue = [];
  let completed = 0;

  // Result processes with all metrics
  const resultProcesses = [...processesCopy];

  // Add first process to ready queue
  let i = 0;
  while (i < n && processesCopy[i].arrivalTime <= currentTime) {
    readyQueue.push(i);
    i++;
  }

  while (completed !== n) {
    if (readyQueue.length === 0) {
      currentTime++;

      // Check if any new process has arrived
      while (i < n && processesCopy[i].arrivalTime <= currentTime) {
        readyQueue.push(i);
        i++;
      }

      continue;
    }

    // Get the process from the front of the queue
    const processIndex = readyQueue.shift();

    // If this is the first time the process is being executed, set its start time
    if (processesCopy[processIndex].remainingTime === processesCopy[processIndex].burstTime) {
      resultProcesses[processIndex].startTime = currentTime;
    }

    // Calculate execution time for this round
    const executionTime = Math.min(timeQuantum, processesCopy[processIndex].remainingTime);

    // Add to Gantt chart
    ganttChart.push({
      processId: processesCopy[processIndex].id,
      startTime: currentTime,
      endTime: currentTime + executionTime
    });

    // Update current time and remaining time
    currentTime += executionTime;
    processesCopy[processIndex].remainingTime -= executionTime;

    // Check if any new process has arrived during this time quantum
    while (i < n && processesCopy[i].arrivalTime <= currentTime) {
      readyQueue.push(i);
      i++;
    }

    // If the process is not completed, add it back to the ready queue
    if (processesCopy[processIndex].remainingTime > 0) {
      readyQueue.push(processIndex);
    } else {
      // Process is completed
      resultProcesses[processIndex].completionTime = currentTime;
      completed++;
    }
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