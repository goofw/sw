function(module, exports, __webpack_require__) {
    var doClean, enginefs = __webpack_require__(155), walk = __webpack_require__(755), child = __webpack_require__(31), fs = __webpack_require__(2), path = __webpack_require__(4), once = __webpack_require__(34), os = __webpack_require__(21);
    function getDiskSpace(cachePath, cb) {
        if (cb = once(cb), process.env.TIZEN_ENV || process.env.WEBOS_ENV) cb(null); else if (process.platform.match(/^win/)) try {
            var cacheDrive = cachePath.split(":").shift().toUpperCase();
            child.exec("wmic logicaldisk where drivetype=3 get caption,size,freespace", (function(err, stdout, stderr) {
                var line = stdout.split(/\n|\r/).filter((function(x) {
                    return x;
                })).filter((function(x) {
                    return 0 == x.indexOf(cacheDrive);
                })).map((function(x) {
                    return x.split(/\t| /).filter((function(x) {
                        return x;
                    }));
                })).shift();
                if (!line) return cb(null);
                cb({
                    size: parseInt(line[2]),
                    free: parseInt(line[1])
                });
            }));
        } catch (e) {
            cb(null);
        } else if (process.env.TV_ENV || process.platform.match(/linux|android/)) {
            var unit_value = {
                K: Math.pow(2, 10),
                M: Math.pow(2, 20),
                G: Math.pow(2, 30),
                T: Math.pow(2, 40),
                P: Math.pow(2, 50),
                E: Math.pow(2, 60),
                Z: Math.pow(2, 70),
                Y: Math.pow(2, 80),
                R: Math.pow(2, 90),
                Q: Math.pow(2, 100)
            }, parseValue = function(value) {
                return parseFloat(value.replace(/([\d.]+)(\w?)/, (function(_, val, unit) {
                    return parseFloat(val, 10) * (unit_value[unit] || unit_value.K);
                })), 10);
            };
            try {
                child.exec(`df -k ${cachePath} 2>/dev/null || true`, (function(err, stdout) {
                    var [headers, stats] = stdout.split("\n").map((function(l) {
                        return l.split(/\s+/);
                    })), size_id = headers.findIndex((function(h) {
                        return "Size" === h || h.endsWith("-blocks");
                    })), avail_id = headers.findIndex((function(h) {
                        return [ "avail", "free" ].includes(h.slice(0, 5).toLowerCase());
                    }));
                    if (-1 === avail_id || -1 === size_id) return cb(null);
                    cb({
                        size: parseValue(stats[size_id]),
                        free: parseValue(stats[avail_id])
                    });
                }));
            } catch (e) {
                cb(null);
            }
        } else if (process.platform.match(/darwin/)) try {
            child.exec("df '" + cachePath + "'", (function(err, stdout, stderr) {
                var line = stdout.split(/\n|\r/).filter((function(x) {
                    return x;
                })).slice(1).map((function(x) {
                    return x.split(/\t| /).filter((function(x) {
                        return x;
                    }));
                })).shift();
                if (!line) return cb(null);
                cb({
                    size: 512 * parseInt(line[1]),
                    free: parseInt(512 * line[3])
                });
            }));
        } catch (e) {
            cb(null);
        } else setTimeout((function() {
            cb();
        }), 1500), cb(null);
    }
    function clearCache(cachePath, toSize, requiredSize, callback) {
        if (toSize == 1 / 0) return callback && callback({});
        var files = [], engines = enginefs.list(), walker = walk.walk(cachePath);
        walker.on("file", (function(root, file, next) {
            var ih = root.split(path.sep).pop();
            file.name && (files.push({
                mtime: file.mtime,
                atime: file.atime,
                size: file.size,
                path: path.join(root, file.name),
                omit: -1 != engines.indexOf(ih)
            }), next());
        })), walker.on("end", (function() {
            var cacheSize = (files = files.sort((function(b, a) {
                return a.atime.getTime() - b.atime.getTime();
            }))).map((function(x) {
                return x.size;
            })).reduce((function(a, b) {
                return a + b;
            }), 0);
            getDiskSpace(cachePath, (function(space) {
                space && (toSize = Math.min(toSize, cacheSize + space.free - requiredSize || toSize));
                var sizeSum = 0, deleted = 0;
                files.forEach((function(f) {
                    (sizeSum += f.size) > toSize && !f.omit && (deleted++, fs.unlink(f.path, (function(e) {
                        e && console.error(e);
                    })));
                })), console.log("Resizing cache size to " + Math.round(toSize / 1048576) + "MB from " + Math.round(cacheSize / 1048576) + "MB by deleting " + deleted + " files"), 
                callback && callback({
                    current: cacheSize,
                    to: toSize,
                    deleted: deleted
                });
            }));
        }));
    }
    function getCacheLocations(callback) {
        process.platform.match(/^win/) ? child.exec("wmic logicaldisk where drivetype=3 get caption", (function(err, stdout, stderr) {
            var prio = [ "E", "D" ];
            callback(null, stdout.split(/\n|\r| /).filter((function(x) {
                return x;
            })).slice(1).filter((function(drive) {
                return "Q" != drive[0];
            })).sort((function(a, b) {
                return (prio.indexOf(a[0]) > -1) - (prio.indexOf(b[0]) > -1);
            })).map((function(d) {
                return d[0] + ":\\";
            })));
        })) : (process.platform.match(/linux/), callback(null, []));
    }
    module.exports = {
        getDiskSpace: getDiskSpace,
        getCacheLocations: getCacheLocations,
        clearCache: clearCache,
        getOptions: function(cb) {
            getCacheLocations((function(err, locations) {
                if (err) return cb(err);
                var interfaces = os.networkInterfaces(), addresses = [].concat.apply([], Object.keys(interfaces).map((function(networkInterface) {
                    return interfaces[networkInterface].map((function(address) {
                        return {
                            address: address.address,
                            netmask: address.netmask,
                            cird: address.cird,
                            family: address.family,
                            internal: address.internal,
                            interface: networkInterface
                        };
                    }));
                }))).filter((function(address) {
                    return "IPv4" === address.family && !address.internal;
                })).map((function(record) {
                    return {
                        name: record.address,
                        val: record.address
                    };
                })), opts = [ {
                    id: "localAddonEnabled",
                    label: "ENABLE_LOCAL_FILES_ADDON",
                    type: "checkbox"
                }, {
                    id: "remoteHttps",
                    label: "ENABLE_REMOTE_HTTPS_CONN",
                    type: "select",
                    class: "https",
                    icon: !0,
                    selections: [ {
                        name: "Disabled",
                        val: ""
                    } ].concat(addresses)
                }, {
                    id: "cacheSize",
                    label: "CACHING",
                    type: "select",
                    class: "caching",
                    icon: !0,
                    selections: [ {
                        name: "no caching",
                        val: 0
                    }, {
                        name: "2GB",
                        val: 2147483648
                    }, {
                        name: "5GB",
                        val: 5368709120
                    }, {
                        name: "10GB",
                        val: 10737418240
                    }, {
                        name: "∞",
                        val: 1 / 0
                    } ]
                } ];
                locations.length && opts.push({
                    id: "cacheRoot",
                    label: "SETTINGS_CACHING_DRIVE",
                    type: "select",
                    class: "caching",
                    selections: locations.map((function(p) {
                        return {
                            val: p,
                            name: p.slice(0, 2)
                        };
                    }))
                }), cb(null, opts);
            }));
        },
        setOptionValues: function(vals, cb) {
            doClean && clearTimeout(doClean), vals.cacheSize, doClean = setTimeout((function() {
                doClean = null, clearCache(enginefs.getCachePath(""), vals.cacheSize, 0, cb);
            }), 1e4);
        }
    };
}
