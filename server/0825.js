function(module, exports, __webpack_require__) {
    "use strict";
    var timescale, startTime, compositionStartTime, getVideoTrackIds, getTracks, getTimescaleFromMediaHeader, toUnsigned = __webpack_require__(141).toUnsigned, toHexString = __webpack_require__(141).toHexString, findBox = __webpack_require__(208), parseType = __webpack_require__(209), parseTfhd = __webpack_require__(210), parseTrun = __webpack_require__(211), parseTfdt = __webpack_require__(212);
    timescale = function(init) {
        return findBox(init, [ "moov", "trak" ]).reduce((function(result, trak) {
            var tkhd, version, index, id, mdhd;
            return (tkhd = findBox(trak, [ "tkhd" ])[0]) ? (version = tkhd[0], id = toUnsigned(tkhd[index = 0 === version ? 12 : 20] << 24 | tkhd[index + 1] << 16 | tkhd[index + 2] << 8 | tkhd[index + 3]), 
            (mdhd = findBox(trak, [ "mdia", "mdhd" ])[0]) ? (index = 0 === (version = mdhd[0]) ? 12 : 20, 
            result[id] = toUnsigned(mdhd[index] << 24 | mdhd[index + 1] << 16 | mdhd[index + 2] << 8 | mdhd[index + 3]), 
            result) : null) : null;
        }), {});
    }, startTime = function(timescale, fragment) {
        var trafs, baseTimes, result;
        return trafs = findBox(fragment, [ "moof", "traf" ]), baseTimes = [].concat.apply([], trafs.map((function(traf) {
            return findBox(traf, [ "tfhd" ]).map((function(tfhd) {
                var id, scale, baseTime;
                return id = toUnsigned(tfhd[4] << 24 | tfhd[5] << 16 | tfhd[6] << 8 | tfhd[7]), 
                scale = timescale[id] || 9e4, baseTime = findBox(traf, [ "tfdt" ]).map((function(tfdt) {
                    var version, result;
                    return version = tfdt[0], result = toUnsigned(tfdt[4] << 24 | tfdt[5] << 16 | tfdt[6] << 8 | tfdt[7]), 
                    1 === version && (result *= Math.pow(2, 32), result += toUnsigned(tfdt[8] << 24 | tfdt[9] << 16 | tfdt[10] << 8 | tfdt[11])), 
                    result;
                }))[0], (baseTime = "number" != typeof baseTime || isNaN(baseTime) ? 1 / 0 : baseTime) / scale;
            }));
        }))), result = Math.min.apply(null, baseTimes), isFinite(result) ? result : 0;
    }, compositionStartTime = function(timescales, fragment) {
        var trackId, trafBoxes = findBox(fragment, [ "moof", "traf" ]), baseMediaDecodeTime = 0, compositionTimeOffset = 0;
        if (trafBoxes && trafBoxes.length) {
            var tfhd = findBox(trafBoxes[0], [ "tfhd" ])[0], trun = findBox(trafBoxes[0], [ "trun" ])[0], tfdt = findBox(trafBoxes[0], [ "tfdt" ])[0];
            if (tfhd && (trackId = parseTfhd(tfhd).trackId), tfdt && (baseMediaDecodeTime = parseTfdt(tfdt).baseMediaDecodeTime), 
            trun) {
                var parsedTrun = parseTrun(trun);
                parsedTrun.samples && parsedTrun.samples.length && (compositionTimeOffset = parsedTrun.samples[0].compositionTimeOffset || 0);
            }
        }
        return (baseMediaDecodeTime + compositionTimeOffset) / (timescales[trackId] || 9e4);
    }, getVideoTrackIds = function(init) {
        var traks = findBox(init, [ "moov", "trak" ]), videoTrackIds = [];
        return traks.forEach((function(trak) {
            var hdlrs = findBox(trak, [ "mdia", "hdlr" ]), tkhds = findBox(trak, [ "tkhd" ]);
            hdlrs.forEach((function(hdlr, index) {
                var view, trackId, handlerType = parseType(hdlr.subarray(8, 12)), tkhd = tkhds[index];
                "vide" === handlerType && (trackId = 0 === (view = new DataView(tkhd.buffer, tkhd.byteOffset, tkhd.byteLength)).getUint8(0) ? view.getUint32(12) : view.getUint32(20), 
                videoTrackIds.push(trackId));
            }));
        })), videoTrackIds;
    }, getTimescaleFromMediaHeader = function(mdhd) {
        var index = 0 === mdhd[0] ? 12 : 20;
        return toUnsigned(mdhd[index] << 24 | mdhd[index + 1] << 16 | mdhd[index + 2] << 8 | mdhd[index + 3]);
    }, getTracks = function(init) {
        var traks = findBox(init, [ "moov", "trak" ]), tracks = [];
        return traks.forEach((function(trak) {
            var view, tkhdVersion, track = {}, tkhd = findBox(trak, [ "tkhd" ])[0];
            tkhd && (tkhdVersion = (view = new DataView(tkhd.buffer, tkhd.byteOffset, tkhd.byteLength)).getUint8(0), 
            track.id = 0 === tkhdVersion ? view.getUint32(12) : view.getUint32(20));
            var hdlr = findBox(trak, [ "mdia", "hdlr" ])[0];
            if (hdlr) {
                var type = parseType(hdlr.subarray(8, 12));
                track.type = "vide" === type ? "video" : "soun" === type ? "audio" : type;
            }
            var stsd = findBox(trak, [ "mdia", "minf", "stbl", "stsd" ])[0];
            if (stsd) {
                var sampleDescriptions = stsd.subarray(8);
                track.codec = parseType(sampleDescriptions.subarray(4, 8));
                var codecConfig, codecBox = findBox(sampleDescriptions, [ track.codec ])[0];
                codecBox && (/^[a-z]vc[1-9]$/i.test(track.codec) ? (codecConfig = codecBox.subarray(78), 
                "avcC" === parseType(codecConfig.subarray(4, 8)) && codecConfig.length > 11 ? (track.codec += ".", 
                track.codec += toHexString(codecConfig[9]), track.codec += toHexString(codecConfig[10]), 
                track.codec += toHexString(codecConfig[11])) : track.codec = "avc1.4d400d") : /^mp4[a,v]$/i.test(track.codec) ? (codecConfig = codecBox.subarray(28), 
                "esds" === parseType(codecConfig.subarray(4, 8)) && codecConfig.length > 20 && 0 !== codecConfig[19] ? (track.codec += "." + toHexString(codecConfig[19]), 
                track.codec += "." + toHexString(codecConfig[20] >>> 2 & 63).replace(/^0/, "")) : track.codec = "mp4a.40.2") : track.codec = track.codec.toLowerCase());
            }
            var mdhd = findBox(trak, [ "mdia", "mdhd" ])[0];
            mdhd && (track.timescale = getTimescaleFromMediaHeader(mdhd)), tracks.push(track);
        })), tracks;
    }, module.exports = {
        findBox: findBox,
        parseType: parseType,
        timescale: timescale,
        startTime: startTime,
        compositionStartTime: compositionStartTime,
        videoTrackIds: getVideoTrackIds,
        tracks: getTracks,
        getTimescaleFromMediaHeader: getTimescaleFromMediaHeader
    };
}
