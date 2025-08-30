import { W } from "./color";


export class TimePanel {
    constructor(elementId) {
        this.displayElement = document.getElementById(elementId);
        if (!this.displayElement) {
            console.error('未找到指定的计时器元素:', elementId);
            return;
        }
        this.startTime = 0;
        this.elapsedTime = 0;
        this.timerId = null;
        this.isRunning = false;
        this.updateDisplay();
    }

    updateDisplay() {
        const totalMilliseconds = this.elapsedTime;
        
        const minutes = String(Math.floor((totalMilliseconds / (1000 * 60)) % 60)).padStart(2, '0');
        const seconds = String(Math.floor((totalMilliseconds / 1000) % 60)).padStart(2, '0');
        const milliseconds = String(Math.floor((totalMilliseconds % 1000) / 10)).padStart(2, '0');
        
        this.displayElement.textContent = `${minutes}:${seconds}:${milliseconds}`;
    }

    start() {
        if (this.isRunning) {
            return;
        }
        this.isRunning = true;
        this.startTime = Date.now() - this.elapsedTime;
        this.displayElement.classList.add('start');

        this.timerId = setInterval(() => {
            this.elapsedTime = Date.now() - this.startTime;
            this.updateDisplay();
        }, 10);
    }

    pause() {
        if (!this.isRunning) {
            return;
        }
        this.isRunning = false;
        clearInterval(this.timerId);
        this.timerId = null;
        this.displayElement.classList.remove('start');
        this.displayElement.classList.add('end');
    }

    reset() {
        this.pause();
        this.displayElement.classList.remove('end', "start");

        this.elapsedTime = 0;
        this.updateDisplay();
    }
}