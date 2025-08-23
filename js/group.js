/*
                                     ______________
                                    | 18   19   20 |
                                    |              |
                                    |  9   10   11 |
                                    |              |
                                    |  0    1    2 |
                    |===============|==============|===============|
                    |  18   9    0  |  0    1    2 |  2   11   20  |
                    |               |              |               |
                    |  21   12   3  |  3    4    5 |  5   14   23  |
                    |               |              |               |
                    |  24   15   6  |  6    7    8 |  8   17   26  |
                    |===============|==============|===============|
                                    |  6    7    8 |
                                    |              |
                                    | 15   16   17 |
                                    |              |
                                    | 24   25   26 |
                                    |              |
                                    |==============|
                                    | 24   25   26 |
                                    |              |
                                    | 21   22   23 |
                                    |              |
                                    | 18   19   20 |
                                    |==============|



*/


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
            24, 25, 26,
            21, 22, 23,
            18, 19, 20,
        ]
    }, 
    "left": {
        x: false, 
        y: false, 
        z: true, 
        ids: [
            18,  9,  0, 
            21, 12,  3, 
            24, 15,  6,
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
             2, 11, 20, 
             5, 14, 23,
             8, 17, 26,
        ]
    }, 
    "up": { 
        x: true, 
        y: false, 
        z: false,
        ids: [
             18, 19, 20,
             9, 10, 11,
             0,  1,  2,
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