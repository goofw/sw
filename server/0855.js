function(module, exports, __webpack_require__) {
    const {finished: finished} = __webpack_require__(3);
    module.exports = async function(stream, size) {
        return new Promise(((resolve, reject) => {
            if (!stream.readable) return void reject(new Error("stream not readable"));
            let missing = size;
            const chunks = [], cleanup = finished(stream, onFinished);
            function read() {
                if (0 === stream.readableLength) return;
                const chunk = "number" == typeof missing ? stream.read(Math.min(missing, stream.readableLength)) : stream.read();
                chunks.push(chunk), "number" == typeof missing && (missing -= chunk.length), "number" == typeof missing && 0 !== missing || (cleanup(), 
                stream.off("readable", read), resolve(Buffer.concat(chunks)));
            }
            function onFinished(error) {
                cleanup(), stream.off("readable", read), size === 1 / 0 && chunks.length > 0 ? resolve(Buffer.concat(chunks)) : reject(error || new Error("stream ended"));
            }
            stream.on("readable", read), stream.readableLength > 0 && read(), stream._readableState.ended && onFinished();
        }));
    };
}
