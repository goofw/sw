function(module, exports) {
    const getVideoBitrateScaleFactor = codec => "h265" === codec || "hevc" === codec || "vp9" === codec || "av1" === codec ? .6 : 1;
    module.exports = {
        video: (stream, inputVideoCodec, outputVideoCodec, maxBitRate) => {
            var bitrate = (stream => {
                if (!isNaN(stream.streamBitRate) && stream.streamBitRate) return stream.streamBitRate;
                let bps = 3145728;
                if (!isNaN(stream.bps) && stream.bps) bps = stream.bps; else if (stream.formatDuration && stream.numberOfBytes) {
                    const mathBps = Math.floor(8 * Number(stream.numberOfBytes) / Number(stream.formatDuration));
                    mathBps && !isNaN(mathBps) && (bps = mathBps);
                } else stream.formatBitRate && (bps = Math.floor(.8 * stream.formatBitRate));
                return Math.floor(bps || 0);
            })(stream);
            return bitrate && (bitrate = ((bitrate, inputVideoCodec, outputVideoCodec) => {
                const inputScaleFactor = getVideoBitrateScaleFactor(inputVideoCodec);
                let scaleFactor = getVideoBitrateScaleFactor(outputVideoCodec) / inputScaleFactor;
                return bitrate <= 5e5 ? scaleFactor = Math.max(scaleFactor, 4) : bitrate <= 1e6 ? scaleFactor = Math.max(scaleFactor, 3) : bitrate <= 2e6 ? scaleFactor = Math.max(scaleFactor, 2.5) : bitrate <= 3e6 && (scaleFactor = Math.max(scaleFactor, 2)), 
                scaleFactor * bitrate;
            })(bitrate, inputVideoCodec, outputVideoCodec), maxBitRate && (bitrate = Math.min(bitrate, maxBitRate))), 
            Math.min(bitrate || 0, 1073741823.5);
        },
        audio: (stream, audioCodec, audioChannels) => {
            let bitrate = (stream => {
                if (!isNaN(stream.streamBitRate) && stream.streamBitRate) return stream.streamBitRate;
                let bps = 0;
                if (!isNaN(stream.bps) && stream.bps) bps = stream.bps; else if (stream.formatDuration && stream.numberOfBytes) {
                    const mathBps = Math.floor(8 * Number(stream.numberOfBytes) / Number(stream.formatDuration));
                    mathBps && !isNaN(mathBps) && (bps = mathBps);
                }
                return Math.floor(bps || 0);
            })(stream);
            return "aac" !== audioCodec || bitrate || (bitrate = 64e3 * audioChannels), bitrate ? ((audioBitRate, audioCodec, audioChannels) => {
                if (audioBitRate && !audioCodec) return Math.min(384e3, audioBitRate);
                if (audioBitRate && audioCodec) {
                    if ("aac" === audioCodec || "mp3" === audioCodec || "opus" === audioCodec || "vorbis" === audioCodec || "ac3" === audioCodec || "eac3" === audioCodec) return (audioChannels || 0) >= 6 ? Math.min(64e4, audioBitRate) : Math.min(384e3, audioBitRate);
                    if ("flac" === audioCodec || "alac" === audioCodec) return (audioChannels || 0) >= 6 ? Math.min(3584e3, audioBitRate) : Math.min(1536e3, audioBitRate);
                }
                return 128e3;
            })(bitrate, audioCodec, audioChannels) : 0;
        }
    };
}
