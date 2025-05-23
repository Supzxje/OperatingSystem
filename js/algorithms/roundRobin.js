// Hàm thực hiện giải thuật Round Robin
export function runRoundRobin(processes, timeQuantum) {
  // Tạo bản sao sâu (deep copy) của mảng processes để không làm thay đổi dữ liệu gốc
  const processesCopy = JSON.parse(JSON.stringify(processes)).map(p => ({
    ...p,
    remainingTime: p.burstTime
  }));

  // Sắp xếp tiến trình theo thời gian đến
  processesCopy.sort((a, b) => a.arrivalTime - b.arrivalTime);

  let currentTime = 0;
  const ganttChart = [];
  const n = processesCopy.length;

  // Tạo hàng đợi cho các tiến trình sẵn sàng
  const readyQueue = [];
  let completed = 0;

  // Tạo bản sao để lưu kết quả cuối cùng cho từng tiến trình
  const resultProcesses = [...processesCopy];

  // Thêm tất cả tiến trình đã đến vào hàng đợi
  let i = 0;
  while (i < n && processesCopy[i].arrivalTime <= currentTime) {
    readyQueue.push(i);
    i++;
  }

  while (completed !== n) {
    if (readyQueue.length === 0) {
      currentTime++;

      // Kiểm tra xem có tiến trình mới nào đến chưa
      while (i < n && processesCopy[i].arrivalTime <= currentTime) {
        readyQueue.push(i);
        i++;
      }

      continue;
    }

    // Lấy chỉ số của tiến trình đầu tiên trong hàng đợi
    const processIndex = readyQueue.shift();

    // Nếu là lần đầu tiến trình được thực thi, đặt thời gian bắt đầu
    if (processesCopy[processIndex].remainingTime === processesCopy[processIndex].burstTime) {
      resultProcesses[processIndex].startTime = currentTime;
    }

    // Tính thời gian thực thi 
    const executionTime = Math.min(timeQuantum, processesCopy[processIndex].remainingTime);

    // Thêm tiến trình vào sơ đồ Gantt
    ganttChart.push({
      processId: processesCopy[processIndex].id,
      startTime: currentTime,
      endTime: currentTime + executionTime
    });

    // Cập nhật thời gian hiện tại
    currentTime += executionTime;
    processesCopy[processIndex].remainingTime -= executionTime;

    // Kiểm tra nếu có tiến trình mới đến trong thời gian này
    while (i < n && processesCopy[i].arrivalTime <= currentTime) {
      readyQueue.push(i);
      i++;
    }

    // Nếu tiến trình chưa xong, đưa lại vào cuối hàng đợi
    if (processesCopy[processIndex].remainingTime > 0) {
      readyQueue.push(processIndex);
    } else {
      // Nếu xong, ghi thời gian hoàn thành
      resultProcesses[processIndex].completionTime = currentTime;
      completed++;
    }
  }
  // Trả về danh sách tiến trình với thời gian chờ và turnaround
  return {
    processes: calculateTimes(resultProcesses),
    ganttChart
  };
}

function calculateTimes(processes) {
  return processes.map(process => {
    if (process.completionTime === undefined) return process;

    const turnaroundTime = process.completionTime - process.arrivalTime; // Turnaround time = completion - arrival
    const waitingTime = turnaroundTime - process.burstTime;  // Waiting time = turnaround - burst

    return {
      ...process,
      turnaroundTime,
      waitingTime
    };
  });
}
