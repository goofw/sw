function(module, exports, __webpack_require__) {
    "use strict";
    var box, dinf, esds, ftyp, mdat, mfhd, minf, moof, moov, mvex, mvhd, trak, tkhd, mdia, mdhd, hdlr, sdtp, stbl, stsd, traf, trex, trun, types, MAJOR_BRAND, MINOR_VERSION, AVC1_BRAND, VIDEO_HDLR, AUDIO_HDLR, HDLR_TYPES, VMHD, SMHD, DREF, STCO, STSC, STSZ, STTS, videoSample, audioSample, audioTrun, videoTrun, trunHeader, UINT32_MAX = Math.pow(2, 32) - 1;
    !(function() {
        var i;
        if (types = {
            avc1: [],
            avcC: [],
            btrt: [],
            dinf: [],
            dref: [],
            esds: [],
            ftyp: [],
            hdlr: [],
            mdat: [],
            mdhd: [],
            mdia: [],
            mfhd: [],
            minf: [],
            moof: [],
            moov: [],
            mp4a: [],
            mvex: [],
            mvhd: [],
            pasp: [],
            sdtp: [],
            smhd: [],
            stbl: [],
            stco: [],
            stsc: [],
            stsd: [],
            stsz: [],
            stts: [],
            styp: [],
            tfdt: [],
            tfhd: [],
            traf: [],
            trak: [],
            trun: [],
            trex: [],
            tkhd: [],
            vmhd: []
        }, "undefined" != typeof Uint8Array) {
            for (i in types) types.hasOwnProperty(i) && (types[i] = [ i.charCodeAt(0), i.charCodeAt(1), i.charCodeAt(2), i.charCodeAt(3) ]);
            MAJOR_BRAND = new Uint8Array([ "i".charCodeAt(0), "s".charCodeAt(0), "o".charCodeAt(0), "m".charCodeAt(0) ]), 
            AVC1_BRAND = new Uint8Array([ "a".charCodeAt(0), "v".charCodeAt(0), "c".charCodeAt(0), "1".charCodeAt(0) ]), 
            MINOR_VERSION = new Uint8Array([ 0, 0, 0, 1 ]), VIDEO_HDLR = new Uint8Array([ 0, 0, 0, 0, 0, 0, 0, 0, 118, 105, 100, 101, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 86, 105, 100, 101, 111, 72, 97, 110, 100, 108, 101, 114, 0 ]), 
            AUDIO_HDLR = new Uint8Array([ 0, 0, 0, 0, 0, 0, 0, 0, 115, 111, 117, 110, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 83, 111, 117, 110, 100, 72, 97, 110, 100, 108, 101, 114, 0 ]), 
            HDLR_TYPES = {
                video: VIDEO_HDLR,
                audio: AUDIO_HDLR
            }, DREF = new Uint8Array([ 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 12, 117, 114, 108, 32, 0, 0, 0, 1 ]), 
            SMHD = new Uint8Array([ 0, 0, 0, 0, 0, 0, 0, 0 ]), STCO = new Uint8Array([ 0, 0, 0, 0, 0, 0, 0, 0 ]), 
            STSC = STCO, STSZ = new Uint8Array([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]), STTS = STCO, 
            VMHD = new Uint8Array([ 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0 ]);
        }
    })(), box = function(type) {
        var i, result, payload = [], size = 0;
        for (i = 1; i < arguments.length; i++) payload.push(arguments[i]);
        for (i = payload.length; i--; ) size += payload[i].byteLength;
        for (result = new Uint8Array(size + 8), new DataView(result.buffer, result.byteOffset, result.byteLength).setUint32(0, result.byteLength), 
        result.set(type, 4), i = 0, size = 8; i < payload.length; i++) result.set(payload[i], size), 
        size += payload[i].byteLength;
        return result;
    }, dinf = function() {
        return box(types.dinf, box(types.dref, DREF));
    }, esds = function(track) {
        return box(types.esds, new Uint8Array([ 0, 0, 0, 0, 3, 25, 0, 0, 0, 4, 17, 64, 21, 0, 6, 0, 0, 0, 218, 192, 0, 0, 218, 192, 5, 2, track.audioobjecttype << 3 | track.samplingfrequencyindex >>> 1, track.samplingfrequencyindex << 7 | track.channelcount << 3, 6, 1, 2 ]));
    }, ftyp = function() {
        return box(types.ftyp, MAJOR_BRAND, MINOR_VERSION, MAJOR_BRAND, AVC1_BRAND);
    }, hdlr = function(type) {
        return box(types.hdlr, HDLR_TYPES[type]);
    }, mdat = function(data) {
        return box(types.mdat, data);
    }, mdhd = function(track) {
        var result = new Uint8Array([ 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 3, 0, 1, 95, 144, track.duration >>> 24 & 255, track.duration >>> 16 & 255, track.duration >>> 8 & 255, 255 & track.duration, 85, 196, 0, 0 ]);
        return track.samplerate && (result[12] = track.samplerate >>> 24 & 255, result[13] = track.samplerate >>> 16 & 255, 
        result[14] = track.samplerate >>> 8 & 255, result[15] = 255 & track.samplerate), 
        box(types.mdhd, result);
    }, mdia = function(track) {
        return box(types.mdia, mdhd(track), hdlr(track.type), minf(track));
    }, mfhd = function(sequenceNumber) {
        return box(types.mfhd, new Uint8Array([ 0, 0, 0, 0, (4278190080 & sequenceNumber) >> 24, (16711680 & sequenceNumber) >> 16, (65280 & sequenceNumber) >> 8, 255 & sequenceNumber ]));
    }, minf = function(track) {
        return box(types.minf, "video" === track.type ? box(types.vmhd, VMHD) : box(types.smhd, SMHD), dinf(), stbl(track));
    }, moof = function(sequenceNumber, tracks) {
        for (var trackFragments = [], i = tracks.length; i--; ) trackFragments[i] = traf(tracks[i]);
        return box.apply(null, [ types.moof, mfhd(sequenceNumber) ].concat(trackFragments));
    }, moov = function(tracks) {
        for (var i = tracks.length, boxes = []; i--; ) boxes[i] = trak(tracks[i]);
        return box.apply(null, [ types.moov, mvhd(4294967295) ].concat(boxes).concat(mvex(tracks)));
    }, mvex = function(tracks) {
        for (var i = tracks.length, boxes = []; i--; ) boxes[i] = trex(tracks[i]);
        return box.apply(null, [ types.mvex ].concat(boxes));
    }, mvhd = function(duration) {
        var bytes = new Uint8Array([ 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 1, 95, 144, (4278190080 & duration) >> 24, (16711680 & duration) >> 16, (65280 & duration) >> 8, 255 & duration, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255 ]);
        return box(types.mvhd, bytes);
    }, sdtp = function(track) {
        var flags, i, samples = track.samples || [], bytes = new Uint8Array(4 + samples.length);
        for (i = 0; i < samples.length; i++) flags = samples[i].flags, bytes[i + 4] = flags.dependsOn << 4 | flags.isDependedOn << 2 | flags.hasRedundancy;
        return box(types.sdtp, bytes);
    }, stbl = function(track) {
        return box(types.stbl, stsd(track), box(types.stts, STTS), box(types.stsc, STSC), box(types.stsz, STSZ), box(types.stco, STCO));
    }, stsd = function(track) {
        return box(types.stsd, new Uint8Array([ 0, 0, 0, 0, 0, 0, 0, 1 ]), "video" === track.type ? videoSample(track) : audioSample(track));
    }, videoSample = function(track) {
        var i, avc1Box, sps = track.sps || [], pps = track.pps || [], sequenceParameterSets = [], pictureParameterSets = [];
        for (i = 0; i < sps.length; i++) sequenceParameterSets.push((65280 & sps[i].byteLength) >>> 8), 
        sequenceParameterSets.push(255 & sps[i].byteLength), sequenceParameterSets = sequenceParameterSets.concat(Array.prototype.slice.call(sps[i]));
        for (i = 0; i < pps.length; i++) pictureParameterSets.push((65280 & pps[i].byteLength) >>> 8), 
        pictureParameterSets.push(255 & pps[i].byteLength), pictureParameterSets = pictureParameterSets.concat(Array.prototype.slice.call(pps[i]));
        if (avc1Box = [ types.avc1, new Uint8Array([ 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, (65280 & track.width) >> 8, 255 & track.width, (65280 & track.height) >> 8, 255 & track.height, 0, 72, 0, 0, 0, 72, 0, 0, 0, 0, 0, 0, 0, 1, 19, 118, 105, 100, 101, 111, 106, 115, 45, 99, 111, 110, 116, 114, 105, 98, 45, 104, 108, 115, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 17, 17 ]), box(types.avcC, new Uint8Array([ 1, track.profileIdc, track.profileCompatibility, track.levelIdc, 255 ].concat([ sps.length ], sequenceParameterSets, [ pps.length ], pictureParameterSets))), box(types.btrt, new Uint8Array([ 0, 28, 156, 128, 0, 45, 198, 192, 0, 45, 198, 192 ])) ], 
        track.sarRatio) {
            var hSpacing = track.sarRatio[0], vSpacing = track.sarRatio[1];
            avc1Box.push(box(types.pasp, new Uint8Array([ (4278190080 & hSpacing) >> 24, (16711680 & hSpacing) >> 16, (65280 & hSpacing) >> 8, 255 & hSpacing, (4278190080 & vSpacing) >> 24, (16711680 & vSpacing) >> 16, (65280 & vSpacing) >> 8, 255 & vSpacing ])));
        }
        return box.apply(null, avc1Box);
    }, audioSample = function(track) {
        return box(types.mp4a, new Uint8Array([ 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, (65280 & track.channelcount) >> 8, 255 & track.channelcount, (65280 & track.samplesize) >> 8, 255 & track.samplesize, 0, 0, 0, 0, (65280 & track.samplerate) >> 8, 255 & track.samplerate, 0, 0 ]), esds(track));
    }, tkhd = function(track) {
        var result = new Uint8Array([ 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, (4278190080 & track.id) >> 24, (16711680 & track.id) >> 16, (65280 & track.id) >> 8, 255 & track.id, 0, 0, 0, 0, (4278190080 & track.duration) >> 24, (16711680 & track.duration) >> 16, (65280 & track.duration) >> 8, 255 & track.duration, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, (65280 & track.width) >> 8, 255 & track.width, 0, 0, (65280 & track.height) >> 8, 255 & track.height, 0, 0 ]);
        return box(types.tkhd, result);
    }, traf = function(track) {
        var trackFragmentHeader, trackFragmentDecodeTime, trackFragmentRun, sampleDependencyTable, upperWordBaseMediaDecodeTime, lowerWordBaseMediaDecodeTime;
        return trackFragmentHeader = box(types.tfhd, new Uint8Array([ 0, 0, 0, 58, (4278190080 & track.id) >> 24, (16711680 & track.id) >> 16, (65280 & track.id) >> 8, 255 & track.id, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ])), 
        upperWordBaseMediaDecodeTime = Math.floor(track.baseMediaDecodeTime / (UINT32_MAX + 1)), 
        lowerWordBaseMediaDecodeTime = Math.floor(track.baseMediaDecodeTime % (UINT32_MAX + 1)), 
        trackFragmentDecodeTime = box(types.tfdt, new Uint8Array([ 1, 0, 0, 0, upperWordBaseMediaDecodeTime >>> 24 & 255, upperWordBaseMediaDecodeTime >>> 16 & 255, upperWordBaseMediaDecodeTime >>> 8 & 255, 255 & upperWordBaseMediaDecodeTime, lowerWordBaseMediaDecodeTime >>> 24 & 255, lowerWordBaseMediaDecodeTime >>> 16 & 255, lowerWordBaseMediaDecodeTime >>> 8 & 255, 255 & lowerWordBaseMediaDecodeTime ])), 
        "audio" === track.type ? (trackFragmentRun = trun(track, 92), box(types.traf, trackFragmentHeader, trackFragmentDecodeTime, trackFragmentRun)) : (sampleDependencyTable = sdtp(track), 
        trackFragmentRun = trun(track, sampleDependencyTable.length + 92), box(types.traf, trackFragmentHeader, trackFragmentDecodeTime, trackFragmentRun, sampleDependencyTable));
    }, trak = function(track) {
        return track.duration = track.duration || 4294967295, box(types.trak, tkhd(track), mdia(track));
    }, trex = function(track) {
        var result = new Uint8Array([ 0, 0, 0, 0, (4278190080 & track.id) >> 24, (16711680 & track.id) >> 16, (65280 & track.id) >> 8, 255 & track.id, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1 ]);
        return "video" !== track.type && (result[result.length - 1] = 0), box(types.trex, result);
    }, trunHeader = function(samples, offset) {
        var durationPresent = 0, sizePresent = 0, flagsPresent = 0, compositionTimeOffset = 0;
        return samples.length && (void 0 !== samples[0].duration && (durationPresent = 1), 
        void 0 !== samples[0].size && (sizePresent = 2), void 0 !== samples[0].flags && (flagsPresent = 4), 
        void 0 !== samples[0].compositionTimeOffset && (compositionTimeOffset = 8)), [ 0, 0, durationPresent | sizePresent | flagsPresent | compositionTimeOffset, 1, (4278190080 & samples.length) >>> 24, (16711680 & samples.length) >>> 16, (65280 & samples.length) >>> 8, 255 & samples.length, (4278190080 & offset) >>> 24, (16711680 & offset) >>> 16, (65280 & offset) >>> 8, 255 & offset ];
    }, videoTrun = function(track, offset) {
        var bytesOffest, bytes, header, samples, sample, i;
        for (offset += 20 + 16 * (samples = track.samples || []).length, header = trunHeader(samples, offset), 
        (bytes = new Uint8Array(header.length + 16 * samples.length)).set(header), bytesOffest = header.length, 
        i = 0; i < samples.length; i++) sample = samples[i], bytes[bytesOffest++] = (4278190080 & sample.duration) >>> 24, 
        bytes[bytesOffest++] = (16711680 & sample.duration) >>> 16, bytes[bytesOffest++] = (65280 & sample.duration) >>> 8, 
        bytes[bytesOffest++] = 255 & sample.duration, bytes[bytesOffest++] = (4278190080 & sample.size) >>> 24, 
        bytes[bytesOffest++] = (16711680 & sample.size) >>> 16, bytes[bytesOffest++] = (65280 & sample.size) >>> 8, 
        bytes[bytesOffest++] = 255 & sample.size, bytes[bytesOffest++] = sample.flags.isLeading << 2 | sample.flags.dependsOn, 
        bytes[bytesOffest++] = sample.flags.isDependedOn << 6 | sample.flags.hasRedundancy << 4 | sample.flags.paddingValue << 1 | sample.flags.isNonSyncSample, 
        bytes[bytesOffest++] = 61440 & sample.flags.degradationPriority, bytes[bytesOffest++] = 15 & sample.flags.degradationPriority, 
        bytes[bytesOffest++] = (4278190080 & sample.compositionTimeOffset) >>> 24, bytes[bytesOffest++] = (16711680 & sample.compositionTimeOffset) >>> 16, 
        bytes[bytesOffest++] = (65280 & sample.compositionTimeOffset) >>> 8, bytes[bytesOffest++] = 255 & sample.compositionTimeOffset;
        return box(types.trun, bytes);
    }, audioTrun = function(track, offset) {
        var bytes, bytesOffest, header, samples, sample, i;
        for (offset += 20 + 8 * (samples = track.samples || []).length, header = trunHeader(samples, offset), 
        (bytes = new Uint8Array(header.length + 8 * samples.length)).set(header), bytesOffest = header.length, 
        i = 0; i < samples.length; i++) sample = samples[i], bytes[bytesOffest++] = (4278190080 & sample.duration) >>> 24, 
        bytes[bytesOffest++] = (16711680 & sample.duration) >>> 16, bytes[bytesOffest++] = (65280 & sample.duration) >>> 8, 
        bytes[bytesOffest++] = 255 & sample.duration, bytes[bytesOffest++] = (4278190080 & sample.size) >>> 24, 
        bytes[bytesOffest++] = (16711680 & sample.size) >>> 16, bytes[bytesOffest++] = (65280 & sample.size) >>> 8, 
        bytes[bytesOffest++] = 255 & sample.size;
        return box(types.trun, bytes);
    }, trun = function(track, offset) {
        return "audio" === track.type ? audioTrun(track, offset) : videoTrun(track, offset);
    }, module.exports = {
        ftyp: ftyp,
        mdat: mdat,
        moof: moof,
        moov: moov,
        initSegment: function(tracks) {
            var result, fileType = ftyp(), movie = moov(tracks);
            return (result = new Uint8Array(fileType.byteLength + movie.byteLength)).set(fileType), 
            result.set(movie, fileType.byteLength), result;
        }
    };
}
