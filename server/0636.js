function(module, exports) {
    module.exports = segmentMiddlewareArgs = {
        start: {
            any: [ "-i", "pipe:0", "-map_metadata", -1 ]
        },
        video: {
            transmuxing: [ "-c:v", "copy" ],
            notTransmuxing: [ "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "veryfast", "-tune", "zerolatency" ],
            getFilter: function(instance) {
                var video_stream = instance.streams.find((function(stream) {
                    return "video" == stream.codec_type;
                }));
                if (video_stream) {
                    if ("h264" === video_stream.codec_name) return [ "-vbsf", "h264_mp4toannexb" ];
                    if ("hevc" === video_stream.codec_name) return [ "-vbsf", "hevc_mp4toannexb" ];
                }
                return [];
            }
        },
        audio: {
            transmuxing: [ "-c:a", "copy", "-strict", "experimental", "-ac", "2" ],
            notTransmuxing: [ "-c:a", "aac", "-strict", "experimental", "-ac", "2" ]
        },
        end: {
            any: [ "-copyts", "-mpegts_copyts", "1", "-f", "mpegts", "-threads", "0", "pipe:1" ],
            fmp4: [ "-f", "mp4", "-movflags", "frag_keyframe+dash", "-threads", "0", "pipe:1" ]
        }
    };
}
