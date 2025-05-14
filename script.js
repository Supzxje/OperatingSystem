// Process class to represent a process
class Process {
  constructor(id, arrivalTime, burstTime, priority) {
    this.id = id;
    this.arrivalTime = arrivalTime;
    this.burstTime = burstTime;
    this.priority = priority;
    this.color = this.generateColor();
    this.remainingTime = burstTime;
    this.startTime = 0;
    this.completionTime = 0;
    this.waitingTime = 0;
    this.turnaroundTime = 0;
  }

  // Generate a random color for the process
  generateColor() {
    const colors = [
      '#4f46e5', // Indigo
      '#06b6d4', // Cyan
      '#ec4899', // Pink
      '#f59e0b', // Amber
      '#10b981', // Emerald
      '#8b5cf6', // Violet
      '#ef4444', // Red
      '#84cc16', // Lime
      '#6366f1', // Indigo
      '#f97316'  // Orange
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

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
        result = this.runFCFS();
        break;
      case 'sjf':
        result = this.runSJF();
        break;
      case 'priority':
        result = this.runPriority();
        break;
      case 'roundRobin':
        result = this.runRoundRobin();
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

  // Calculate waiting time and turnaround time
  calculateTimes(processes) {
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

  // First-Come, First-Served (FCFS) Scheduling
  runFCFS() {
    // Create a deep copy of processes
    const processesCopy = JSON.parse(JSON.stringify(this.processes));
    
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
      processes: this.calculateTimes(resultProcesses),
      ganttChart
    };
  }

  // Shortest Job First (SJF) Scheduling (Non-preemptive)
  runSJF() {
    // Create a deep copy of processes
    const processesCopy = JSON.parse(JSON.stringify(this.processes));

    let currentTime = 0;
    let completed = 0;
    const ganttChart = [];
    const n = processesCopy.length;

    // Array to track if a process is completed
    const isCompleted = Array(n).fill(false);
    const resultProcesses = [...processesCopy];

    while (completed !== n) {
      // Find process with minimum burst time among the processes that have arrived
      let minBurstIndex = -1;
      let minBurst = Number.MAX_VALUE;

      for (let i = 0; i < n; i++) {
        if (processesCopy[i].arrivalTime <= currentTime && !isCompleted[i]) {
          if (processesCopy[i].burstTime < minBurst) {
            minBurst = processesCopy[i].burstTime;
            minBurstIndex = i;
          }
        }
      }

      // If no process is found, increment current time
      if (minBurstIndex === -1) {
        currentTime++;
        continue;
      }

      // Process the selected process
      const startTime = currentTime;
      const completionTime = currentTime + processesCopy[minBurstIndex].burstTime;

      resultProcesses[minBurstIndex] = {
        ...resultProcesses[minBurstIndex],
        startTime,
        completionTime
      };

      // Add to Gantt chart
      ganttChart.push({
        processId: processesCopy[minBurstIndex].id,
        startTime,
        endTime: completionTime
      });

      currentTime = completionTime;
      isCompleted[minBurstIndex] = true;
      completed++;
    }

    return {
      processes: this.calculateTimes(resultProcesses),
      ganttChart
    };
  }

  // Priority Scheduling (Non-preemptive)
  runPriority() {
    // Create a deep copy of processes
    const processesCopy = JSON.parse(JSON.stringify(this.processes));

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
      processes: this.calculateTimes(resultProcesses),
      ganttChart
    };
  }

  // Round Robin Scheduling
  runRoundRobin() {
    // Create a deep copy of processes
    const processesCopy = JSON.parse(JSON.stringify(this.processes)).map(p => ({
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
      const executionTime = Math.min(this.timeQuantum, processesCopy[processIndex].remainingTime);

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
      processes: this.calculateTimes(resultProcesses),
      ganttChart
    };
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