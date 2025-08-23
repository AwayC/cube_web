

export class Commander { 
    constructor() {
        this.client = 'key'; 
        this.cmdBuffList = { 
            'key': "", 
            'button': "", 
            "serial": "", 
        } 
    }

    addReciever(reciever) { 
        this.reciever = reciever; 
    }

    sendCommand(str, client) {
        const cmds = this.splitCommand(str, client); 
        
        if(cmds.length === 0) return ; 
        console.log(cmds); 

        cmds.forEach((cmd) => { 
            this.reciever.parseCommand(cmd, client); 
        }); 

        
    }

    splitCommand(str, client) { 
        let cmdBuff = this.cmdBuffList[client]; 
        cmdBuff += str; 
        const commands = cmdBuff.split('\n'); 
        if(cmdBuff.length === 0 || cmdBuff.slice(-1) === '\n') { 
            this.cmdBuffList[client] = ''; 
        } else {  
            this.cmdBuffList[client] = commands.pop();  
        }
        return commands.filter(cmd => cmd.length > 0); 
    }

}