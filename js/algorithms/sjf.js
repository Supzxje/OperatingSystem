// Hàm thực hiện thuật toán SJF 
export function runSJF(processes) {
  // Tạo bản sao sâu (deep copy) của mảng processes để không làm thay đổi dữ liệu gốc
  const processesCopy = JSON.parse(JSON.stringify(processes));

  let currentTime = 0;
  let completed = 0;
  const ganttChart = [];
  const n = processesCopy.length;

  // Mảng đánh dấu tiến trình nào đã hoàn thành
  const isCompleted = Array(n).fill(false);
  const resultProcesses = [...processesCopy];

  while (completed !== n) {
    // Tìm tiến trình có thời gian burst time nhỏ nhất trong số các tiến trình đã đến
    let minBurstIndex = -1;
    let minBurst = Number.MAX_VALUE;
    
    for (let i = 0; i < n; i++) {
      if (processesCopy[i].arrivalTime <= currentTime && !isCompleted[i]) {
        if (processesCopy[i].burstTime < minBurst) { // Nếu burst time của nó nhỏ hơn cái hiện tại
          minBurst = processesCopy[i].burstTime; // Cập nhật burst time nhỏ nhất
          minBurstIndex = i;
        }
      }
    }

    // Nếu không tìm thấy tiến trình nào, // Tăng thời gian chờ
    if (minBurstIndex === -1) {
      currentTime++;
      continue;
    }

    // Lưu thời gian bắt đầu của tiến trình được chọn
    const startTime = currentTime;
    const completionTime = currentTime + processesCopy[minBurstIndex].burstTime;
    
     // Gán lại tiến trình với thông tin mới
    resultProcesses[minBurstIndex] = {
      ...resultProcesses[minBurstIndex],
      startTime,
      completionTime
    };

    // Ghi lại tiến trình vào Gantt chart
    ganttChart.push({
      processId: processesCopy[minBurstIndex].id,
      startTime,
      endTime: completionTime
    });
    
    currentTime = completionTime;// Cập nhật thời gian hiện tại
    isCompleted[minBurstIndex] = true;
    completed++;
  }

  return {
    processes: calculateTimes(resultProcesses),
    ganttChart
  };
}
// Hàm tính thời gian chờ và turnaround
function calculateTimes(processes) {
  return processes.map(process => {
    if (process.completionTime === undefined) return process;

    const turnaroundTime = process.completionTime - process.arrivalTime; // Turnaround = thời gian hoàn thành - thời gian đến
    const waitingTime = turnaroundTime - process.burstTime; // Waiting = turnaround - burst

    return {
      ...process,
      turnaroundTime,
      waitingTime
    };
  });
}
