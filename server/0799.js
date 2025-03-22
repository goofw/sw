function(module, exports, __webpack_require__) {
    const {spawn: spawn} = __webpack_require__(31), fs = __webpack_require__(2), path = __webpack_require__(4), kill = __webpack_require__(397), http = __webpack_require__(11), EventEmitter = __webpack_require__(5), portfinder = __webpack_require__(800), bridge = __webpack_require__(399), mode = __webpack_require__(400);
    let port = 11910;
    module.exports = class {
        constructor(options, forcedMode) {
            this.events = new EventEmitter, this.id = Math.random().toString(), this.convertProcess = null, 
            this.request = null, this.stream = null, this.polling = null, this.exitCode = null, 
            this.signalCode = null, port += 10, this.port = port, this.mode = mode || forcedMode;
            const ffmpeg = options.ffmpeg;
            this.create = async () => {
                const args = options.args;
                if (process.env.HLS_DEBUG && console.log(`HLSV2:convert:${options.track}:args`, args.join(" ")), 
                "remote" === this.mode) {
                    try {
                        this.port = await portfinder.getPortPromise({
                            port: this.port
                        });
                    } catch (e) {
                        process.env.HLS_DEBUG && console.log("HLSV2:warning", `Could not find open port, using ${this.port}`);
                    }
                    process.env.HLS_DEBUG && console.log(`HLSV2:remote:create ffmpeg process with port ${this.port}`);
                    const url = `http://127.0.0.1:${this.port}/${Date.now()}.mp4`;
                    return args.push("-listen", "1", url), new Promise(((resolve, reject) => {
                        const self = this;
                        bridge.on("ffmpeg:result", (function onResult(result) {
                            result.id === self.id && (bridge.off("ffmpeg:result", onResult), self.exitCode = result.error ? 1 : 0, 
                            self.events.emit("exit"), result.error && (reject(new Error(result.error)), self.destroy()));
                        })), bridge.dispatch("ffmpeg", {
                            id: self.id,
                            debug: !!process.env.HLS_DEBUG,
                            args: args
                        });
                        const poll = () => {
                            const req = http.request(url, (res => {
                                this.polling = !1, this.request = req, process.env.HLS_DEBUG && res.on("error", (err => {
                                    console.log(`HLSV2:convert:${options.track}:stderr`, err.message);
                                })), this.stream = res, this.stream.pause(), options.flowingMode || this.stream.on("resume", this.stream.pause), 
                                resolve(this);
                            }));
                            req.on("error", (err => {
                                this.request ? process.env.HLS_DEBUG && console.error(err) : (process.env.HLS_DEBUG && console.log("HLSV2:polling-http:500ms", err.message), 
                                this.polling = setTimeout(poll, 500));
                            })), req.end();
                        };
                        this.polling = setTimeout(poll, 500);
                    }));
                }
                if ("local" === this.mode) {
                    const stderr = process.env.HLS_DEBUG && "android" !== process.platform ? fs.openSync(path.join(path.dirname(__webpack_require__.c[__webpack_require__.s].filename), `ffmpeg_${options.track}_${encodeURIComponent(new URL(options.mediaURL).pathname)}.log`), "a") : "ignore";
                    return args.push("pipe:1"), this.convertProcess = spawn(ffmpeg, args, {
                        detached: !0,
                        stdio: [ "ignore", "pipe", stderr ]
                    }), this.stream = this.convertProcess.stdout, this.stream.pause(), options.flowingMode || this.stream.on("resume", this.stream.pause), 
                    this.convertProcess.on("exit", (() => {
                        this.exitCode = this.convertProcess.exitCode, this.signalCode = this.convertProcess.signalCode, 
                        this.events.emit("exit");
                    })), this;
                }
            }, this.destroy = () => {
                "remote" === this.mode ? (process.env.HLS_DEBUG && console.log(`HLSV2:remote:destroy ffmpeg process with port ${this.port}`), 
                this.polling && clearTimeout(this.polling), this.request && this.request.destroy(), 
                this.stream && this.stream.destroy(), bridge.dispatch("ffmpeg:cancel", {
                    id: this.id,
                    debug: !!process.env.HLS_DEBUG
                })) : "local" === this.mode && kill(this.convertProcess.pid, "SIGKILL");
            };
        }
    };
}
