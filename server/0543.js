function(module, exports, __webpack_require__) {
    var tty = __webpack_require__(105), util = __webpack_require__(0);
    (exports = module.exports = __webpack_require__(246)).init = function(debug) {
        debug.inspectOpts = {};
        for (var keys = Object.keys(exports.inspectOpts), i = 0; i < keys.length; i++) debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
    }, exports.log = function() {
        return stream.write(util.format.apply(util, arguments) + "\n");
    }, exports.formatArgs = function(args) {
        var name = this.namespace;
        if (this.useColors) {
            var c = this.color, prefix = "  [3" + c + ";1m" + name + " [0m";
            args[0] = prefix + args[0].split("\n").join("\n" + prefix), args.push("[3" + c + "m+" + exports.humanize(this.diff) + "[0m");
        } else args[0] = (new Date).toUTCString() + " " + name + " " + args[0];
    }, exports.save = function(namespaces) {
        null == namespaces ? delete process.env.DEBUG : process.env.DEBUG = namespaces;
    }, exports.load = load, exports.useColors = function() {
        return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(fd);
    }, exports.colors = [ 6, 2, 3, 4, 5, 1 ], exports.inspectOpts = Object.keys(process.env).filter((function(key) {
        return /^debug_/i.test(key);
    })).reduce((function(obj, key) {
        var prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (function(_, k) {
            return k.toUpperCase();
        })), val = process.env[key];
        return val = !!/^(yes|on|true|enabled)$/i.test(val) || !/^(no|off|false|disabled)$/i.test(val) && ("null" === val ? null : Number(val)), 
        obj[prop] = val, obj;
    }), {});
    var fd = parseInt(process.env.DEBUG_FD, 10) || 2;
    1 !== fd && 2 !== fd && util.deprecate((function() {}), "except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)")();
    var stream = 1 === fd ? process.stdout : 2 === fd ? process.stderr : (function(fd) {
        var stream;
        switch (process.binding("tty_wrap").guessHandleType(fd)) {
          case "TTY":
            (stream = new tty.WriteStream(fd))._type = "tty", stream._handle && stream._handle.unref && stream._handle.unref();
            break;

          case "FILE":
            (stream = new (__webpack_require__(2).SyncWriteStream)(fd, {
                autoClose: !1
            }))._type = "fs";
            break;

          case "PIPE":
          case "TCP":
            (stream = new (__webpack_require__(42).Socket)({
                fd: fd,
                readable: !1,
                writable: !0
            })).readable = !1, stream.read = null, stream._type = "pipe", stream._handle && stream._handle.unref && stream._handle.unref();
            break;

          default:
            throw new Error("Implement me. Unknown stream file type!");
        }
        return stream.fd = fd, stream._isStdio = !0, stream;
    })(fd);
    function load() {
        return process.env.DEBUG;
    }
    exports.formatters.o = function(v) {
        return this.inspectOpts.colors = this.useColors, util.inspect(v, this.inspectOpts).split("\n").map((function(str) {
            return str.trim();
        })).join(" ");
    }, exports.formatters.O = function(v) {
        return this.inspectOpts.colors = this.useColors, util.inspect(v, this.inspectOpts);
    }, exports.enable(load());
}
