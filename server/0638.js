function(module, exports, __webpack_require__) {
    var mkv = __webpack_require__(639);
    function atPath() {
        var arg, args = Array.prototype.slice.call(arguments), data = args.shift();
        if (data) {
            for (;arg = args.shift(); ) {
                if (!arg) return data;
                if (!data.children) return;
                if (!(data = data.children.filter((function(x) {
                    return x._name === arg;
                }))[0])) return;
            }
            return data;
        }
    }
    function findById(all, name) {
        return all.filter((function(x) {
            return x._name === name;
        }))[0];
    }
    module.exports = function(url, cb) {
        new mkv.Decoder({
            skipTags: {
                SimpleBlock: !0,
                Void: !0,
                Block: !0,
                FileData: !0,
                Cluster: !0
            }
        }).parseEbmlIDs(url, [ mkv.Schema.byName.Cues, mkv.Schema.byName.Tracks ], (function(err, doc) {
            if (err) return cb(err);
            var videoTrackIdx = -1;
            if (atPath(doc, "Segment", "Tracks").children.forEach((function(track) {
                if (track.children) {
                    var trackNum = findById(track.children, "TrackNumber").getUInt();
                    1 === findById(track.children, "TrackType").getUInt() && (videoTrackIdx = trackNum);
                }
            })), -1 === videoTrackIdx) return cb(new Error("no video tracks found"));
            var cues = atPath(doc, "Segment", "Cues");
            if (!(cues && cues.children && cues.children.length)) return cb(new Error("no cues found in doc -> Segment -> Cues"));
            if (!(cues = cues.children.filter((function(x) {
                return "CuePoint" === x._name;
            }))).length) return cb(new Error("no CuePoints"));
            var frames = cues.filter((function(cue) {
                return cue.children[1].children[0].getUInt() === videoTrackIdx;
            })).map((function(cue) {
                var t = cue.children[0].getUInt();
                return {
                    timestamp: t,
                    pts: t,
                    dts: t
                };
            }));
            cb(null, frames);
        }));
    };
}
