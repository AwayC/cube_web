export const groupInfo = { 
    "front": {
        x: false, 
        y: true, 
        z: false, 
        ids: [
            0, 1, 2, 
            3, 4, 5, 
            6, 7, 8
        ]
    }, 
    "standing": {
        x: false, 
        y: true, 
        z: false, 
        ids: [   
             9, 10, 11, 
            12, 13, 14,
            15, 16, 17,
        ]
    }, 
    "back": {
        x: false, 
        y: true, 
        z: false,
        ids: [
            18, 19, 20,
            21, 22, 23,
            24, 25, 26,
        ]
    }, 
    "left": {
        x: false, 
        y: false, 
        z: true, 
        ids: [
             0,  3,  6, 
             9, 12, 15, 
            18, 21, 24,
        ]
    }, 
    "middle": { 
        x: false, 
        y: false, 
        z: true,  
        ids: [
             1,  4,  7, 
            10, 13, 16, 
            19, 22, 25,
        ]
    }, 
    "right": {
        x: false, 
        y: false, 
        z: true,  
        ids: [
             2,  5,  8, 
            11, 14, 17,
            20, 23, 26,
        ]
    }, 
    "up": { 
        x: true, 
        y: false, 
        z: false,
        ids: [
             0,  1,  2,
             9, 10, 11,
            18, 19, 20,
        ]
    }, 
    "equator": { 
        x: true,       
        y: false, 
        z: false, 
        ids: [
             3,  4,  5, 
            12, 13, 14, 
            21, 22, 23,
        ]
    }, 
    "down": { 
        x: true, 
        y: false, 
        z: false,
        ids: [
            6,  7,  8, 
            15, 16, 17,
            24, 25, 26,
        ]
    }
}


export class Group { 
    constructor(name, cubelets) {
        this.isTwisting = false; 
        this.name = name; 
        this.info = groupInfo[name]; 
        this.cubelets = []; 

        this.info.ids.forEach(id => {
            this.cubelets.push(cubelets[id]);
        });
    }

    getIds() { 
        return this.info.ids;  
    }
    

}