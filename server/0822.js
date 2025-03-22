function(module, exports, __webpack_require__) {
    const muxjs = __webpack_require__(412), getMoovBox = __webpack_require__(845), TRACK_TYPE_NAMES = {
        vide: "video",
        soun: "audio"
    };
    module.exports = async function(url, trackIndexes = []) {
        const moovBuffer = await getMoovBox(url), moov = muxjs.mp4.tools.inspect(moovBuffer)[0], mvhd = moov.boxes.find((({type: type}) => "mvhd" === type));
        if (!mvhd) throw new Error("mvhd atom missing");
        return moov.boxes.filter((({type: type}) => "trak" === type)).reduce(((result, trak, index) => {
            const mdia = trak.boxes.find((({type: type}) => "mdia" === type));
            if (!mdia) throw new Error("mdia atom missing");
            const hdlr = mdia.boxes.find((({type: type}) => "hdlr" === type));
            if (!hdlr) throw new Error("hdlr atom missing");
            if (!TRACK_TYPE_NAMES[hdlr.handlerType] || trackIndexes.length > 0 && !trackIndexes.includes(index)) return result;
            const mdhd = mdia.boxes.find((({type: type}) => "mdhd" === type));
            if (!mdhd) throw new Error("mdhd atom missing");
            const minf = mdia.boxes.find((({type: type}) => "minf" === type));
            if (!minf) throw new Error("minf atom missing");
            const stbl = minf.boxes.find((({type: type}) => "stbl" === type));
            if (!stbl) throw new Error("stbl atom missing");
            const edts = trak.boxes.find((({type: type}) => "edts" === type)), elst = edts && edts.boxes.find((({type: type}) => "elst" === type)), stts = stbl.boxes.find((({type: type}) => "stts" === type)), ctts = stbl.boxes.find((({type: type}) => "ctts" === type)), stss = stbl.boxes.find((({type: type}) => "stss" === type)), type = TRACK_TYPE_NAMES[hdlr.handlerType], timescale = mdhd.timescale, startTime = (elst ? elst.edits : []).reduce(((result, {mediaTime: mediaTime, segmentDuration: segmentDuration}) => mediaTime >= 0 ? result - mediaTime : -1 === mediaTime ? result + Math.round(segmentDuration * timescale / mvhd.timescale) : result), 0), compositionOffsets = (ctts ? ctts.compositionOffsets : []).reduce(((result, {sampleCount: sampleCount, sampleOffset: sampleOffset}) => {
                for (let i = 0; i < sampleCount; i++) result.push(sampleOffset);
                return result;
            }), []), durations = (stts ? stts.timeToSamples : []).reduce(((result, {sampleCount: sampleCount, sampleDelta: sampleDelta}) => {
                for (let i = 0; i < sampleCount; i++) result.push(sampleDelta);
                return result;
            }), []), samples = durations.reduce(((result, duration, index) => {
                const dts = index > 0 ? result[index - 1].dts + result[index - 1].duration : 0, pts = dts + ("number" == typeof compositionOffsets[index] ? compositionOffsets[index] : 0);
                return result.push({
                    key: !stss || stss.syncSamples.includes(index + 1),
                    pts: pts + (0 === index ? startTime : 0),
                    dts: dts + (0 === index ? startTime : 0),
                    duration: duration
                }), result;
            }), []), sampleDuration = samples.length > 0 ? samples.reduce(((result, {duration: duration}) => result + duration), 0) / samples.length : null;
            return {
                ...result,
                [index]: {
                    type: type,
                    timescale: timescale,
                    sampleDuration: sampleDuration,
                    samples: samples
                }
            };
        }), {});
    };
}
