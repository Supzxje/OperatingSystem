// Class tiến trình
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

  // Tạo màu ngẫu nhiên 
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

export default Process;