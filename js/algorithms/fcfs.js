// First-Come, First-Served (FCFS) Scheduling
export function runFCFS(processes) {
  // Create a deep copy of processes
  const processesCopy = JSON.parse(JSON.stringify(processes));
  
  // Sort processes by arrival time
  processesCopy.sort((a, b) => a.arrivalTime - b.arrivalTime);

  let currentTime = 0;
  const ganttChart = [];

  const resultProcesses = processesCopy.map(process => {
    // If current time is less than arrival time, update current time
    if (currentTime < process.arrivalTime) {
      currentTime = process.arrivalTime;
    }

    const startTime = currentTime;
    const completionTime = currentTime + process.burstTime;

    // Add to Gantt chart
    ganttChart.push({
      processId: process.id,
      startTime,
      endTime: completionTime
    });

    currentTime = completionTime;

    return {
      ...process,
      startTime,
      completionTime
    };
  });

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