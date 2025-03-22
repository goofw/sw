function(module, exports, __webpack_require__) {
    var mod_assertplus = __webpack_require__(15), mod_util = __webpack_require__(0), mod_extsprintf = __webpack_require__(1063), mod_isError = __webpack_require__(1064).isError, sprintf = mod_extsprintf.sprintf;
    function parseConstructorArguments(args) {
        var argv, options, sprintf_args, k;
        if (mod_assertplus.object(args, "args"), mod_assertplus.bool(args.strict, "args.strict"), 
        mod_assertplus.array(args.argv, "args.argv"), 0 === (argv = args.argv).length) options = {}, 
        sprintf_args = []; else if (mod_isError(argv[0])) options = {
            cause: argv[0]
        }, sprintf_args = argv.slice(1); else if ("object" == typeof argv[0]) {
            for (k in options = {}, argv[0]) options[k] = argv[0][k];
            sprintf_args = argv.slice(1);
        } else mod_assertplus.string(argv[0], "first argument to VError, SError, or WError constructor must be a string, object, or Error"), 
        options = {}, sprintf_args = argv;
        return mod_assertplus.object(options), options.strict || args.strict || (sprintf_args = sprintf_args.map((function(a) {
            return null === a ? "null" : void 0 === a ? "undefined" : a;
        }))), {
            options: options,
            shortmessage: 0 === sprintf_args.length ? "" : sprintf.apply(null, sprintf_args)
        };
    }
    function VError() {
        var args, obj, parsed, cause, ctor, message, k;
        if (args = Array.prototype.slice.call(arguments, 0), !(this instanceof VError)) return obj = Object.create(VError.prototype), 
        VError.apply(obj, arguments), obj;
        if ((parsed = parseConstructorArguments({
            argv: args,
            strict: !1
        })).options.name && (mod_assertplus.string(parsed.options.name, 'error\'s "name" must be a string'), 
        this.name = parsed.options.name), this.jse_shortmsg = parsed.shortmessage, message = parsed.shortmessage, 
        (cause = parsed.options.cause) && (mod_assertplus.ok(mod_isError(cause), "cause is not an Error"), 
        this.jse_cause = cause, parsed.options.skipCauseMessage || (message += ": " + cause.message)), 
        this.jse_info = {}, parsed.options.info) for (k in parsed.options.info) this.jse_info[k] = parsed.options.info[k];
        return this.message = message, Error.call(this, message), Error.captureStackTrace && (ctor = parsed.options.constructorOpt || this.constructor, 
        Error.captureStackTrace(this, ctor)), this;
    }
    function SError() {
        var args, obj, parsed, options;
        return args = Array.prototype.slice.call(arguments, 0), this instanceof SError ? (options = (parsed = parseConstructorArguments({
            argv: args,
            strict: !0
        })).options, VError.call(this, options, "%s", parsed.shortmessage), this) : (obj = Object.create(SError.prototype), 
        SError.apply(obj, arguments), obj);
    }
    function MultiError(errors) {
        mod_assertplus.array(errors, "list of errors"), mod_assertplus.ok(errors.length > 0, "must be at least one error"), 
        this.ase_errors = errors, VError.call(this, {
            cause: errors[0]
        }, "first of %d error%s", errors.length, 1 == errors.length ? "" : "s");
    }
    function WError() {
        var args, obj, parsed, options;
        return args = Array.prototype.slice.call(arguments, 0), this instanceof WError ? ((options = (parsed = parseConstructorArguments({
            argv: args,
            strict: !1
        })).options).skipCauseMessage = !0, VError.call(this, options, "%s", parsed.shortmessage), 
        this) : (obj = Object.create(WError.prototype), WError.apply(obj, args), obj);
    }
    module.exports = VError, VError.VError = VError, VError.SError = SError, VError.WError = WError, 
    VError.MultiError = MultiError, mod_util.inherits(VError, Error), VError.prototype.name = "VError", 
    VError.prototype.toString = function() {
        var str = this.hasOwnProperty("name") && this.name || this.constructor.name || this.constructor.prototype.name;
        return this.message && (str += ": " + this.message), str;
    }, VError.prototype.cause = function() {
        var cause = VError.cause(this);
        return null === cause ? void 0 : cause;
    }, VError.cause = function(err) {
        return mod_assertplus.ok(mod_isError(err), "err must be an Error"), mod_isError(err.jse_cause) ? err.jse_cause : null;
    }, VError.info = function(err) {
        var rv, cause, k;
        if (mod_assertplus.ok(mod_isError(err), "err must be an Error"), rv = null !== (cause = VError.cause(err)) ? VError.info(cause) : {}, 
        "object" == typeof err.jse_info && null !== err.jse_info) for (k in err.jse_info) rv[k] = err.jse_info[k];
        return rv;
    }, VError.findCauseByName = function(err, name) {
        var cause;
        for (mod_assertplus.ok(mod_isError(err), "err must be an Error"), mod_assertplus.string(name, "name"), 
        mod_assertplus.ok(name.length > 0, "name cannot be empty"), cause = err; null !== cause; cause = VError.cause(cause)) if (mod_assertplus.ok(mod_isError(cause)), 
        cause.name == name) return cause;
        return null;
    }, VError.hasCauseWithName = function(err, name) {
        return null !== VError.findCauseByName(err, name);
    }, VError.fullStack = function(err) {
        mod_assertplus.ok(mod_isError(err), "err must be an Error");
        var cause = VError.cause(err);
        return cause ? err.stack + "\ncaused by: " + VError.fullStack(cause) : err.stack;
    }, VError.errorFromList = function(errors) {
        return mod_assertplus.arrayOfObject(errors, "errors"), 0 === errors.length ? null : (errors.forEach((function(e) {
            mod_assertplus.ok(mod_isError(e));
        })), 1 == errors.length ? errors[0] : new MultiError(errors));
    }, VError.errorForEach = function(err, func) {
        mod_assertplus.ok(mod_isError(err), "err must be an Error"), mod_assertplus.func(func, "func"), 
        err instanceof MultiError ? err.errors().forEach((function(e) {
            func(e);
        })) : func(err);
    }, mod_util.inherits(SError, VError), mod_util.inherits(MultiError, VError), MultiError.prototype.name = "MultiError", 
    MultiError.prototype.errors = function() {
        return this.ase_errors.slice(0);
    }, mod_util.inherits(WError, VError), WError.prototype.name = "WError", WError.prototype.toString = function() {
        var str = this.hasOwnProperty("name") && this.name || this.constructor.name || this.constructor.prototype.name;
        return this.message && (str += ": " + this.message), this.jse_cause && this.jse_cause.message && (str += "; caused by " + this.jse_cause.toString()), 
        str;
    }, WError.prototype.cause = function(c) {
        return mod_isError(c) && (this.jse_cause = c), this.jse_cause;
    };
}
