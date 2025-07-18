

export class TaskQue { 
    constructor(taskHandler) {
        this.histroy = [];
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
        this.histroy.push(task);
    }

    unDoTask() {
        this.future = []; 
        if (this.histroy.length === 0) {
            return ; 
        }
        let task = this.histroy[this.histroy.length - 1];
        this.histroy.pop();
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
        return (this.future.length === 0);
    }

    clear() { 
        this.future = [];
    }

    printTask() { 
        this.future.forEach((task) => {
            console.log(task.command);
        })
    }
    
    size() { 
        return this.future.length; 
    }
    
}