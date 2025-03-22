function(module, exports, __webpack_require__) {
    const {finished: finished} = __webpack_require__(3), DecodeStream = __webpack_require__(422), readChunk = __webpack_require__(216);
    module.exports = async function(stream, type) {
        return new Promise(((resolve, reject) => {
            const chunks = [], decodeStream = new DecodeStream, cleanupDecodeStream = finished(decodeStream, (() => {
                cleanupDecodeStream(), decodeStream.off("box", onBox);
            }));
            async function onBox(box) {
                decodeStream.ignore(), box.type === type ? (await next(box.contentLen), resolve(Buffer.concat(chunks))) : next(box.contentLen + 8);
            }
            async function next(size) {
                try {
                    const chunk = await readChunk(stream, size);
                    chunks.push(chunk), decodeStream.write(chunk);
                } catch (error) {
                    decodeStream.destroy(), reject(error);
                }
            }
            decodeStream.on("box", onBox), next(8);
        }));
    };
}
