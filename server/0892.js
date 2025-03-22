function(module, exports, __webpack_require__) {
    var child = __webpack_require__(31), fs = __webpack_require__(2), stremioCast = __webpack_require__(893), enginefs = __webpack_require__(155), http = __webpack_require__(11), os = __webpack_require__(21), path = __webpack_require__(4);
    module.exports = function(devices) {
        var players = {
            vlc: {
                title: "VLC",
                args: [ "--no-video-title-show" ],
                subArg: "--sub-file=",
                timeArg: "--start-time=",
                playArg: "",
                darwin: {
                    path: [ "/Applications/VLC.app/Contents/MacOS/VLC" ]
                },
                linux: {
                    path: [ "/usr/bin/vlc", "/usr/local/bin/vlc" ]
                },
                win32: {
                    path: [ '"C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe"', '"C:\\Program Files\\VideoLAN\\VLC\\vlc.exe"' ]
                }
            },
            mplayerx: {
                title: "MPlayerX",
                args: [ "" ],
                subArg: "-SubFileNameRule ",
                timeArg: "-SeekStepTimeU ",
                playArg: "-url ",
                darwin: {
                    path: [ "/Applications/MPlayerX.app/Contents/MacOS/MPlayerX" ]
                },
                linux: {
                    path: []
                },
                win32: {
                    path: []
                }
            },
            mplayer: {
                title: "MPlayer",
                args: [ "" ],
                subArg: "-sub ",
                timeArg: "-ss ",
                playArg: "",
                darwin: {
                    path: [ "/usr/local/bin/mplayer", "/opt/local/bin/mplayer", "/sw/bin/mplayer" ]
                },
                linux: {
                    path: [ "/usr/bin/mplayer" ]
                },
                win32: {
                    path: []
                }
            },
            mpv: {
                title: "MPV",
                args: [ "--no-terminal" ],
                subArg: "--sub-file=",
                timeArg: "--start=",
                playArg: "",
                darwin: {
                    path: [ "/usr/local/bin/mpv", "/opt/local/bin/mpv", "/sw/bin/mpv" ]
                },
                linux: {
                    path: [ "/usr/bin/mpv" ]
                },
                win32: {
                    path: []
                }
            },
            bomi: {
                title: "Bomi",
                args: [],
                subArg: "--set-subtitle ",
                timeArg: "",
                playArg: "",
                darwin: {
                    path: []
                },
                linux: {
                    path: [ "/usr/bin/bomi" ]
                },
                win32: {
                    path: []
                }
            },
            mpcBe: {
                title: "MPC-BE",
                args: [ "" ],
                subArg: "/sub ",
                timeArg: "start ",
                playArg: "",
                darwin: {
                    path: []
                },
                linux: {
                    path: []
                },
                win32: {
                    path: [ '"C:\\Program Files (x86)\\MPC-BE x64\\mpc-be4.exe"', '"C:\\Program Files\\MPC-BE x64\\mpc-be64.exe"' ]
                }
            }
        };
        devices.groups.external = [], Object.keys(players).forEach((function(el) {
            var player = players[el];
            player[process.platform] && player[process.platform].path.forEach((function(p) {
                fs.existsSync(p.replace(/"/gi, "")) && devices.groups.external.push((function(player, platform) {
                    var playerObj = players[player], platformObj = playerObj[platform];
                    return {
                        name: playerObj.title,
                        type: "external",
                        id: player,
                        onlyHtml5Formats: playerObj.onlyHtml5Formats,
                        play: function(src) {
                            var torrentUrl = src.match(/\/(?<ih>[0-9a-f]{40})\/(?<id>[0-9]+)$/);
                            if (torrentUrl) {
                                var fileIdx = torrentUrl.groups.id, filename = enginefs.getFilename(torrentUrl.groups.ih, fileIdx);
                                filename && (src = src.replace(new RegExp(fileIdx + "$"), encodeURIComponent(filename)));
                            }
                            var self = this;
                            setTimeout((function() {
                                var port = enginefs.baseUrl.match(".*?:([0-9]+)")[1], host = enginefs.baseUrl.match("^http://(.*):[0-9]+$")[1], subsPath = self.subtitlesSrc, time = self.time, subsFile = "", playExternal = function() {
                                    var playerPaths = platformObj.path.filter((function(path) {
                                        return fs.existsSync(path.replace(/"/gi, ""));
                                    }));
                                    if (playerPaths.length > 0) {
                                        var wrappedSrc = '"' + src + '"', subsCmd = subsFile && players[player].subArg && players[player].subArg.length > 0 ? players[player].subArg + subsFile : "", argsCmd = players[player].args && players[player].args.length > 0 ? players[player].args.join(" ") : "", timeCmd = players[player].timeArg && players[player].timeArg.length > 0 ? players[player].timeArg + parseInt(time / 1e3) : "", playCmd = players[player].playArg && players[player].playArg.length > 0 ? players[player].playArg + wrappedSrc : wrappedSrc, fullCmd = playerPaths[0] + " " + timeCmd + " " + argsCmd + " " + subsCmd + " " + playCmd;
                                        child.exec(fullCmd, (function(error) {
                                            console.error("Failed executing external player command:", error);
                                        })).on("exit", (function() {
                                            if (subsFile) try {
                                                fs.unlinkSync(subsFile);
                                            } catch (e) {
                                                console.error("Cannot remove the subtitles file:", e);
                                            }
                                        }));
                                    }
                                };
                                subsPath ? (subsFile = path.join(os.tmpdir(), "stremio-" + player + "-subtitles.srt"), 
                                http.request({
                                    host: host,
                                    path: "/subtitles.srt?from=" + encodeURIComponent(subsPath),
                                    port: port
                                }, (function(response) {
                                    var data = "";
                                    response.on("data", (function(d) {
                                        data += d.toString();
                                    })), response.on("end", (function() {
                                        try {
                                            fs.writeFileSync(subsFile, data.toString());
                                        } catch (e) {
                                            console.error("Cannot get the subtitles:", e), subsFile = "";
                                        }
                                        playExternal();
                                    }));
                                })).end()) : playExternal();
                            }), 1500);
                        }
                    };
                })(el, process.platform));
            }));
        })), devices.groups.external.forEach((function(dev) {
            dev.usePlayerUI = !0, dev.stop = function() {}, dev.middleware = new stremioCast.Server(dev);
        })), devices.update();
    };
}
