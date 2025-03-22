function(module, exports) {
    module.exports = function collect(stream) {
        if (!stream._collected) {
            if (stream._paused) return stream.on("resume", collect.bind(null, stream));
            stream._collected = !0, stream.pause(), stream.on("data", save), stream.on("end", save);
            var buf = [];
            stream.on("entry", saveEntry);
            var orig, entryBuffer = [];
            stream.on("proxy", (function(p) {
                p.pause();
            })), stream.pipe = (orig = stream.pipe, function(dest) {
                var e = 0;
                return (function unblockEntry() {
                    var entry = entryBuffer[e++];
                    if (!entry) return stream.removeListener("entry", saveEntry), stream.removeListener("data", save), 
                    stream.removeListener("end", save), stream.pipe = orig, dest && stream.pipe(dest), 
                    buf.forEach((function(b) {
                        b ? stream.emit("data", b) : stream.emit("end");
                    })), void stream.resume();
                    entry.on("end", unblockEntry), dest ? dest.add(entry) : stream.emit("entry", entry);
                })(), dest;
            });
        }
        function save(b) {
            "string" == typeof b && (b = new Buffer(b)), Buffer.isBuffer(b) && !b.length || buf.push(b);
        }
        function saveEntry(e) {
            collect(e), entryBuffer.push(e);
        }
    };
}
