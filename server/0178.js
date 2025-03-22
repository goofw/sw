function(module, exports) {
    module.exports = {
        mediacodec: {
            audio: {
                decoders: {},
                encoders: {}
            },
            video: {
                inputArgs: [],
                decoders: {
                    libx264: "h264_mediacodec",
                    hevc: "hevc_mediacodec",
                    mpeg2: "mpeg2_mediacodec",
                    mpeg4: "mpeg4_mediacodec",
                    vp8: "vp8_mediacodec",
                    vp9: "vp9_mediacodec"
                },
                encoders: {}
            }
        },
        videotoolbox: {
            audio: {
                decoders: {},
                encoders: {
                    aac: "aac_at"
                }
            },
            video: {
                inputArgs: [ "-init_hw_device", "videotoolbox=vt", "-hwaccel", "videotoolbox" ],
                decoders: {},
                encoders: {
                    libx264: "h264_videotoolbox",
                    hevc: "hevc_videotoolbox"
                },
                pixelFormat: "nv12",
                extraOutputArgs: [ "-b:v", "{bitrate}", "-maxrate", "{bitrate}", "-bufsize", "{bufsize}" ]
            }
        },
        "qsv-win": {
            audio: {
                decoders: {},
                encoders: {}
            },
            video: {
                inputArgs: [ "-init_hw_device", "d3d11va=dx11:,vendor=0x8086", "-init_hw_device", "qsv=qs@dx11", "-filter_hw_device", "qs", "-hwaccel", "d3d11va", "-hwaccel_output_format", "d3d11", "-threads", "3" ],
                decoders: {},
                encoders: {
                    libx264: "h264_qsv",
                    hevc: "hevc_qsv",
                    vp9: "vp9_qsv",
                    mpeg2video: "mpeg2_qsv"
                },
                preset: "veryfast",
                pixelFormat: "nv12",
                scalePrefix: "hwmap=derive_device=qsv,",
                scale: "scale_qsv",
                resizeHeightAuto: "-1",
                scaleExtra: "",
                wrapSwFilters: [ "hwdownload", "hwupload" ],
                hwFilters: [ "hwmap=derive_device=qsv", "format=qsv" ],
                extraOutputArgs: [ "-look_ahead", "0", "-b:v", "{bitrate}", "-maxrate", "{bitrate}", "-bufsize", "{bufsize}" ]
            }
        },
        "qsv-linux": {
            audio: {
                decoders: {},
                encoders: {}
            },
            video: {
                inputArgs: [ "-init_hw_device", "vaapi=va:,driver=iHD,kernel_driver=i915", "-init_hw_device", "qsv=qs@va", "-filter_hw_device", "qs", "-hwaccel", "vaapi", "-hwaccel_output_format", "vaapi" ],
                decoders: {},
                encoders: {
                    libx264: "h264_qsv",
                    hevc: "hevc_qsv",
                    vp9: "vp9_qsv",
                    mpeg2video: "mpeg2_qsv"
                },
                preset: "veryfast",
                pixelFormat: "nv12",
                scale: "scale_vaapi",
                scaleExtra: ":mode=fast",
                wrapSwFilters: [ "hwdownload", "hwupload_vaapi" ],
                hwFilters: [ "hwmap=derive_device=qsv", "format=qsv" ],
                extraOutputArgs: [ "-look_ahead", "0", "-b:v", "{bitrate}", "-maxrate", "{bitrate}", "-bufsize", "{bufsize}" ]
            }
        },
        amf: {
            audio: {
                decoders: {},
                encoders: {}
            },
            video: {
                inputArgs: [ "-init_hw_device", "d3d11va=dx11:,vendor=0x1002", "-init_hw_device", "opencl=ocl@dx11", "-filter_hw_device", "ocl", "-hwaccel", "d3d11va", "-hwaccel_output_format", "d3d11" ],
                decoders: {},
                encoders: {
                    libx264: "h264_amf",
                    hevc: "hevc_amf"
                },
                scalePrefix: "hwmap=derive_device=opencl,",
                scale: "scale_opencl",
                scaleExtra: "",
                pixelFormat: "nv12",
                wrapSwFilters: [ "hwdownload", "hwupload_vaapi" ],
                hwFilters: [ "hwmap=derive_device=d3d11va:reverse=1", "format=d3d11" ],
                extraOutputArgs: [ "-quality", "speed", "-rc", "cbr", "-qmin", "0", "-qmax", "32", "-b:v", "{bitrate}", "-maxrate", "{bitrate}", "-bufsize", "{bufsize}" ]
            }
        },
        "nvenc-win": {
            audio: {
                decoders: {},
                encoders: {}
            },
            video: {
                inputArgs: [ "-init_hw_device", "cuda=cu:0", "-filter_hw_device", "cu", "-hwaccel", "cuda", "-hwaccel_output_format", "cuda", "-threads", "1" ],
                decoders: {},
                encoders: {
                    libx264: "h264_nvenc",
                    hevc: "hevc_nvenc"
                },
                preset: "p1",
                tune: "ull",
                scale: "scale_cuda",
                scaleExtra: "",
                pixelFormat: "yuv420p",
                wrapSwFilters: [ "hwdownload", "hwupload_cuda" ],
                extraOutputArgs: [ "-b:v", "{bitrate}", "-maxrate", "{bitrate}", "-bufsize", "{bufsize}" ],
                noH264Level: !0
            }
        },
        "nvenc-linux": {
            audio: {
                decoders: {},
                encoders: {}
            },
            video: {
                inputArgs: [ "-init_hw_device", "cuda=cu:0", "-filter_hw_device", "cu", "-hwaccel", "cuda", "-hwaccel_output_format", "cuda" ],
                decoders: {
                    hevc: "hevc_cuvid",
                    libx264: "h264_cuvid",
                    av1: "av1_cuvid",
                    mpeg1: "mpeg1_cuvid",
                    mpeg2: "mpeg2_cuvid",
                    mpeg4: "mpeg4_cuvid",
                    vc1: "vc1_cuvid",
                    vp8: "vp8_cuvid",
                    vp9: "vp9_cuvid"
                },
                encoders: {
                    libx264: "h264_nvenc",
                    hevc: "hevc_nvenc"
                },
                preset: "p1",
                tune: "ull",
                scale: "scale_cuda",
                scaleExtra: "",
                pixelFormat: "yuv420p",
                wrapSwFilters: [ "hwdownload", "hwupload_cuda" ],
                extraOutputArgs: [ "-b:v", "{bitrate}", "-maxrate", "{bitrate}", "-bufsize", "{bufsize}" ]
            }
        },
        "vaapi-renderD128": {
            audio: {
                decoders: {},
                encoders: {}
            },
            video: {
                inputArgs: [ "-init_hw_device", "vaapi=va:/dev/dri/renderD128", "-filter_hw_device", "va", "-hwaccel", "vaapi", "-hwaccel_output_format", "vaapi" ],
                decoders: {},
                encoders: {
                    libx264: "h264_vaapi",
                    hevc: "hevc_vaapi",
                    mpeg2: "mpeg2_vaapi",
                    vp8: "vp8_vaapi",
                    vp9: "vp9_vaapi"
                },
                pixelFormat: "nv12",
                scale: "scale_vaapi",
                scaleExtra: ":mode=fast",
                wrapSwFilters: [ "hwdownload", "hwupload_vaapi" ],
                extraOutputArgs: [ "-rc_mode", "VBR", "-b:v", "{bitrate}", "-maxrate", "{bitrate}", "-bufsize", "{bufsize}" ],
                noH264Level: !0
            }
        },
        v4l2m2m: {
            audio: {
                decoders: {},
                encoders: {}
            },
            video: {
                inputArgs: [ "-hwaccel", "drm" ],
                decoders: {
                    hevc: "hevc"
                },
                encoders: {
                    libx264: "h264_v4l2m2m",
                    hevc: "hevc_v4l2m2m",
                    mpeg2: "mpeg2_v4l2m2m",
                    mpeg4: "mpeg4_v4l2m2m",
                    vp8: "vp8_v4l2m2m",
                    vp9: "vp9_v4l2m2m"
                },
                scale: "scale_v4l2m2m",
                scaleExtra: "",
                pixelFormat: "nv12",
                wrapSwFilters: [ "hwdownload", "hwupload" ],
                extraOutputArgs: [ "-b:v", "{bitrate}", "-maxrate", "{bitrate}", "-bufsize", "{bufsize}" ]
            }
        }
    };
}
