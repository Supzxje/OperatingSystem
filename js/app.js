import Process from './process.js';
import { runFCFS } from './algorithms/fcfs.js';
import { runSJF } from './algorithms/sjf.js';
import { runPriority } from './algorithms/priority.js';
import { runRoundRobin } from './algorithms/roundRobin.js';
import { runSRTF } from './algorithms/srtf.js';

class CPUSchedulingApp {
  constructor() {
    this.processes = [
      // Tạo các tiến trình mặc định
      new Process(1, 0, 5, 2),
      new Process(2, 1, 3, 1),
      new Process(3, 2, 8, 4),
      new Process(4, 3, 2, 3),
      new Process(5, 4, 4, 5)
    ];
    this.selectedAlgorithm = 'fcfs';
    this.timeQuantum = 2;
    this.results = null;
    this.ganttChart = [];

    this.initEventListeners();
    this.renderProcessTable();
    this.updateAlgorithmDescription();
  }

  initEventListeners() {
    // Form submit để add thêm process
    document.getElementById('processForm').addEventListener('submit', (e) => {
      e.preventDefault(); // Ngăn reload trang
      this.addProcess();
    });

    // Button chạy thuật toán
    document.getElementById('runAlgorithm').addEventListener('click', () => {
      this.runAlgorithm();
    });

    // Thay đổi thuật toán
    const algorithmRadios = document.querySelectorAll('input[name="algorithm"]');
    algorithmRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        this.selectedAlgorithm = radio.value;
        this.updateAlgorithmDescription();
        this.toggleTimeQuantum();
      });
    });

    // document.getElementById('resetButton').addEventListener('click', () => {
    //   this.processes = [];
    //   this.renderProcessTable();
    // });

    // Thay đổi quantum time của RR
    document.getElementById('timeQuantum').addEventListener('change', (e) => {
      this.timeQuantum = parseInt(e.target.value) || 2;
      if (this.selectedAlgorithm === 'roundRobin') {
        this.runAlgorithm();
      }
    });
  }

  // Bật tắt Quantum time
  toggleTimeQuantum() {
    const timeQuantumContainer = document.getElementById('timeQuantumContainer');
    if (this.selectedAlgorithm === 'roundRobin') {
      // Chỉ khi thuật toán là RR thì hiện
      timeQuantumContainer.classList.remove('hidden');
    } else {
      timeQuantumContainer.classList.add('hidden');
    }
  }

  // Update mô tả về thuật toán
  updateAlgorithmDescription() {
    const descriptionElement = document.getElementById('algorithmDescription');

    switch (this.selectedAlgorithm) {
      case 'fcfs':
        descriptionElement.textContent = 'Thuật toán FCFS (First Come First Served) là một trong những thuật toán lập lịch đơn giản nhất, hoạt động theo nguyên tắc "đến trước, phục vụ trước.';
        break;
      case 'sjf':
        descriptionElement.textContent = 'Thuật toán SJF (Shortest Job First) chọn tiến trình có thời gian thực thi ngắn nhất để chạy tiếp theo.';
        break;
      case 'priority':
        descriptionElement.textContent = 'Thuật toán Ưu tiên chọn tiến trình có độ ưu tiên cao nhất (số ưu tiên nhỏ nhất) để thực thi tiếp theo.';
        break;
      case 'roundRobin':
        descriptionElement.textContent = 'Thuật toán Round Robin cấp cho mỗi tiến trình một khoảng thời gian nhỏ (time quantum) và luân phiên xử lý các tiến trình.';
        break;
      case 'srtf':
        descriptionElement.textContent = 'Shortest remaining time first (SRTF) là một phương pháp lập lịch là phiên bản ưu tiên của việc lập lịch tiếp theo cho công việc có thời gian ngắn nhất.';
        break;
    }
  }

  // Thêm tiến trình mới
  addProcess() {
    // Lấy dữ liệu từ form
    const arrivalTime = parseInt(document.getElementById('arrivalTime').value) || 0;
    const burstTime = parseInt(document.getElementById('burstTime').value) || 1;
    const priority = parseInt(document.getElementById('priority').value) || 1;

    // Nếu brust time < 0 alert
    if (burstTime <= 0) {
      alert('Burst time must be greater than 0');
      return;
    }

    // Tự động tăng stt của tiến trình 
    const newId = this.processes.length > 0
      ? Math.max(...this.processes.map(p => p.id)) + 1
      : 1;

    this.processes.push(new Process(newId, arrivalTime, burstTime, priority));
    this.renderProcessTable();

    // Reset form
    document.getElementById('arrivalTime').value = 0;
    document.getElementById('burstTime').value = 1;
    document.getElementById('priority').value = 1;

    // Tu dong chay lai tt neu them 1 process
    if(this.processes.length > 0){
      this.runAlgorithm();
    }
  }

  // Xóa 1 tiến trình
  removeProcess(id) {
    this.processes = this.processes.filter(p => p.id !== id);
    this.renderProcessTable();

    if (this.processes.length > 0) {
      this.runAlgorithm();
    } else {
      document.getElementById('ganttChartContainer').classList.add('hidden');
      document.getElementById('resultsContainer').classList.add('hidden');
    }
  }

  // Vẽ bảng tiến trình
  renderProcessTable() {
    const tableBody = document.getElementById('processTableBody');
    tableBody.innerHTML = ''; // xóa nội dung cũ

    if (this.processes.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = `<td colspan="6" style="text-align: center;">No processes added yet.</td>`;
      tableBody.appendChild(row);
      return;
    }

    // Duyệt qua từng tiến trình và thêm vào bản
    this.processes.forEach(process => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>P${process.id}</td>
        <td>${process.arrivalTime}</td>
        <td>${process.burstTime}</td>
        <td>${process.priority}</td>
        <td><div class="color-box" style="background-color: ${process.color};"></div></td>
        <td><button class="btn btn-danger" data-id="${process.id}">Remove</button></td>
      `;
      tableBody.appendChild(row);

      // Add event listener to the remove button
      const removeButton = row.querySelector('.btn-danger');
      removeButton.addEventListener('click', () => {
        this.removeProcess(parseInt(removeButton.dataset.id));
      });
    });
  }

  // Chạy thuật toán
  runAlgorithm() {
    if (this.processes.length === 0) return;

    let result;

    switch (this.selectedAlgorithm) {
      case 'fcfs':
        result = runFCFS(this.processes);
        break;
      case 'sjf':
        result = runSJF(this.processes);
        break;
      case 'priority':
        result = runPriority(this.processes);
        break;
      case 'srtf':
        result = runSRTF(this.processes);
        break;
      case 'roundRobin':
        result = runRoundRobin(this.processes, this.timeQuantum);
        break;
      default:
        return;
    }

    this.results = result.processes;
    this.ganttChart = result.ganttChart;

    this.renderResults();
    this.renderGanttChart();

    // Chạy bảng kết quả
    document.getElementById('ganttChartContainer').classList.remove('hidden');
    document.getElementById('resultsContainer').classList.remove('hidden');
  }

  // Vẽ bảng kết quả
  renderResults() {
    const tableBody = document.getElementById('resultsTableBody');
    tableBody.innerHTML = '';

    this.results.forEach(process => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>P${process.id}</td>
        <td>${process.arrivalTime}</td>
        <td>${process.burstTime}</td>
        <td>${process.startTime}</td>
        <td>${process.completionTime}</td>
        <td>${process.turnaroundTime}</td>
        <td>${process.waitingTime}</td>
      `;
      tableBody.appendChild(row);
    });

    // Tính thời gian
    const avgWaitingTime = this.results.reduce((sum, process) => sum + process.waitingTime, 0) / this.results.length;
    const avgTurnaroundTime = this.results.reduce((sum, process) => sum + process.turnaroundTime, 0) / this.results.length;

    document.getElementById('avgWaitingTime').textContent = avgWaitingTime.toFixed(2);
    document.getElementById('avgTurnaroundTime').textContent = avgTurnaroundTime.toFixed(2);
  }

  // Vẽ sơ đồ gantt
  renderGanttChart() {
    // lay du lieu tu canvas trong html
    const canvas = document.getElementById('ganttChart');
    // su dung 2d context de ve
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Tìm thời gian kết thúc của tiến trình cuối
    const endTime = Math.max(...this.ganttChart.map(item => item.endTime));

    // Tính toán tỉ lệ
    const chartWidth = canvas.width - 60; // chừa khoảng trống cho label
    const scaleFactor = chartWidth / endTime; // Đổi tg sang px
    const chartHeight = 60;
    const chartY = 30;

    // Vẽ timeline
    // ctx.beginPath();
    // ctx.moveTo(30, chartY + chartHeight + 10);
    // ctx.lineTo(30 + chartWidth, chartY + chartHeight + 10);
    // ctx.stroke();

    // ctx.textAlign = 'center';
    // ctx.font = '12px Arial';
    // ctx.fillStyle = '#000';

    // for (let t = 0; t <= endTime; t += Math.ceil(endTime / 10)) {
    //   const x = 30 + t * scaleFactor;
    //   ctx.beginPath();
    //   ctx.moveTo(x, chartY + chartHeight + 5);
    //   ctx.lineTo(x, chartY + chartHeight + 15);
    //   ctx.stroke();
    //   ctx.fillText(t.toString(), x, chartY + chartHeight + 30);
    // }

    // Vẽ Gantt block
    // duyet qua mang ganttChart 
    this.ganttChart.forEach(item => {
      const process = this.processes.find(p => p.id === item.processId);
      if (!process) return;

      // Tính toán vị trí và kích thước ô
      const x = 30 + item.startTime * scaleFactor;
      const width = (item.endTime - item.startTime) * scaleFactor;

      // vẽ ô màu
      ctx.fillStyle = process.color;
      ctx.fillRect(x, chartY, width, chartHeight);

      // vẽ viền
      ctx.strokeStyle = '#000';
      ctx.strokeRect(x, chartY, width, chartHeight);

      // Hiển thị tên tiến trình
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`P${process.id}`, x + width / 2, chartY + chartHeight / 2);

      // Ve thanh thoi gian
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(item.startTime.toString(), x, chartY - 20);

      if (item === this.ganttChart[this.ganttChart.length - 1]) {
        ctx.fillText(item.endTime.toString(), x + width, chartY - 20);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new CPUSchedulingApp();
});
