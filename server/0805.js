function(module, exports, __webpack_require__) {
    const {spawn: spawn} = __webpack_require__(31), fs = __webpack_require__(2), path = __webpack_require__(4), kill = __webpack_require__(397), EventEmitter = __webpack_require__(5), {Readable: Readable} = __webpack_require__(3), bridge = __webpack_require__(399), mode = (__webpack_require__(11), 
    __webpack_require__(400));
    module.exports = class {
        constructor(options, forcedMode) {
            this.events = new EventEmitter, this.probeProcess = null, this.stream = null, this.mode = forcedMode || mode;
            const ffprobe = options.ffprobe;
            this.create = () => {
                const args = [ "-show_entries", "stream=index,bit_rate,max_bit_rate,codec_type,codec_name,start_time,start_pts,r_frame_rate,sample_rate,channels,channel_layout,time_base,has_b_frames,nb_frames,width,height,color_space,color_transfer,color_primaries,codec_tag_string : stream_tags=title,language,duration,bps,number_of_bytes : format=format_name,duration,bit_rate,max_bit_rate", "-print_format", "json", options.mediaURL ];
                if ("remote" === this.mode) return new Promise(((resolve, reject) => {
                    const self = this, id = Math.random().toString();
                    bridge.on("ffprobe:result", (function onResult(result) {
                        result.id === id && (bridge.off("ffprobe:result", onResult), result.error ? reject(new Error(result.error)) : (self.stream = Readable.from([ result.data ]), 
                        setTimeout((() => {
                            self.events.emit("close", 0, null);
                        }), 500), resolve(self)));
                    })), bridge.dispatch("ffprobe", {
                        id: id,
                        debug: !!process.env.HLS_DEBUG,
                        args: args
                    });
                }));
                if ("local" === this.mode) {
                    const stderr = process.env.HLS_DEBUG && "android" !== process.platform ? fs.openSync(path.join(path.dirname(__webpack_require__.c[__webpack_require__.s].filename), `ffprobe_${encodeURIComponent(new URL(options.mediaURL).pathname)}.log`), "a") : "ignore";
                    return this.probeProcess = spawn(ffprobe, args, {
                        detached: !0,
                        stdio: [ "ignore", "pipe", stderr ]
                    }), this.stream = this.probeProcess.stdout, this.probeProcess.on("close", ((code, signal) => {
                        this.events.emit("close", code, signal);
                    })), this;
                }
            }, this.destroy = () => {
                "remote" === this.mode || "local" === this.mode && kill(this.probeProcess.pid, "SIGKILL");
            };
        }
    };
}
