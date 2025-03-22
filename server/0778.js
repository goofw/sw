function(module, exports, __webpack_require__) {
    var pathModule = __webpack_require__(4), isWindows = "win32" === process.platform, fs = __webpack_require__(2), DEBUG = process.env.NODE_DEBUG && /fs/.test(process.env.NODE_DEBUG);
    if (pathModule.normalize, isWindows) var nextPartRe = /(.*?)(?:[\/\\]+|$)/g; else nextPartRe = /(.*?)(?:[\/]+|$)/g;
    if (isWindows) var splitRootRe = /^(?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?[\\\/]*/; else splitRootRe = /^[\/]*/;
    exports.realpathSync = function(p, cache) {
        if (p = pathModule.resolve(p), cache && Object.prototype.hasOwnProperty.call(cache, p)) return cache[p];
        var pos, current, base, previous, original = p, seenLinks = {}, knownHard = {};
        function start() {
            var m = splitRootRe.exec(p);
            pos = m[0].length, current = m[0], base = m[0], previous = "", isWindows && !knownHard[base] && (fs.lstatSync(base), 
            knownHard[base] = !0);
        }
        for (start(); pos < p.length; ) {
            nextPartRe.lastIndex = pos;
            var result = nextPartRe.exec(p);
            if (previous = current, current += result[0], base = previous + result[1], pos = nextPartRe.lastIndex, 
            !(knownHard[base] || cache && cache[base] === base)) {
                var resolvedLink;
                if (cache && Object.prototype.hasOwnProperty.call(cache, base)) resolvedLink = cache[base]; else {
                    var stat = fs.lstatSync(base);
                    if (!stat.isSymbolicLink()) {
                        knownHard[base] = !0, cache && (cache[base] = base);
                        continue;
                    }
                    var linkTarget = null;
                    if (!isWindows) {
                        var id = stat.dev.toString(32) + ":" + stat.ino.toString(32);
                        seenLinks.hasOwnProperty(id) && (linkTarget = seenLinks[id]);
                    }
                    null === linkTarget && (fs.statSync(base), linkTarget = fs.readlinkSync(base)), 
                    resolvedLink = pathModule.resolve(previous, linkTarget), cache && (cache[base] = resolvedLink), 
                    isWindows || (seenLinks[id] = linkTarget);
                }
                p = pathModule.resolve(resolvedLink, p.slice(pos)), start();
            }
        }
        return cache && (cache[original] = p), p;
    }, exports.realpath = function(p, cache, cb) {
        if ("function" != typeof cb && (cb = (function(cb) {
            return "function" == typeof cb ? cb : (function() {
                var callback;
                if (DEBUG) {
                    var backtrace = new Error;
                    callback = function(err) {
                        err && (backtrace.message = err.message, missingCallback(err = backtrace));
                    };
                } else callback = missingCallback;
                return callback;
                function missingCallback(err) {
                    if (err) {
                        if (process.throwDeprecation) throw err;
                        if (!process.noDeprecation) {
                            var msg = "fs: missing callback " + (err.stack || err.message);
                            process.traceDeprecation ? console.trace(msg) : console.error(msg);
                        }
                    }
                }
            })();
        })(cache), cache = null), p = pathModule.resolve(p), cache && Object.prototype.hasOwnProperty.call(cache, p)) return process.nextTick(cb.bind(null, null, cache[p]));
        var pos, current, base, previous, original = p, seenLinks = {}, knownHard = {};
        function start() {
            var m = splitRootRe.exec(p);
            pos = m[0].length, current = m[0], base = m[0], previous = "", isWindows && !knownHard[base] ? fs.lstat(base, (function(err) {
                if (err) return cb(err);
                knownHard[base] = !0, LOOP();
            })) : process.nextTick(LOOP);
        }
        function LOOP() {
            if (pos >= p.length) return cache && (cache[original] = p), cb(null, p);
            nextPartRe.lastIndex = pos;
            var result = nextPartRe.exec(p);
            return previous = current, current += result[0], base = previous + result[1], pos = nextPartRe.lastIndex, 
            knownHard[base] || cache && cache[base] === base ? process.nextTick(LOOP) : cache && Object.prototype.hasOwnProperty.call(cache, base) ? gotResolvedLink(cache[base]) : fs.lstat(base, gotStat);
        }
        function gotStat(err, stat) {
            if (err) return cb(err);
            if (!stat.isSymbolicLink()) return knownHard[base] = !0, cache && (cache[base] = base), 
            process.nextTick(LOOP);
            if (!isWindows) {
                var id = stat.dev.toString(32) + ":" + stat.ino.toString(32);
                if (seenLinks.hasOwnProperty(id)) return gotTarget(null, seenLinks[id], base);
            }
            fs.stat(base, (function(err) {
                if (err) return cb(err);
                fs.readlink(base, (function(err, target) {
                    isWindows || (seenLinks[id] = target), gotTarget(err, target);
                }));
            }));
        }
        function gotTarget(err, target, base) {
            if (err) return cb(err);
            var resolvedLink = pathModule.resolve(previous, target);
            cache && (cache[base] = resolvedLink), gotResolvedLink(resolvedLink);
        }
        function gotResolvedLink(resolvedLink) {
            p = pathModule.resolve(resolvedLink, p.slice(pos)), start();
        }
        start();
    };
}
