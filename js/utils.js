export function calculateTimes(processes) {
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