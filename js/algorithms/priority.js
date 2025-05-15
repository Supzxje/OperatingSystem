// Priority Scheduling (Non-preemptive)
export function runPriority(processes) {
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
    // Find process with highest priority (lower value means higher priority)
    let highestPriorityIndex = -1;
    let highestPriority = Number.MAX_VALUE;

    for (let i = 0; i < n; i++) {
      if (processesCopy[i].arrivalTime <= currentTime && !isCompleted[i]) {
        if (processesCopy[i].priority < highestPriority) {
          highestPriority = processesCopy[i].priority;
          highestPriorityIndex = i;
        }
      }
    }

    // If no process is found, increment current time
    if (highestPriorityIndex === -1) {
      currentTime++;
      continue;
    }

    // Process the selected process
    const startTime = currentTime;
    const completionTime = currentTime + processesCopy[highestPriorityIndex].burstTime;

    resultProcesses[highestPriorityIndex] = {
      ...resultProcesses[highestPriorityIndex],
      startTime,
      completionTime
    };

    // Add to Gantt chart
    ganttChart.push({
      processId: processesCopy[highestPriorityIndex].id,
      startTime,
      endTime: completionTime
    });

    currentTime = completionTime;
    isCompleted[highestPriorityIndex] = true;
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