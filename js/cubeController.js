import {Cube} from './cube.js' ; 
import { ControlPanel } from './control.js';
import * as TWEEN from 'three/examples/jsm/libs/tween.module.js';


export class CubeController { 
    constructor(prop) { 
        
        this.cube = prop.cube; 
        this.timer = prop.timer; 
        this.btns = prop.btns; 
        this.renderer = prop.renderer; 
        this.keys = null; 

        this.statusMap = [ 
            "init_anim",
            "idle", 
            "ctrlBot", 
            "BotSolving", 
        ]; 
        this.animate = true; 

        this.status = "init_anim"; 
        this.gettingColor = false; 

        this.parseCommand = this.parseCommand.bind(this);
        this.keyCommand = this.keyCommand.bind(this);
        this.btnCommand = this.btnCommand.bind(this);
        this.serialCommand = this.serialCommand.bind(this);
        this.reverseCb = this.reverseCb.bind(this);

        this.cube.setTwistDuration(this.getDuration()); 
        this.isReversing = false; 

        this.serial = null; 

        this.cube.reverseCb = this.reverseCb;

        // this.setStatus('idle'); 
        console.log("cubeController created"); 
    }

    addSerial(serial) { 
        this.serial = serial; 
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
        this.cube.setTwistDuration(this.getDuration());

        console.log("reverseCb"); 
    }

    reverse() { 
        this.isReversing = true; 
        this.cube.setTwistDuration(this.getDuration());
        this.cube.reverse(); 
    }
    
    initAnim() { 
        console.log("initAnim");    
        this.resetRotation(); 

        if(this.animate) {
            this.cube.corner.cubelets.forEach((cubelet) => { 
                cubelet.setRadius(120, 400, "Out"); 
            }); 
            this.cube.edge.cubelets.forEach((cubelet) => { 
                cubelet.setRadius(80, 400, "Out"); 
            }); 
            this.cube.center.cubelets.forEach((cubelet) => { 
                cubelet.setRadius(30, 400, "Out"); 
            }); 

            const mesh = this.cube.threeObject; 
            new TWEEN.Tween(mesh.rotation)
            .to({x: Math.PI * (2 - 0.9), y: Math.PI * (2 + 0.2), z: 0})
            .easing(TWEEN.Easing.Quadratic.Out)
            .duration(2700)
            .start();

            setTimeout(() => {
                let ptr = 0; 
                const offset = [400, 0 , -200, -100, 100, 200, 50, 0, 0, 100, 150, 0, 0, 0, 0, 0]; 
                this.cube.corner.cubelets.forEach((cubelet) => { 
                    console.log("ptr",ptr); 
                    cubelet.setRadius(20, 1500 + offset[ptr], ""); 
                    ptr += 1; 
                }); 
                ptr = 0; 
                this.cube.edge.cubelets.forEach((cubelet) => { 
                    cubelet.setRadius(20, 1000 + offset[ptr], ""); 
                    ptr += 1; 
                }); 
                ptr = 0; 
                this.cube.center.cubelets.forEach((cubelet) => { 
                    cubelet.setRadius(20, 500 + offset[ptr], ""); 
                    ptr += 1; 
                }); 
            }, 400);

            setTimeout(() => {
                this.keys.setup();
                this.mouse.setup();
                this.setStatus("idle");
            }, 2800);
        }
        else { 
            this.keys.setup(); 
            this.mouse.setup();
            this.setStatus("idle"); 
        }
        
        // this.renderer.moveCamera({x: -250, y: 250, Z:  250}); 
    }

    resetRotation(anim = false) { 
        const mesh = this.cube.threeObject; 
        if(anim === false) { 
            mesh.rotation.set(-Math.PI * 0.9, Math.PI * 0.2, 0); 
        } else { 

            let target = {
                x: -Math.PI * 0.9,
                y: Math.PI * 0.2,
                z: 0,
            }

            if(Math.abs(target.x - mesh.rotation.x) > Math.PI) { 
                if(target.x > mesh.rotation.x) { 
                    target.x -= Math.PI * 2; 
                } else { 
                    target.x += Math.PI * 2; 
                }
            }
            if(Math.abs(target.y - mesh.rotation.y) > Math.PI) { 
                if(target.y > mesh.rotation.y) { 
                    target.y -= Math.PI * 2; 
                } else { 
                    target.y += Math.PI * 2; 
                }
            }

            new TWEEN.Tween(mesh.rotation)
            .to(target, 1000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
        }
    }

    addKeys(keys) { 
        this.keys = keys; 
    }
    addMouse(mouse) { 
        this.mouse = mouse; 
    }

    getColor(map) { 
        // const colMap = [
        //     "*B*R*W","***R*W","G**R*W",
        //     "*B***W","*****W","G****W",
        //     "*BO**W","**O**W","G*O**W",
        
        //     "*B*R**","***R**","G**R**",
        //     "*B****","******","G*****",
        //     "*BO***","**O***","G*O***",
        
        //     "*B*RY*","***RY*","G**RY*",
        //     "*B**Y*","****Y*","G***Y*",
        //     "*BO*Y*","**O*Y*","G*O*Y*",
        // ];

        console.log("getting color"); 
        let colMap = [];

        for(let i = 0; i < 27; i++) { 
            colMap.push(map.slice(i * 6, (i + 1) * 6)); 
        }

        this.cube.fillColor(colMap);
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

        if(cmd === 'q' && this.status === 'idle') { 
            this.reverse(); 
            return ; 
        }
        if(cmd === 'p') { 
            this.cube.printMap(1); 
            this.cube.printMap(); 
            return ; 
        }
        if(cmd === 'k') { 
            this.getColor();
            return ; 
        }

        if(cmd === 'ResetRatation') { 
            this.resetRotation(true); 
            return ; 
        }


        if(this.status === 'ctrlBot') { 
            if(this.cmdFilter(cmd) === false) return ; 
        }

        if(!this.isReversing){
            this.cube.pushTwist(cmd); 
        }
            
        
    }

    btnCommand(cmd) { 
        if(this.status === 'BotSolving') return; 

        if(this.status === 'idle') {

            if(cmd === 'CONNECT') 
                this.setStatus('ctrlBot');
            else if(cmd === 'reverse') 
                this.reverse(); 

        } else if(this.status === 'ctrlBot') { 
            
            if(cmd === 'reset') 
                this.setStatus('idle'); 
            if(cmd === 'startSOLVE') { 
                this.serial.sendMessage('\nSOLVE_START');                
            }
        }

        console.log(this.status); 
        
    }

    serialCommand(cmd) { 
        if(this.status === 'idle') { 
            if(cmd === 'SERIAL_CONNECTED') {
                this.btns.connectButton.disabled = false;
            }

        } 
        else if(this.status === 'ctrlBot') { 
            if(cmd === 'SOLVE_START') {
                this.startSolveing();
            }

        }
        else if(this.status === 'BotSolving') { 
            if(cmd === 'SOLVE_END') {
                this.solveEnd(); 
                return ; 
            }

            if(this.gettingColor) { 
                console.log(cmd); 
                console.log([...cmd].length); 
                if(cmd.length !== 27 * 6) { 
                    this.errorHandler("color map error");
                    return; 
                }
                this.getColor(cmd); 
                this.gettingColor = false; 
            }

            else { 
                this.cube.pushTwist(cmd); 
            }
        }

    }
/**** command parse end *****/

    setStatus(status) { 
        this.status = status; 
        this.cube.setTwistDuration(this.getDuration()); 
        switch(status) { 
            case 'idle': 
                this.btns.resetButton.disabled = false;
                this.btns.startButton.disabled = true;
                this.btns.reverseButton.disabled = false;
                this.btns.connectButton.diabled = this.serial === null ? true : (!this.serial.isReading); 

                this.btns.connectButton.textContent = 'connect'; 
                this.btns.connectButton.classList.remove('connected');
                this.mouse.enableTwist = true; 
                this.mouse.setup(); 
                this.timer.reset(); 
                break; 

            case 'ctrlBot': 
                if(this.serial !== null && this.serial.isReading)
                    this.serial.sendMessage('\nCONNECT'); 
                else 
                    console.log("loss serial"); 
                
                this.btns.reverseButton.disabled = true; 
                this.btns.startButton.disabled = false; 
                this.btns.connectButton.disabled = true; 
                this.mouse.enableTwist = false; 
                
                this.btns.connectButton.textContent = "connected"; 
                this.btns.connectButton.classList.add('connected');
                this.timer.reset(); 
                break; 

            case 'BotSolving': 
                this.btns.reverseButton.disabled = true; 
                this.btns.startButton.disabled = true; 
                this.btns.connectButton.disabled = true; 
                this.mouse.enableTwist = false;  
                this.startSolveing();  
                
                break; 
        }
    }

    startSolveing() { 
        this.status = "BotSolving"; 
        this.gettingColor = true; 

        this.timer.reset(); 
        this.timer.start(); 
        
        this.cube.stopTwist(); 
        this.cube.clearHis(); 
        this.cube.clearColor(); 

        this.cube.setTwistDuration(this.getDuration());

    }

    solveEnd() { 
        this.timer.pause(); 
        this.cube.clearHis(); 
        this.status = "ctrlBot"; 
    }
}

