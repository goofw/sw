function(module, exports, __webpack_require__) {
    var mod_assert = __webpack_require__(24), mod_util = __webpack_require__(0);
    function jsSprintf(fmt) {
        var flags, width, precision, conversion, left, pad, sign, arg, match, regex = [ "([^%]*)", "%", "(['\\-+ #0]*?)", "([1-9]\\d*)?", "(\\.([1-9]\\d*))?", "[lhjztL]*?", "([diouxXfFeEgGaAcCsSp%jr])" ].join(""), re = new RegExp(regex), args = Array.prototype.slice.call(arguments, 1), ret = "", argn = 1;
        for (mod_assert.equal("string", typeof fmt); null !== (match = re.exec(fmt)); ) if (ret += match[1], 
        fmt = fmt.substring(match[0].length), flags = match[2] || "", width = match[3] || 0, 
        precision = match[4] || "", left = !1, sign = !1, pad = " ", "%" != (conversion = match[6])) {
            if (0 === args.length) throw new Error("too few args to sprintf");
            if (arg = args.shift(), argn++, flags.match(/[\' #]/)) throw new Error("unsupported flags: " + flags);
            if (precision.length > 0) throw new Error("non-zero precision not supported");
            switch (flags.match(/-/) && (left = !0), flags.match(/0/) && (pad = "0"), flags.match(/\+/) && (sign = !0), 
            conversion) {
              case "s":
                if (null == arg) throw new Error("argument " + argn + ": attempted to print undefined or null as a string");
                ret += doPad(pad, width, left, arg.toString());
                break;

              case "d":
                arg = Math.floor(arg);

              case "f":
                ret += (sign = sign && arg > 0 ? "+" : "") + doPad(pad, width, left, arg.toString());
                break;

              case "x":
                ret += doPad(pad, width, left, arg.toString(16));
                break;

              case "j":
                0 === width && (width = 10), ret += mod_util.inspect(arg, !1, width);
                break;

              case "r":
                ret += dumpException(arg);
                break;

              default:
                throw new Error("unsupported conversion: " + conversion);
            }
        } else ret += "%";
        return ret + fmt;
    }
    function jsFprintf(stream) {
        var args = Array.prototype.slice.call(arguments, 1);
        return stream.write(jsSprintf.apply(this, args));
    }
    function doPad(chr, width, left, str) {
        for (var ret = str; ret.length < width; ) left ? ret += chr : ret = chr + ret;
        return ret;
    }
    function dumpException(ex) {
        var ret;
        if (!(ex instanceof Error)) throw new Error(jsSprintf("invalid type for %%r: %j", ex));
        if (ret = "EXCEPTION: " + ex.constructor.name + ": " + ex.stack, ex.cause && "function" == typeof ex.cause) {
            var cex = ex.cause();
            cex && (ret += "\nCaused by: " + dumpException(cex));
        }
        return ret;
    }
    exports.sprintf = jsSprintf, exports.printf = function() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(process.stdout), jsFprintf.apply(null, args);
    }, exports.fprintf = jsFprintf;
}
