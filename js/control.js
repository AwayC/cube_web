import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import * as THREE from 'three';
import { gsap } from 'gsap'; 

export function createTrackBallControls(camera, dom) { 
    const controls = new TrackballControls(camera, dom);
    
    controls.target.set(0, 0, 0); 
    controls.rotateSpeed = 3;
    controls.zoomSpeed = 0; 
    controls.panSpeed = 0.8;


    controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,    
        MIDDLE: THREE.MOUSE.DOLLY,   
        RIGHT: THREE.MOUSE.PAN       
    };

    console.log("controls created");

    return controls;
}


const twistKeyMap = [
    // middle layer
    "S", "s", 
    "M", "m", 
    "E", "e", 
    
    // faces
    "D", "d", 
    "U", "u", 
    "L", "l",
    "R", 'r', 
    "B", "b", 
    "F", "f",

    // whole cube
    "Z", "z",
    "X", "x", 
    "Y", "y", 
]

const controlKeys = [
    "q", "p", 
]

export class KeyController { 
    constructor(renderer, commander, Mcontrols) {
        this.renderer = renderer;
        this.Mcontrols = Mcontrols;
        this.twistKeyMap = twistKeyMap;
        this.commander = commander;
        this.controlKeys = controlKeys;

        this.isTesting = false; 

    }

    setup() { 
        document.addEventListener('keydown', (event) => {
            if(this.twistKeyMap.includes(event.key)) {
                console.log("twist" + event.key);
                this.commander.sendCommand(event.key + '\n', 'key');
            } else if(this.controlKeys.includes(event.key)) { 
                this.commander.sendCommand(event.key + '\n', 'key');
            } else if(event.key === ' ') { 
                this.renderer.repositionCamera(true, this.Mcontrols);
            } else if(event.key === 'w') { 
                this.botSolveSimulate(); 
            }

        }); 
    }

    botSolveSimulate() { 
        if(this.isTesting) return ; 
        this.isTesting = true; 

        const colMap = 
        "*G*W*R"+"***W*R"+"B**W*R"
        +"*R***B"+"*****W"+"O****G"
        +"*GW**O"+"**W**O"+"O*G**Y"
        +"*B*W**"+"***R**"+"G**Y**"
        +"*B****"+"******"+"G*****"
        +"*OB***"+"**O***"+"G*W***"
        +"*Y*BR*"+"***BY*"+"R**YG*"
        +"*Y**R*"+"****Y*"+"R***G*"
        +"*OB*W*"+"**Y*O*"+"B*Y*O*" + "\n"; 
        // "*B*R*W"+"***R*W"+"G**R*W"+
        // "*B***W"+"*****W"+"G****W"+
        // "*BO**W"+"**O**W"+"G*O**W"+     
    
        // "*B*R**"+"***R**"+"G**R**"+
        // "*B****"+"******"+"G*****"+
        // "*BO***"+"**O***"+"G*O***"+
    
        // "*B*RY*"+"***RY*"+"G**RY*"+
        // "*B**Y*"+"****Y*"+"G***Y*"+ 
        // "*BO*Y*"+"**O*Y*"+"G*O*Y*" + '\n'; 
        
        const twistStrp = ['F','L','B','R','U','D'].join('\n') + '\n';

        const sendCommand = this.commander.sendCommand.bind(this.commander); 

        const delay = ms => new Promise(resolve => setTimeout(resolve, ms)); 

        // sendCommand('SERIAL_CONNECTED\n', 'serial'); 
        (async () => {
            sendCommand('SERIAL_CONNECTED\n', 'serial');
            await delay(2000); 

            sendCommand('CONNECT\n', "button"); 
            await delay(1000); 
            sendCommand('SOLVE_START\n', 'serial');
            
            await delay(700);
            sendCommand(colMap, 'serial');
            
            await delay(300);  // 总延迟700+300=1000ms
            sendCommand(twistStrp, 'serial');
            
            await delay(3000); // 总延迟1000+3000=4000ms
            sendCommand('SOLVE_END\n', 'serial');
            
            this.isTesting = false; 
        })();
    } 

}

export class SerialPanel { 
    constructor() { 
        this.switch = document.getElementById("switch");
        this.panel = document.getElementById('serial-container');
        this.arrow = document.getElementById('panelArrow'); 

        console.log(this.switch);
        console.log(this.panel);

        this.isHidden = true; 
        this.shift = this.shift.bind(this);

        this.init();         
    }

    init() { 
        if(this.switch === null || this.switch === undefined || this.panel === null || this.panel === undefined) { 
            return; 
        }
        
        this.switch.addEventListener('click', this.shift);        
    }

    shift() { 
        console.log("shift"); 
        this.arrow.classList.toggle('rotated');

        gsap.to(this.panel, { 
            x: this.isHidden ? 0 : '-100%', 
            duration: 0.5,
            ease: 'power2.inOut',
            onComplete: () => { 
                this.isHidden = !this.isHidden; 
            }

        }); 
    }
}

export class ControlPanel {
    constructor(commander) {
        this.reverseButton = document.getElementById("reverseBtn");

        this.resetButton = document.getElementById("resetBtn");
        this.startButton = document.getElementById("startBtn");
        this.connectButton = document.getElementById("connectBtn");

        this.commander = commander;
        this.init(); 
    }

    init() { 
        this.resetButton.addEventListener("click", () => { 
            this.commander.sendCommand('reset\n', 'button'); 
        });

        this.startButton.addEventListener("click", () => {
            this.commander.sendCommand('startSOLVE\n', 'button');
        }); 

        this.connectButton.addEventListener("click", () => {
            this.commander.sendCommand('CONNECT\n', 'button');
        });
        
        this.reverseButton.addEventListener("click", () => {
            this.commander.sendCommand('reverse\n', 'button');
        });
    }
}