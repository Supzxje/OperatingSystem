// Hàm chính thực hiện lập lịch ưu tiên (không ưu tiên thời gian thực)
export function runPriority(processes) {
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
    // Tìm tiến trình có mức độ ưu tiên cao nhất (giá trị thấp hơn có nghĩa là mức độ ưu tiên cao hơn)
    let highestPriorityIndex = -1;
    let highestPriority = Number.MAX_VALUE;
    
    // Duyệt tất cả tiến trình
    for (let i = 0; i < n; i++) {
      if (processesCopy[i].arrivalTime <= currentTime && !isCompleted[i]) {
        if (processesCopy[i].priority < highestPriority) {
          highestPriority = processesCopy[i].priority;
          highestPriorityIndex = i;
        }
      }
    }

    // Nếu không tìm được tiến trình hợp lệ, tăng thời gian hệ thống lên 1 đơn vị
    if (highestPriorityIndex === -1) {
      currentTime++;
      continue;
    }

    // Thời gian bắt đầu thực hiện tiến trình và tính thời gian hoàn thành tiến trình
    const startTime = currentTime;
    const completionTime = currentTime + processesCopy[highestPriorityIndex].burstTime;
    
    // Cập nhật tiến trình với thời gian bắt đầu và hoàn thành
    resultProcesses[highestPriorityIndex] = {
      ...resultProcesses[highestPriorityIndex],
      startTime,
      completionTime
    };

    // Thêm tiến trình vào sơ đồ Gantt
    ganttChart.push({
      processId: processesCopy[highestPriorityIndex].id,
      startTime,
      endTime: completionTime
    });

    currentTime = completionTime;
    isCompleted[highestPriorityIndex] = true;
    completed++;
  }
  
  // Tính toán thời gian chờ và thời gian hoàn thành cho các tiến trình
  return {
    processes: calculateTimes(resultProcesses),
    ganttChart
  };
}

// Hàm tính turnaroundTime và waitingTime cho mỗi tiến trình
function calculateTimes(processes) {
  return processes.map(process => {
    if (process.completionTime === undefined) return process;

    const turnaroundTime = process.completionTime - process.arrivalTime; // Tính turnaroundTime = completion - arrival
    const waitingTime = turnaroundTime - process.burstTime; // Tính waitingTime = turnaround - burst


    return {
      ...process,
      turnaroundTime,
      waitingTime
    };
  });
}
