import Process from './process.js';
import { runFCFS } from './algorithms/fcfs.js';
import { runSJF } from './algorithms/sjf.js';
import { runPriority } from './algorithms/priority.js';
import { runRoundRobin } from './algorithms/roundRobin.js';

// Main application class
class CPUSchedulingApp {
  constructor() {
    this.processes = [
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

  // Initialize event listeners
  initEventListeners() {
    // Form submission for adding new process
    document.getElementById('processForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addProcess();
    });

    // Run algorithm button
    document.getElementById('runAlgorithm').addEventListener('click', () => {
      this.runAlgorithm();
    });

    // Algorithm selection change
    const algorithmRadios = document.querySelectorAll('input[name="algorithm"]');
    algorithmRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        this.selectedAlgorithm = radio.value;
        this.updateAlgorithmDescription();
        this.toggleTimeQuantum();
      });
    });

    // Time quantum change
    document.getElementById('timeQuantum').addEventListener('change', (e) => {
      this.timeQuantum = parseInt(e.target.value) || 2;
      if (this.selectedAlgorithm === 'roundRobin') {
        this.runAlgorithm();
      }
    });
  }

  // Toggle time quantum input visibility
  toggleTimeQuantum() {
    const timeQuantumContainer = document.getElementById('timeQuantumContainer');
    if (this.selectedAlgorithm === 'roundRobin') {
      timeQuantumContainer.classList.remove('hidden');
    } else {
      timeQuantumContainer.classList.add('hidden');
    }
  }

  // Update algorithm description based on selection
  updateAlgorithmDescription() {
    const descriptionElement = document.getElementById('algorithmDescription');
    
    switch (this.selectedAlgorithm) {
      case 'fcfs':
        descriptionElement.textContent = 'First-Come, First-Served (FCFS) executes processes in the order they arrive in the ready queue.';
        break;
      case 'sjf':
        descriptionElement.textContent = 'Shortest Job First (SJF) selects the process with the smallest burst time to execute next.';
        break;
      case 'priority':
        descriptionElement.textContent = 'Priority Scheduling selects the process with the highest priority (lowest priority number) to execute next.';
        break;
      case 'roundRobin':
        descriptionElement.textContent = 'Round Robin gives each process a small unit of CPU time (time quantum), cycling through all processes.';
        break;
    }
  }

  // Add a new process
  addProcess() {
    const arrivalTime = parseInt(document.getElementById('arrivalTime').value) || 0;
    const burstTime = parseInt(document.getElementById('burstTime').value) || 1;
    const priority = parseInt(document.getElementById('priority').value) || 1;

    if (burstTime <= 0) {
      alert('Burst time must be greater than 0');
      return;
    }

    const newId = this.processes.length > 0 
      ? Math.max(...this.processes.map(p => p.id)) + 1 
      : 1;

    this.processes.push(new Process(newId, arrivalTime, burstTime, priority));
    this.renderProcessTable();

    // Reset form
    document.getElementById('arrivalTime').value = 0;
    document.getElementById('burstTime').value = 1;
    document.getElementById('priority').value = 1;

    // Run algorithm if we have processes
    if (this.processes.length > 0) {
      this.runAlgorithm();
    }
  }

  // Remove a process
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

  // Render the process table
  renderProcessTable() {
    const tableBody = document.getElementById('processTableBody');
    tableBody.innerHTML = '';

    if (this.processes.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = `<td colspan="6" style="text-align: center;">No processes added yet.</td>`;
      tableBody.appendChild(row);
      return;
    }

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

  // Run the selected algorithm
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

    // Show results and Gantt chart containers
    document.getElementById('ganttChartContainer').classList.remove('hidden');
    document.getElementById('resultsContainer').classList.remove('hidden');
  }

  // Render the results table
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

    // Calculate and display averages
    const avgWaitingTime = this.results.reduce((sum, process) => sum + process.waitingTime, 0) / this.results.length;
    const avgTurnaroundTime = this.results.reduce((sum, process) => sum + process.turnaroundTime, 0) / this.results.length;

    document.getElementById('avgWaitingTime').textContent = avgWaitingTime.toFixed(2);
    document.getElementById('avgTurnaroundTime').textContent = avgTurnaroundTime.toFixed(2);
  }

  // Render the Gantt chart
  renderGanttChart() {
    const canvas = document.getElementById('ganttChart');
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Find the end time of the last process
    const endTime = Math.max(...this.ganttChart.map(item => item.endTime));

    // Calculate scale factor
    const chartWidth = canvas.width - 60; // Leave space for labels
    const scaleFactor = chartWidth / endTime;

    // Chart dimensions
    const chartHeight = 60;
    const chartY = 30;

    // Draw timeline
    ctx.beginPath();
    ctx.moveTo(30, chartY + chartHeight + 10);
    ctx.lineTo(30 + chartWidth, chartY + chartHeight + 10);
    ctx.stroke();

    // Draw time markers
    ctx.textAlign = 'center';
    ctx.font = '12px Arial';
    ctx.fillStyle = '#000';

    for (let t = 0; t <= endTime; t += Math.ceil(endTime / 10)) {
      const x = 30 + t * scaleFactor;
      ctx.beginPath();
      ctx.moveTo(x, chartY + chartHeight + 5);
      ctx.lineTo(x, chartY + chartHeight + 15);
      ctx.stroke();
      ctx.fillText(t.toString(), x, chartY + chartHeight + 30);
    }

    // Draw Gantt chart blocks
    this.ganttChart.forEach(item => {
      const process = this.processes.find(p => p.id === item.processId);
      if (!process) return;

      const x = 30 + item.startTime * scaleFactor;
      const width = (item.endTime - item.startTime) * scaleFactor;

      // Draw block
      ctx.fillStyle = process.color;
      ctx.fillRect(x, chartY, width, chartHeight);

      // Draw border
      ctx.strokeStyle = '#000';
      ctx.strokeRect(x, chartY, width, chartHeight);

      // Draw process ID
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`P${process.id}`, x + width / 2, chartY + chartHeight / 2);

      // Draw time labels
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

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CPUSchedulingApp();
});