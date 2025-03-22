function(module, exports) {
    module.exports = function({buffer: buffer, baseMediaDecodeTime: baseMediaDecodeTime, boxes: boxes, trackId: trackId}) {
        const moofIndex = boxes.findIndex((({type: type}) => "moof" === type));
        if (-1 === moofIndex) return;
        const trafIndex = boxes[moofIndex].boxes.findIndex((({type: type, boxes: boxes}) => "traf" === type && boxes.some((box => "tfhd" === box.type && box.trackId === trackId))));
        if (-1 === trafIndex) return;
        const tfdtIndex = boxes[moofIndex].boxes[trafIndex].boxes.findIndex((({type: type}) => "tfdt" === type));
        if (-1 === tfdtIndex) return;
        const tfdtDataOffset = boxes.slice(0, moofIndex).reduce(((result, {size: size}) => result + size), 0) + 8 + boxes[moofIndex].boxes.slice(0, trafIndex).reduce(((result, {size: size}) => result + size), 0) + 8 + boxes[moofIndex].boxes[trafIndex].boxes.slice(0, tfdtIndex).reduce(((result, {size: size}) => result + size), 0) + 8;
        buffer.writeUInt8(1, tfdtDataOffset), buffer.writeBigUInt64BE(BigInt(Math.max(baseMediaDecodeTime, 0)), tfdtDataOffset + 4);
    };
}
