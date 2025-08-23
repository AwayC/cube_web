

export class TaskQue { 
    constructor(taskHandler) {
        this.history = [];
        this.future = []; 
        this.taskHandler = taskHandler; 

    }

    push(task) {
        this.future.push(task); 
    }

    doTask() { 
        if(this.future.length == 0) { 
            return ; 
        }
        let task = this.future.shift();
        this.taskHandler(task, false);
        this.history.push(task);
    }

    unDoTask() {
        this.future = []; 
        if (this.history.length === 0) {
            return ; 
        }
        let task = this.history[this.history.length - 1];
        this.history.pop();
        this.taskHandler(task, true); // reverse
    }

    pop() {
        if (this.future.length == 0) {
            return null;
        }
        return this.future.shift();
    }

    getTaskNum() { 
        return this.future.length;
    }

    front() { 
        if(this.future.length == 0) { 
            return null; 
        }
        return this.que[0]; 
    }
    
    empty() { 
        return (this.history.length === 0);
    }

    clear() { 
        this.future = [];
    }

    printTask() { 
        this.future.forEach((task) => {
            console.log(task.command);
        })
    }
    
    futureSize() { 
        return this.future.length; 
    }

    historySize() { 
        return this.history.length; 
    }

    
}