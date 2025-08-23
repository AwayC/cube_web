import {Cube} from './cube.js' ; 


export class CubeController { 
    constructor(cube) { 
        
        this.cube = cube; 

        this.statusMap = [ 
            "idle", 
            "ctrlBot", 
            "BotSolving", 
        ]; 

        this.status = "idle"; 
        this.getingColor = false; 

        this.parseCommand = this.parseCommand.bind(this);
        this.keyCommand = this.keyCommand.bind(this);
        this.btnCommand = this.btnCommand.bind(this);
        this.serialCommand = this.serialCommand.bind(this);
        this.reverseCb = this.reverseCb.bind(this);

        this.cube.setTwistDuration(this.getDuration()); 
        this.isReversing = false; 

        cube.reverseCb = this.reverseCb;

        console.log("cubeController created"); 
    }

    cmdFilter(cmd) { 
        const map = ["X", "x", "R", "r", "L", "l", "B", "b"]; 
        if(map.includes(cmd)) { 
            return true; 
        } else { 
            return false; 
        }
    }

    getDuration() { 
        let duration = 0; 
        if(this.status === "idle") { 
            if(this.isReversing) 
                duration = 50; 
            else 
                duration = 200; 
        } else if(this.status === "ctrlBot") { 
            duration = 200; 
        } else { 
            duration = 200; 
        }

        return duration; 
    }

    reverseCb() { 
        this.isReversing = false; 
        console.log("reverseCb"); 
    }

    reverse() { 
        this.isReversing = true; 
        this.cube.setTwistDuration(this.getDuration());
        this.cube.reverse(); 
    }
    

/*** connect error handler ***/
    cntError() { 
        this.status = "idle"; 
        console.log("command error"); 
    }

    
/**** command parse start *****/
    isRecall(cmd) { 
        if(cmd == "recived")
            return true; 
        else 
            return false; 
    }

    parseCommand(cmd, client) { 
        if(this.isRecall(cmd)) { 
            this.isCmdcb = true; 
            return ; 
        }

        switch(client) { 
            case 'key': 
                this.keyCommand(cmd); 
                break; 
            case 'button': 
                this.btnCommand(cmd);
                break; 
            case 'serial': 
                this.serialCommand(cmd); 
                break; 

            default: break ; 
        }

        if(this.isCmdcb == false) { 
            this.cntError(); 
        }
    }

    keyCommand(cmd) { 
        if(this.status === 'BotSolving') return; 

        if(cmd === 'q') { 
            this.reverse(); 
            return ; 
        }
        if(cmd === 'p') { 
            this.cube.printMap(); 
            return ; 
        }


        if(this.status === 'ctrlBot') { 
            if(this.cmdFilter(cmd) === false) return ; 
        }

        
        this.cube.pushTwist(cmd); 
        
    }

    btnCommand(cmd) { 
        if(this.status === 'BotSolving') return; 

        if(this.status === 'idle') {

            if(cmd === 'CONNECT') 
                this.status = 'ctrlBot';
        } else if(this.status === 'ctrlBot') { 
            
            if(cmd === 'STOP') 
                this.status = 'idle'; 
        }

        console.log(this.status); 
        
    }

    serialCommand(cmd) { 

    }
/**** command parse end *****/

    startSolveing() { 
        this.status = "BotSolving"; 
        this.getingColor = true; 
    }
}

