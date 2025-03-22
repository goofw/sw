function(module, exports, __webpack_require__) {
    var mp4box = __webpack_require__(678), needle = __webpack_require__(278), fs = __webpack_require__(2);
    function iterateCounts(counts, values, fn) {
        var idx = 0;
        counts.forEach((function(count, i) {
            for (var j = 0; j != count; j++) fn(values[i], idx++);
        }));
    }
    module.exports = function(url, cb) {
        var box = mp4box.createFile(), pos = 0, maxSeeks = 0;
        function onData(buf) {
            var b = (function(buffer) {
                for (var ab = new ArrayBuffer(buffer.length), view = new Uint8Array(ab), i = 0; i < buffer.length; ++i) view[i] = buffer[i];
                return ab;
            })(buf);
            if (b.fileStart = pos, pos += b.byteLength, box.appendBuffer(b), box.mdats.length && !box.moovStartFound) {
                var offset = box.boxes.map((function(x) {
                    return x.size;
                })).reduce((function(a, b) {
                    return a + b;
                }), 0);
                if (offset > lastOffset) {
                    if (maxSeeks > 3) return stream.close ? stream.close() : stream.end(), cb(new Error("maxSeeks exceeded"));
                    maxSeeks++, startStream(url, offset);
                }
            }
        }
        var stream, lastOffset = 0;
        function closeStream() {
            if (stream) return stream instanceof fs.ReadStream && "function" == typeof stream.close ? stream.close() : stream.request && "function" == typeof stream.request.abort ? stream.request.abort() : "function" == typeof stream.destroy ? stream.destroy() : void 0;
        }
        function startStream(url, offset) {
            closeStream(), lastOffset = offset, pos = offset, stream = /^http(s?):\/\//.test(url) ? needle.get(url, {
                headers: {
                    range: "bytes=" + offset + "-"
                }
            }).on("error", box.onError).on("end", (function(e) {
                box.flush();
            })).on("data", onData) : fs.createReadStream(url, {
                start: offset
            }).on("error", box.onError).on("end", (function() {
                box.flush();
            })).on("data", onData);
        }
        box.onError = function(err) {
            closeStream(), cb(err);
        }, startStream(url, 0), box.onReady = function(info) {
            if (box.flush(), closeStream(), !info) return cb(new Error("no info returned"));
            if (!info.videoTracks[0]) return cb(new Error("no videoTracks[0]"));
            try {
                var frames = (function(box) {
                    var track = box.moov.traks.filter((function(t) {
                        return t.mdia.minf.stbl.stss;
                    }))[0], stts = track.mdia.minf.stbl.stts, ctts = track.mdia.minf.stbl.ctts, mdhd = track.mdia.mdhd, allDts = [];
                    iterateCounts(stts.sample_counts, stts.sample_deltas, (function(delta, idx) {
                        allDts.push(idx * delta);
                    }));
                    var allPts = [];
                    ctts && iterateCounts(ctts.sample_counts, ctts.sample_offsets, (function(offset, idx) {
                        allPts.push(allDts[idx] + offset);
                    }));
                    var frames = track.mdia.minf.stbl.stss.sample_numbers.map((function(x) {
                        var dts = allDts[x - 1] / mdhd.timescale * 1e3, pts = ctts ? allPts[x - 1] / mdhd.timescale * 1e3 : dts;
                        return {
                            dts: dts,
                            pts: pts,
                            timestamp: pts,
                            index: x
                        };
                    }));
                    return frames[0] && 1 !== frames[0].index && frames.unshift({
                        timestamp: 0,
                        dts: 0,
                        index: 1
                    }), frames;
                })(box);
                cb(null, frames);
            } catch (e) {
                cb(e);
            }
        };
    };
}
