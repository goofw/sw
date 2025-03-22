function(module, exports, __webpack_require__) {
    var fs$close, fs$closeSync, fs = __webpack_require__(2), polyfills = __webpack_require__(1193), legacy = __webpack_require__(1195), clone = __webpack_require__(1196), queue = [], util = __webpack_require__(0), debug = function() {};
    function patch(fs) {
        polyfills(fs), fs.gracefulify = patch, fs.FileReadStream = ReadStream, fs.FileWriteStream = WriteStream, 
        fs.createReadStream = function(path, options) {
            return new ReadStream(path, options);
        }, fs.createWriteStream = function(path, options) {
            return new WriteStream(path, options);
        };
        var fs$readFile = fs.readFile;
        fs.readFile = function(path, options, cb) {
            return "function" == typeof options && (cb = options, options = null), (function go$readFile(path, options, cb) {
                return fs$readFile(path, options, (function(err) {
                    !err || "EMFILE" !== err.code && "ENFILE" !== err.code ? ("function" == typeof cb && cb.apply(this, arguments), 
                    retry()) : enqueue([ go$readFile, [ path, options, cb ] ]);
                }));
            })(path, options, cb);
        };
        var fs$writeFile = fs.writeFile;
        fs.writeFile = function(path, data, options, cb) {
            return "function" == typeof options && (cb = options, options = null), (function go$writeFile(path, data, options, cb) {
                return fs$writeFile(path, data, options, (function(err) {
                    !err || "EMFILE" !== err.code && "ENFILE" !== err.code ? ("function" == typeof cb && cb.apply(this, arguments), 
                    retry()) : enqueue([ go$writeFile, [ path, data, options, cb ] ]);
                }));
            })(path, data, options, cb);
        };
        var fs$appendFile = fs.appendFile;
        fs$appendFile && (fs.appendFile = function(path, data, options, cb) {
            return "function" == typeof options && (cb = options, options = null), (function go$appendFile(path, data, options, cb) {
                return fs$appendFile(path, data, options, (function(err) {
                    !err || "EMFILE" !== err.code && "ENFILE" !== err.code ? ("function" == typeof cb && cb.apply(this, arguments), 
                    retry()) : enqueue([ go$appendFile, [ path, data, options, cb ] ]);
                }));
            })(path, data, options, cb);
        });
        var fs$readdir = fs.readdir;
        function go$readdir(args) {
            return fs$readdir.apply(fs, args);
        }
        if (fs.readdir = function(path, options, cb) {
            var args = [ path ];
            return "function" != typeof options ? args.push(options) : cb = options, args.push((function(err, files) {
                files && files.sort && files.sort(), !err || "EMFILE" !== err.code && "ENFILE" !== err.code ? ("function" == typeof cb && cb.apply(this, arguments), 
                retry()) : enqueue([ go$readdir, [ args ] ]);
            })), go$readdir(args);
        }, "v0.8" === process.version.substr(0, 4)) {
            var legStreams = legacy(fs);
            ReadStream = legStreams.ReadStream, WriteStream = legStreams.WriteStream;
        }
        var fs$ReadStream = fs.ReadStream;
        fs$ReadStream && (ReadStream.prototype = Object.create(fs$ReadStream.prototype), 
        ReadStream.prototype.open = function() {
            var that = this;
            open(that.path, that.flags, that.mode, (function(err, fd) {
                err ? (that.autoClose && that.destroy(), that.emit("error", err)) : (that.fd = fd, 
                that.emit("open", fd), that.read());
            }));
        });
        var fs$WriteStream = fs.WriteStream;
        function ReadStream(path, options) {
            return this instanceof ReadStream ? (fs$ReadStream.apply(this, arguments), this) : ReadStream.apply(Object.create(ReadStream.prototype), arguments);
        }
        function WriteStream(path, options) {
            return this instanceof WriteStream ? (fs$WriteStream.apply(this, arguments), this) : WriteStream.apply(Object.create(WriteStream.prototype), arguments);
        }
        fs$WriteStream && (WriteStream.prototype = Object.create(fs$WriteStream.prototype), 
        WriteStream.prototype.open = function() {
            var that = this;
            open(that.path, that.flags, that.mode, (function(err, fd) {
                err ? (that.destroy(), that.emit("error", err)) : (that.fd = fd, that.emit("open", fd));
            }));
        }), fs.ReadStream = ReadStream, fs.WriteStream = WriteStream;
        var fs$open = fs.open;
        function open(path, flags, mode, cb) {
            return "function" == typeof mode && (cb = mode, mode = null), (function go$open(path, flags, mode, cb) {
                return fs$open(path, flags, mode, (function(err, fd) {
                    !err || "EMFILE" !== err.code && "ENFILE" !== err.code ? ("function" == typeof cb && cb.apply(this, arguments), 
                    retry()) : enqueue([ go$open, [ path, flags, mode, cb ] ]);
                }));
            })(path, flags, mode, cb);
        }
        return fs.open = open, fs;
    }
    function enqueue(elem) {
        debug("ENQUEUE", elem[0].name, elem[1]), queue.push(elem);
    }
    function retry() {
        var elem = queue.shift();
        elem && (debug("RETRY", elem[0].name, elem[1]), elem[0].apply(null, elem[1]));
    }
    util.debuglog ? debug = util.debuglog("gfs4") : /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && (debug = function() {
        var m = util.format.apply(util, arguments);
        m = "GFS4: " + m.split(/\n/).join("\nGFS4: "), console.error(m);
    }), /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && process.on("exit", (function() {
        debug(queue), __webpack_require__(24).equal(queue.length, 0);
    })), module.exports = patch(clone(fs)), process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs.__patched && (module.exports = patch(fs), 
    fs.__patched = !0), module.exports.close = (fs$close = fs.close, function(fd, cb) {
        return fs$close.call(fs, fd, (function(err) {
            err || retry(), "function" == typeof cb && cb.apply(this, arguments);
        }));
    }), module.exports.closeSync = (fs$closeSync = fs.closeSync, function(fd) {
        var rval = fs$closeSync.apply(fs, arguments);
        return retry(), rval;
    }), /\bgraceful-fs\b/.test(fs.closeSync.toString()) || (fs.closeSync = module.exports.closeSync, 
    fs.close = module.exports.close);
}
