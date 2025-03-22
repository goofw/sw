function(module, exports, __webpack_require__) {
    const {finished: finished} = __webpack_require__(3), DecodeStream = __webpack_require__(422), readChunk = __webpack_require__(216), {open: openInputStream, close: closeInputStream} = __webpack_require__(856);
    async function parseBoxHeaders(buffer) {
        return new Promise(((resolve, reject) => {
            const boxes = [], decodeStream = new DecodeStream, cleanupDecodeStream = finished(decodeStream, (error => {
                cleanupDecodeStream(), decodeStream.off("box", onBox), error ? reject(error) : resolve(boxes);
            }));
            decodeStream.on("box", onBox);
            try {
                decodeStream.write(buffer), decodeStream._writableState.length > 0 && decodeStream._writableState.onwrite(), 
                decodeStream.end();
            } catch (error) {
                decodeStream.destroy(error);
            }
            function onBox(box) {
                boxes.push(box), decodeStream.ignore();
            }
        }));
    }
    module.exports = async function(url) {
        for (let seek = 0, seekOffset = 0; seek < 4; seek++) {
            const stream = await openInputStream(url, seekOffset), chunk = await readChunk(stream), boxes = await parseBoxHeaders(chunk), moovIndex = boxes.findIndex((({type: type}) => "moov" === type));
            if (-1 !== moovIndex) {
                const moovOffset = boxes.slice(0, moovIndex).reduce(((result, {length: length}) => result + length), 0), missingLength = boxes[moovIndex].length - (chunk.length - moovOffset);
                if (missingLength <= 0) return closeInputStream(stream), chunk.slice(moovOffset, moovOffset + boxes[moovIndex].length);
                const missingChunk = await readChunk(stream, missingLength);
                return closeInputStream(stream), Buffer.concat([ chunk.slice(moovOffset), missingChunk ]);
            }
            closeInputStream(stream), seekOffset += boxes.reduce(((result, {length: length}) => result + length), 0);
        }
        throw new Error("max seeks exceeded");
    };
}
