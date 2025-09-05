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

class Picker { 
    constructor(cube, scene, camera, width, height) {
        this.camera = camera;
        this.scene = scene; 
        this.width = width; 
        this.height = height; 
        this.cube = cube; 
        this.raycaster = new THREE.Raycaster();
        this.pickedObject = null; 
        this.pickPlane = null; 
    }

    getIntersection(x, y) { 
        const norX = (x / this.width) * 2 - 1;
        const norY = -(y / this.height) * 2 + 1;

        this.raycaster.setFromCamera({x: norX, y: norY}, this.camera);
        const intersectedObjects = this.raycaster.intersectObjects(this.scene.children);

        if(intersectedObjects.length) {
            this.pickedObject = intersectedObjects[0];

            const mesh = this.pickedObject.object; 
            const matrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld); 
            
            this.pickPlane = new THREE.Plane(this.pickedObject.face.normal.clone().applyMatrix3(matrix).normalize(), 
                                            this.cube.cubeletSize * 1.5); 
 
            return true; 
        } 
        else return false; 
    }

    intersectObject() {
        let obj = 0; 
        
        for(let i = 0;i < this.cube.cubelets.length;i ++) { 
            const meshes = this.cube.cubelets[i].mesh.children; 

            let flag = false; 
            if(this.pickedObject.object === this.cube.cubelets[i].mesh) { 
                obj = i; 
                break;
            }
            for(let j = 0;j < meshes.length;j ++) { 
                if(meshes[j] === this.pickedObject.object) { 
                    obj = i; 
                    flag = true; 
                    break; 
                }
            }
            if(flag) break; 

        }

        return {
            x: obj % 3, 
            y: ((obj % 9) / 3) | 0, 
            z: (obj / 9) | 0
        }; 
    }


    getPickOnPlane(x, y) { 
        const norX = (x / this.width) * 2 - 1;
        const norY = -(y / this.height) * 2 + 1;

        this.raycaster.setFromCamera({x: norX, y: norY}, this.camera);
        const intersectionPoint = new THREE.Vector3();

        // 使用 raycaster.ray (THREE.Ray 实例) 与平面进行交集检测
        const result = this.raycaster.ray.intersectPlane(this.pickPlane, intersectionPoint);

        return result; 
    }
}

export class MouseController {
    constructor(cube, renderer, doc) {
        this.enabled = false;
        this.renderer = renderer; 
        this.cube = cube;
        this.mesh = this.cube.threeObject;
        this.doc = doc;
        this.twistSpeed = 0.03; 
        this.dragSpeed = 0.01; 
        this.dragStartTime = 0; 
        this.dragInited = false;
        this.active = false; //是否旋转切片
        this.enableTwist = true; 
        this.preX = 0;
        this.preY = 0;
        this.curX = 0;
        this.curY = 0;
        this.startX = 0;
        this.startY = 0;
        this.picker = new Picker(cube, renderer.scene, renderer.camera, doc.clientWidth, doc.clientHeight); 
        this.possSlice = []; 
        this.curSlice = null; 
        this.tempVec = new THREE.Vector3();
        this.dragAxis = new THREE.Vector3();
        this.startVec = new THREE.Vector3();
        this.dragVec = new THREE.Vector3();

        this.mouseMove = this.mouseMove.bind(this);
        this.clickdone = this.clickdone.bind(this);
        this.firstClick = this.firstClick.bind(this);


        this.tempAxis = new THREE.Vector3();
        this.tempQuaternion = new THREE.Quaternion();
    }

    setup() {
        this.doc.removeEventListener('mousedown', this.firstClick);
        this.doc.removeEventListener('mouseout', this.clickdone);
        this.doc.removeEventListener('mousemove', this.mouseMove);
        this.doc.removeEventListener('mouseup', this.clickdone);

        this.doc.addEventListener('touchstart', this.firstClick); 
        this.doc.addEventListener('mousedown', this.firstClick);
        this.enabled = true;
    }

    eventX(event) { 
        return (event.touches && event.touches[0] || event).clientX;
    }

    eventY(event) { 
        return (event.touches && event.touches[0] || event).clientY;
    }

    firstClick(event) {
        if(this.enabled === false || event.button === 2) return;

        this.preX = this.eventX(event);
        this.preY = this.eventY(event);
        this.curX = this.eventX(event);
        this.curY = this.eventY(event);
        this.startX = this.eventX(event);
        this.startY = this.eventY(event);

        const res = this.picker.getIntersection(this.curX, this.curY);
        if(!this.cube.isTwisting && res && this.enableTwist) { 
            this.active = true; 
            this.cube.isDragging= true; 

            this.dragStartTime = typeof window !== 'undefined' && typeof window.performance !== 'undefined' && typeof window.performance.now !== 'undefined' ? window.performance.now() : Date.now();
            this.pickedCubelet = this.picker.intersectObject();

            this.possSlice = [
                this.cube.slices[this.pickedCubelet.x], 
                this.cube.slices[this.pickedCubelet.y + 3], 
                this.cube.slices[this.pickedCubelet.z + 6], 
            ]; 

            this.startVec = this.picker.getPickOnPlane(this.startX, this.startY);
        }


        this.doc.removeEventListener('mousedown', this.firstClick);
        this.doc.removeEventListener('touchstart', this.mouseMove);
        
        this.doc.addEventListener('mouseout', this.clickdone);
        this.doc.addEventListener('mousemove', this.mouseMove);
        this.doc.addEventListener('mouseup', this.clickdone);
        this.doc.addEventListener('touchcancel', this.clickdone);
        this.doc.addEventListener('touchend', this.clickdone); 
        this.doc.addEventListener('touchmove', this.mouseMove);
        
    }

    clickdone(event) {
        if(this.enabled === false || event.button === 2) return;
        this.active = false; // 重置拖动状态
        
        if(this.dragInited) { 
            this.dragInited = false; 

            if (event.touches !== null) event.preventDefault();
 
            const twistCmd = this.curSlice.name[0].toUpperCase(); 
            const curRotation = this.curSlice.rotation; 

            let targetRotation = Math.round(curRotation / Math.PI * 2) * Math.PI * 0.5;

            if(this.dragVec.length() / ((typeof window !== 'undefined' && typeof window.performance !== 'undefined' && typeof window.performance.now !== 'undefined' ? window.performance.now() : Date.now()) - this.dragStartTime) > 0.3) { 
                targetRotation = Math.floor(curRotation / Math.PI * 2) * Math.PI * 0.5;

                targetRotation += (targetRotation > 0) ? 0.5 * Math.PI : 0; 
            }

            targetRotation = Math.round(targetRotation / Math.PI * 2) * 90; 
            this.cube.twist({
                command: twistCmd,
                degree: targetRotation,
                isDrag: true, 
            }, false); 
 
            this.curSlice = null; 
        } 

        this.preX = this.curX; 
        this.preY = this.curY;


        this.doc.removeEventListener('mousemove', this.mouseMove);
        this.doc.removeEventListener('mouseout', this.clickdone);
        this.doc.removeEventListener('mouseup', this.clickdone);
        this.doc.removeEventListener('touchmove', this.mouseMove);
        this.doc.removeEventListener('touchcancel', this.clickdone);
        this.doc.removeEventListener('touchend', this.clickdone); 

        this.doc.addEventListener('mousedown', this.firstClick);
        this.doc.addEventListener('touchstart', this.firstClick); 
 
    }

    mouseMove(event) {
        if(this.enabled === false) return;

        this.curX = this.eventX(event);
        this.curY = this.eventY(event);

        event.preventDefault();
        event.stopImmediatePropagation();
    }

    update() {
        if(this.enabled === false) return ; 
        
        if(this.active) { 
            this.dragVec = this.picker.getPickOnPlane(this.curX, this.curY);

            this.dragVec.sub(this.startVec); 
            if(!this.dragInited) { 

                if(this.curSlice) this.curSlice.rotation = 0;
                if(this.dragVec.length() < 5) return ;
                this.dragInited = true;
                this.tempVec.crossVectors(this.dragVec, this.picker.pickPlane.normal); 
                this.tempVec.applyMatrix4(this.mesh.matrixWorld.clone().invert()); // 转换到cube坐标


                this.tempVec.x = Math.abs(this.tempVec.x);
                this.tempVec.y = Math.abs(this.tempVec.y);
                this.tempVec.z = Math.abs(this.tempVec.z);

                const MaxAxis = Math.max(this.tempVec.x, this.tempVec.y, this.tempVec.z);
                this.tempVec.x = (this.tempVec.x / MaxAxis) | 0;
                this.tempVec.y = (this.tempVec.x === 1) ? 0 : this.tempVec.y / MaxAxis | 0;

                this.tempVec.z = (this.tempVec.x === 1 || this.tempVec.y === 1) ? 0 : this.tempVec.z / MaxAxis | 0;

                this.curSlice = this.possSlice[this.tempVec.y + this.tempVec.z * 2];
                 
                this.dragAxis.crossVectors(this.curSlice.normal.clone().applyMatrix4(this.mesh.matrixWorld), this.picker.pickPlane.normal); 
            }

            if(this.dragInited) { 
                const dragAngle = this.dragAxis.dot(this.dragVec) * this.twistSpeed; 

                if(this.curSlice) { 
                    this.cube.dragSlice(this.curSlice, dragAngle);
                }
            }
        }
        else { 
            const deltaX = this.curX - this.preX;
            const deltaY = this.curY - this.preY;

            if (deltaX === 0 && deltaY === 0) {
                return;
            }


            this.tempAxis.set(deltaY, deltaX, 0).normalize();
            const angle = Math.sqrt(deltaX ** 2 + deltaY ** 2) * this.dragSpeed;

            this.tempQuaternion.setFromAxisAngle(this.tempAxis, angle);
            
            this.mesh.quaternion.premultiply(this.tempQuaternion);

        }
        this.preX = this.curX;
        this.preY = this.curY;
        
    }
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
                // console.log("twist" + event.key);
                this.commander.sendCommand(event.key + '\n', 'key');
            } else if(this.controlKeys.includes(event.key)) { 
                this.commander.sendCommand(event.key + '\n', 'key');
            } else if(event.key === ' ') { 
                this.commander.sendCommand("ResetRatation\n", "key"); 
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
            await delay(1000); 

            sendCommand('CONNECT\n', "button"); 
            await delay(1000); 
            sendCommand('SOLVE_START\n', 'serial');
            
            await delay(700);
            sendCommand(colMap, 'serial');
            
            await delay(300);  
            sendCommand(twistStrp, 'serial');
            
            await delay(2000); 
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

        this.resetButton = document.getElementById("resetBtn");
        this.startButton = document.getElementById("startBtn");
        this.connectButton = document.getElementById("connectBtn");
        this.rotateButton = document.getElementById("resetRotation");
        this.reverseButton = document.getElementById("reverseBtn");

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

        this.rotateButton.addEventListener("click", () => {
            this.commander.sendCommand("ResetRatation\n", "key"); 
        });
    }
}