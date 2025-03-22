function(module, exports, __webpack_require__) {
    "use strict";
    var sampleForFrame = function(frame, dataOffset) {
        var sample = {
            size: 0,
            flags: {
                isLeading: 0,
                dependsOn: 1,
                isDependedOn: 0,
                hasRedundancy: 0,
                degradationPriority: 0,
                isNonSyncSample: 1
            }
        };
        return sample.dataOffset = dataOffset, sample.compositionTimeOffset = frame.pts - frame.dts, 
        sample.duration = frame.duration, sample.size = 4 * frame.length, sample.size += frame.byteLength, 
        frame.keyFrame && (sample.flags.dependsOn = 2, sample.flags.isNonSyncSample = 0), 
        sample;
    };
    module.exports = {
        groupNalsIntoFrames: function(nalUnits) {
            var i, currentNal, currentFrame = [], frames = [];
            for (frames.byteLength = 0, frames.nalCount = 0, frames.duration = 0, currentFrame.byteLength = 0, 
            i = 0; i < nalUnits.length; i++) "access_unit_delimiter_rbsp" === (currentNal = nalUnits[i]).nalUnitType ? (currentFrame.length && (currentFrame.duration = currentNal.dts - currentFrame.dts, 
            frames.byteLength += currentFrame.byteLength, frames.nalCount += currentFrame.length, 
            frames.duration += currentFrame.duration, frames.push(currentFrame)), (currentFrame = [ currentNal ]).byteLength = currentNal.data.byteLength, 
            currentFrame.pts = currentNal.pts, currentFrame.dts = currentNal.dts) : ("slice_layer_without_partitioning_rbsp_idr" === currentNal.nalUnitType && (currentFrame.keyFrame = !0), 
            currentFrame.duration = currentNal.dts - currentFrame.dts, currentFrame.byteLength += currentNal.data.byteLength, 
            currentFrame.push(currentNal));
            return frames.length && (!currentFrame.duration || currentFrame.duration <= 0) && (currentFrame.duration = frames[frames.length - 1].duration), 
            frames.byteLength += currentFrame.byteLength, frames.nalCount += currentFrame.length, 
            frames.duration += currentFrame.duration, frames.push(currentFrame), frames;
        },
        groupFramesIntoGops: function(frames) {
            var i, currentFrame, currentGop = [], gops = [];
            for (currentGop.byteLength = 0, currentGop.nalCount = 0, currentGop.duration = 0, 
            currentGop.pts = frames[0].pts, currentGop.dts = frames[0].dts, gops.byteLength = 0, 
            gops.nalCount = 0, gops.duration = 0, gops.pts = frames[0].pts, gops.dts = frames[0].dts, 
            i = 0; i < frames.length; i++) (currentFrame = frames[i]).keyFrame ? (currentGop.length && (gops.push(currentGop), 
            gops.byteLength += currentGop.byteLength, gops.nalCount += currentGop.nalCount, 
            gops.duration += currentGop.duration), (currentGop = [ currentFrame ]).nalCount = currentFrame.length, 
            currentGop.byteLength = currentFrame.byteLength, currentGop.pts = currentFrame.pts, 
            currentGop.dts = currentFrame.dts, currentGop.duration = currentFrame.duration) : (currentGop.duration += currentFrame.duration, 
            currentGop.nalCount += currentFrame.length, currentGop.byteLength += currentFrame.byteLength, 
            currentGop.push(currentFrame));
            return gops.length && currentGop.duration <= 0 && (currentGop.duration = gops[gops.length - 1].duration), 
            gops.byteLength += currentGop.byteLength, gops.nalCount += currentGop.nalCount, 
            gops.duration += currentGop.duration, gops.push(currentGop), gops;
        },
        extendFirstKeyFrame: function(gops) {
            var currentGop;
            return !gops[0][0].keyFrame && gops.length > 1 && (currentGop = gops.shift(), gops.byteLength -= currentGop.byteLength, 
            gops.nalCount -= currentGop.nalCount, gops[0][0].dts = currentGop.dts, gops[0][0].pts = currentGop.pts, 
            gops[0][0].duration += currentGop.duration), gops;
        },
        generateSampleTable: function(gops, baseDataOffset) {
            var h, i, sample, currentGop, currentFrame, dataOffset = baseDataOffset || 0, samples = [];
            for (h = 0; h < gops.length; h++) for (currentGop = gops[h], i = 0; i < currentGop.length; i++) currentFrame = currentGop[i], 
            dataOffset += (sample = sampleForFrame(currentFrame, dataOffset)).size, samples.push(sample);
            return samples;
        },
        concatenateNalData: function(gops) {
            var h, i, j, currentGop, currentFrame, currentNal, dataOffset = 0, nalsByteLength = gops.byteLength, numberOfNals = gops.nalCount, data = new Uint8Array(nalsByteLength + 4 * numberOfNals), view = new DataView(data.buffer);
            for (h = 0; h < gops.length; h++) for (currentGop = gops[h], i = 0; i < currentGop.length; i++) for (currentFrame = currentGop[i], 
            j = 0; j < currentFrame.length; j++) currentNal = currentFrame[j], view.setUint32(dataOffset, currentNal.data.byteLength), 
            dataOffset += 4, data.set(currentNal.data, dataOffset), dataOffset += currentNal.data.byteLength;
            return data;
        },
        generateSampleTableForFrame: function(frame, baseDataOffset) {
            var sample, samples = [];
            return sample = sampleForFrame(frame, baseDataOffset || 0), samples.push(sample), 
            samples;
        },
        concatenateNalDataForFrame: function(frame) {
            var i, currentNal, dataOffset = 0, nalsByteLength = frame.byteLength, numberOfNals = frame.length, data = new Uint8Array(nalsByteLength + 4 * numberOfNals), view = new DataView(data.buffer);
            for (i = 0; i < frame.length; i++) currentNal = frame[i], view.setUint32(dataOffset, currentNal.data.byteLength), 
            dataOffset += 4, data.set(currentNal.data, dataOffset), dataOffset += currentNal.data.byteLength;
            return data;
        }
    };
}
