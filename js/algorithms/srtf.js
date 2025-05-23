export function runSRTF(processes) {
    // Tạo bản sao sâu của danh sách tiến trình và thêm thuộc tính remainingTime
    const processesCopy = JSON.parse(JSON.stringify(processes)).map(p => ({
        ...p,
        remainingTime: p.burstTime
    }));

    let currentTime = 0; // Khởi tạo thời gian hiện tại
    let completed = 0; // Đếm số tiến trình đã hoàn thành
    const ganttChart = []; // Mảng lưu biểu đồ Gantt
    const n = processesCopy.length; // Số lượng tiến trình

    // Mảng theo dõi trạng thái hoàn thành của các tiến trình
    const isCompleted = Array(n).fill(false);
    const resultProcesses = [...processesCopy]; // Bản sao để lưu kết quả

    while (completed !== n) {
        // Tìm tiến trình có thời gian còn lại ngắn nhất
        let shortestIndex = -1;
        let shortestTime = Number.MAX_VALUE;

        for (let i = 0; i < n; i++) {
            if (processesCopy[i].arrivalTime <= currentTime && !isCompleted[i]) {
                if (processesCopy[i].remainingTime < shortestTime) {
                    shortestTime = processesCopy[i].remainingTime;
                    shortestIndex = i;
                }
            }
        }

        // Nếu không tìm thấy tiến trình, tăng thời gian hiện tại
        if (shortestIndex === -1) {
            currentTime++;
            continue;
        }

        // Ghi lại thời gian bắt đầu nếu tiến trình lần đầu được thực thi
        if (processesCopy[shortestIndex].remainingTime === processesCopy[shortestIndex].burstTime) {
            resultProcesses[shortestIndex].startTime = currentTime;
        }

        // Thêm thông tin vào biểu đồ Gantt
        ganttChart.push({
            processId: processesCopy[shortestIndex].id,
            startTime: currentTime,
            endTime: currentTime + 1
        });

        // Giảm thời gian còn lại và tăng thời gian hiện tại
        processesCopy[shortestIndex].remainingTime--;
        currentTime++;

        // Kiểm tra và cập nhật trạng thái hoàn thành của tiến trình
        if (processesCopy[shortestIndex].remainingTime === 0) {
            resultProcesses[shortestIndex].completionTime = currentTime;
            isCompleted[shortestIndex] = true;
            completed++;
        }
    }

    // Trả về danh sách tiến trình đã tính toán và biểu đồ Gantt
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
