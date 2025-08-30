
export class SerialMannager {
    constructor(commander) {

        this.enable = false;
        this.port = null;
        this.reader = null;
        this.writer = null;
        this.decoder = new TextDecoder();
        this.encoder = new TextEncoder();

        this.frameBuffer = new Uint8Array();
        this.frameTimeoutControls = null;
        this.frameDelay = 10;

        this.commander = commander;


        // 用于控制 readSerial 内部循环的标志
        this.isReading = false; 

        this.connectButton = document.getElementById('connectButton');
        this.disconnectButton = document.getElementById('disconnectButton');
        this.sendButton = document.getElementById('sendButton');
        this.messageInput = document.getElementById('messageInput');
        this.receivedDataEl = document.getElementById('receivedData');
        this.statusEl = document.getElementById('status').querySelector('span');
        // this.startButton = document.getElementById('startButton');
        this.serialLine = document.getElementById('serial-line');

        this.connect = this.connect.bind(this);
        this.closePort = this.closePort.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.readSerial = this.readSerial.bind(this);
        this.appendReceivedData = this.appendReceivedData.bind(this);
        this.processFrame = this.processFrame.bind(this);
        this.start = this.start.bind(this); 
        this.sendTxtMessage = this.sendTxtMessage.bind(this);
    

        this.createTimeoutControls = (callback, delay) => {
            let timerId = null;
            const start = () => {
                clearTimeout(timerId);
                timerId = setTimeout(callback, delay);
            };
            const stop = () => {
                clearTimeout(timerId);
                timerId = null;
            };
            return { start, stop };
        };

        this.checkSupport();
    }

    init() {
        if (this.enable === false)
            return;

        this.connectButton.addEventListener('click', this.connect);
        this.sendButton.addEventListener('click', this.sendTxtMessage);
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key == 'Enter') {
                this.sendTxtMessage();
            }
        });

        this.disconnectButton.addEventListener('click', async () => {
            await this.closePort();
        });

        // this.startButton.addEventListener('click', this.start); 
    }

    checkSupport() {
        if ("serial" in navigator) {
            this.statusEl.textContent = '浏览器支持 Web Serial API';
            this.statusEl.classList.add('connected');
            this.connectButton.disabled = false;
            this.enable = true;
        } else {
            this.statusEl.textContent = '您的浏览器不支持 Web Serial API。请使用基于 Chromium 的浏览器 (如 Chrome, Edge)';
            this.statusEl.classList.add('error');
            this.connectButton.disabled = true;
            this.enable = false;
        }

        return this.enable;
    }

    async connect() {
        try {
            this.port = await navigator.serial.requestPort({
                filters: []
            });

            await this.port.open({ baudRate: 9600 });

            this.statusEl.textContent = '已连接';
            this.statusEl.classList.remove('disconnected', 'error');
            this.statusEl.classList.add('connected');
            this.serialLine.classList.add('connected');
            this.serialLine.textContent = 'serial connected';
            this.connectButton.disabled = true;
            this.disconnectButton.disabled = false;
            this.sendButton.disabled = false;
            // this.startButton.disabled = false; 

            console.log('串口已连接并打开:', this.port);

            this.reader = this.port.readable.getReader();
            this.writer = this.port.writable.getWriter();

            this.isReading = true; // 设置读取标志为 true
            this.readSerial(); // 启动读取循环
            this.commander.sendCommand('SERIAL_CONNECED\n', 'serial'); 

            // 监听串口断开事件
            this.port.addEventListener('disconnect', () => {
                console.log('串口已断开（物理断开事件）');
                // 物理断开时，自动调用 closePort 进行清理，但要避免重复调用
                if (this.port) { // 检查 port 是否仍存在，避免 closePort 两次
                    this.closePort();
                }
            });

        } catch (error) {
            console.error('连接串口失败:', error);
            if (error.name === 'NotFoundError' && error.message.includes('No port selected')) {
                this.statusEl.textContent = '连接取消：用户未选择串口';
            } else {
                this.statusEl.textContent = `连接失败: ${error.message}`;
            }
            this.statusEl.classList.remove('connected');
            this.statusEl.classList.add('error');
            this.connectButton.disabled = false; // 允许再次尝试连接
            this.disconnectButton.disabled = true;
            this.sendButton.disabled = true;
            this.isReading = false; // 确保读取标志为 false
            // this.startButton.disabled = true; 
        }
    }

    processFrame() {
        if (this.frameBuffer.length > 0) {
            const completeFrameText = this.decoder.decode(this.frameBuffer);
            
            this.commander.sendCommand(completeFrameText, 'serial');
            this.appendReceivedData(completeFrameText);
            console.log('收到完整帧:', completeFrameText);
        }
        this.frameBuffer = new Uint8Array();
    }

    async readSerial() {
        if (!this.port || !this.port.readable) {
            console.warn("readSerial: Port or readable stream not available.");
            this.isReading = false; // 确保标志为 false
            return;
        }
        console.log("readSerial started with frame delimiting.");

        this.frameTimeoutControls = this.createTimeoutControls(this.processFrame, this.frameDelay);

        // 使用 isReading 标志来控制外层循环
        while (this.isReading && this.port && this.port.readable) {
            try {
                if (!this.reader) {
                    this.reader = this.port.readable.getReader();
                }
                while (this.isReading && this.port && this.reader) { // 内部循环也受 isReading 标志和 reader/port 状态控制
                    const { value, done } = await this.reader.read();

                    if (value) {
                        this.frameTimeoutControls.stop();
                        this.frameBuffer = new Uint8Array([...this.frameBuffer, ...value]);
                        this.frameTimeoutControls.start();
                    }

                    if (done) {
                        console.log('串口读取器已完成 (done=true)');
                        break; // 退出内部循环
                    }
                }
            } catch (error) {
                // 捕获到错误时（例如端口断开），应该退出循环
                console.error('读取串口失败:', error);
                this.appendReceivedData(`错误: 读取失败 (${error.message})`, 'error-message');
                // 退出外部循环
                this.isReading = false; // 设置标志为 false，停止读取
            } finally {
                // 确保 reader 锁被释放，无论如何
                if (this.reader) {
                    try {
                        this.reader.releaseLock();
                    } catch (releaseError) {
                        console.warn('释放 reader 锁失败:', releaseError);
                    }
                    this.reader = null;
                }
            }
        }
        console.log("readSerial stopped.");
        // 在 readSerial 完全停止后，处理一下最终的帧和状态
        this.frameTimeoutControls.stop();
        this.processFrame();
    }

    sendTxtMessage() { 
        const message = this.messageInput.value.trim();
        if(message) { 
            this.sendMessage(message);
        }
    }

    async sendMessage(msg) {
        if (msg && this.writer) {
            try {
                const data = this.encoder.encode(msg + '\n');
                await this.writer.write(data);
                console.log('发送数据:', msg);
                this.appendReceivedData(`Sent: ${msg}`, 'sent-message');
                this.messageInput.value = '';
            } catch (error) {
                console.error('写入串口失败:', error);
                this.appendReceivedData(`错误: 发送失败 (${error.message})`, 'error-message');
            }
        } else if (!msg) {
            alert('请输入要发送的消息。');
        } else {
            alert('串口未连接，无法发送数据');
        }
    }

    async closePort() {
        this.statusEl.textContent = '正在断开连接...';
        this.statusEl.classList.remove('connected', 'error');
        this.statusEl.classList.add('disconnected');
        this.connectButton.disabled = true;
        this.disconnectButton.disabled = true;
        this.sendButton.disabled = true;
        // this.startButton.disabled = true; 
        // this.startButton.classList.remove('active'); 
        this.serialLine.classList.remove('connected');
        this.serialLine.textContent = 'serial disconnected';

        // 设置 isReading 标志为 false，通知 readSerial 循环停止
        this.isReading = false;

        // 停止任何正在运行的帧计时器
        if (this.frameTimeoutControls) {
            this.frameTimeoutControls.stop();
            this.processFrame(); // 处理断开时缓冲区中剩余的任何数据
        }

        // 尝试取消读取操作，这将使 read() 返回 done=true 或抛出错误
        if (this.reader) {
            try {
                await this.reader.cancel();
                console.log('Reader cancellation requested.');
            } catch (error) {
                console.warn('取消 reader 失败:', error);
                // 某些情况下，cancel 本身可能因为端口已断开而失败，但这不是致命的
            }
        }

        // 等待 reader 完全释放锁（在 readSerial 的 finally 块中处理）
        // 这里的 await reader.releaseLock() 已经被移除了，因为它应该在 readSerial 的 finally 中执行

        if (this.writer) {
            try {
                await this.writer.releaseLock();
            } catch (error) {
                console.warn('释放 writer 锁失败:', error);
            } finally {
                this.writer = null;
            }
        }

        if (this.port) {
            try {
                await this.port.close();
                console.log('串口已关闭。');
            } catch (error) {
                console.error('关闭串口失败:', error);
            }
            this.port = null;
        }

        this.reader = null; // 确保 reader 引用被清除
        // this.isReading 已经在上面设置为 false

        this.statusEl.textContent = '已断开连接';
        this.connectButton.disabled = false;
    }

    appendReceivedData(data, className = '') {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        const newEntry = `[${timeString}] ${data}\n`;

        const currentLines = this.receivedDataEl.textContent.split('\n');
        if (currentLines.length > 500) {
            this.receivedDataEl.textContent = currentLines.slice(currentLines.length - 500).join('\n');
        }

        this.receivedDataEl.textContent += newEntry;
        this.receivedDataEl.scrollTop = this.receivedDataEl.scrollHeight;
    }

    async start() { 
        if(this.startButton.classList.contains('active')) {
            this.sendMessage("\nSTOP"); 
            this.startButton.classList.remove('active');
            this.commander.sendCommand("STOP\n", "button"); 
        }
        else if (this.writer) {
            this.sendMessage('\nCONNECT');
            this.startButton.classList.add('active');
            this.commander.sendCommand('CONNECT\n', "button");

        } else {
            alert('串口未连接，无法发送连接命令。');
        }
    }
}