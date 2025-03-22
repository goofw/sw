function(module, exports, __webpack_require__) {
    "use strict";
    var __importDefault = this && this.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : {
            default: mod
        };
    };
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    const stream_1 = __webpack_require__(3), sax_1 = __importDefault(__webpack_require__(175)), parse_time_1 = __webpack_require__(437);
    class DashMPDParser extends stream_1.Writable {
        constructor(targetID) {
            let lastTag;
            super(), this._parser = sax_1.default.createStream(!1, {
                lowercase: !0
            }), this._parser.on("error", this.destroy.bind(this));
            let segmentTemplate, timescale, offset, duration, baseURL, isStatic, treeLevel, periodStart, currtime = 0, seq = 0, timeline = [], getSegments = !1, gotSegments = !1;
            const tmpl = str => {
                const context = {
                    RepresentationID: targetID,
                    Number: seq,
                    Time: currtime
                };
                return str.replace(/\$(\w+)\$/g, ((m, p1) => context[p1] + ""));
            };
            this._parser.on("opentag", (node => {
                switch (node.name) {
                  case "mpd":
                    currtime = node.attributes.availabilitystarttime ? new Date(node.attributes.availabilitystarttime).getTime() : 0, 
                    isStatic = "dynamic" !== node.attributes.type;
                    break;

                  case "period":
                    seq = 0, timescale = 1e3, duration = 0, offset = 0, baseURL = [], treeLevel = 0, 
                    periodStart = parse_time_1.durationStr(node.attributes.start) || 0;
                    break;

                  case "segmentlist":
                    seq = parseInt(node.attributes.startnumber) || seq, timescale = parseInt(node.attributes.timescale) || timescale, 
                    duration = parseInt(node.attributes.duration) || duration, offset = parseInt(node.attributes.presentationtimeoffset) || offset;
                    break;

                  case "segmenttemplate":
                    segmentTemplate = node.attributes, seq = parseInt(node.attributes.startnumber) || seq, 
                    timescale = parseInt(node.attributes.timescale) || timescale;
                    break;

                  case "segmenttimeline":
                  case "baseurl":
                    lastTag = node.name;
                    break;

                  case "s":
                    timeline.push({
                        duration: parseInt(node.attributes.d),
                        repeat: parseInt(node.attributes.r),
                        time: parseInt(node.attributes.t)
                    });
                    break;

                  case "adaptationset":
                  case "representation":
                    treeLevel++, null == targetID && (targetID = node.attributes.id), getSegments = node.attributes.id === targetID + "", 
                    getSegments && (periodStart && (currtime += periodStart), offset && (currtime -= offset / timescale * 1e3), 
                    this.emit("starttime", currtime));
                    break;

                  case "initialization":
                    getSegments && this.emit("item", {
                        url: baseURL.filter((s => !!s)).join("") + node.attributes.sourceurl,
                        seq: seq,
                        init: !0,
                        duration: 0
                    });
                    break;

                  case "segmenturl":
                    if (getSegments) {
                        gotSegments = !0;
                        let tl = timeline.shift(), segmentDuration = (tl && tl.duration || duration) / timescale * 1e3;
                        this.emit("item", {
                            url: baseURL.filter((s => !!s)).join("") + node.attributes.media,
                            seq: seq++,
                            duration: segmentDuration
                        }), currtime += segmentDuration;
                    }
                }
            }));
            const onEnd = () => {
                isStatic && this.emit("endlist"), getSegments ? this.emit("end") : this.destroy(Error(`Representation '${targetID}' not found`));
            };
            this._parser.on("closetag", (tagName => {
                switch (tagName) {
                  case "adaptationset":
                  case "representation":
                    if (treeLevel--, segmentTemplate && timeline.length) {
                        gotSegments = !0, segmentTemplate.initialization && this.emit("item", {
                            url: baseURL.filter((s => !!s)).join("") + tmpl(segmentTemplate.initialization),
                            seq: seq,
                            init: !0,
                            duration: 0
                        });
                        for (let {duration: duration, repeat: repeat, time: time} of timeline) {
                            duration = duration / timescale * 1e3, repeat = repeat || 1, currtime = time || currtime;
                            for (let i = 0; i < repeat; i++) this.emit("item", {
                                url: baseURL.filter((s => !!s)).join("") + tmpl(segmentTemplate.media),
                                seq: seq++,
                                duration: duration
                            }), currtime += duration;
                        }
                    }
                    gotSegments && (this.emit("endearly"), onEnd(), this._parser.removeAllListeners(), 
                    this.removeAllListeners("finish"));
                }
            })), this._parser.on("text", (text => {
                "baseurl" === lastTag && (baseURL[treeLevel] = text, lastTag = null);
            })), this.on("finish", onEnd);
        }
        _write(chunk, encoding, callback) {
            this._parser.write(chunk, encoding), callback();
        }
    }
    exports.default = DashMPDParser;
}
