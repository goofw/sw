function(module, exports) {
    function isNumber(x) {
        return "number" == typeof x || !!/^0x[0-9a-f]+$/i.test(x) || /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x);
    }
    module.exports = function(args, opts) {
        opts || (opts = {});
        var flags = {
            bools: {},
            strings: {},
            unknownFn: null
        };
        "function" == typeof opts.unknown && (flags.unknownFn = opts.unknown), "boolean" == typeof opts.boolean && opts.boolean ? flags.allBools = !0 : [].concat(opts.boolean).filter(Boolean).forEach((function(key) {
            flags.bools[key] = !0;
        }));
        var aliases = {};
        Object.keys(opts.alias || {}).forEach((function(key) {
            aliases[key] = [].concat(opts.alias[key]), aliases[key].forEach((function(x) {
                aliases[x] = [ key ].concat(aliases[key].filter((function(y) {
                    return x !== y;
                })));
            }));
        })), [].concat(opts.string).filter(Boolean).forEach((function(key) {
            flags.strings[key] = !0, aliases[key] && (flags.strings[aliases[key]] = !0);
        }));
        var defaults = opts.default || {}, argv = {
            _: []
        };
        Object.keys(flags.bools).forEach((function(key) {
            setArg(key, void 0 !== defaults[key] && defaults[key]);
        }));
        var notFlags = [];
        function setArg(key, val, arg) {
            if (!arg || !flags.unknownFn || (function(key, arg) {
                return flags.allBools && /^--[^=]+$/.test(arg) || flags.strings[key] || flags.bools[key] || aliases[key];
            })(key, arg) || !1 !== flags.unknownFn(arg)) {
                var value = !flags.strings[key] && isNumber(val) ? Number(val) : val;
                setKey(argv, key.split("."), value), (aliases[key] || []).forEach((function(x) {
                    setKey(argv, x.split("."), value);
                }));
            }
        }
        function setKey(obj, keys, value) {
            var o = obj;
            keys.slice(0, -1).forEach((function(key) {
                void 0 === o[key] && (o[key] = {}), o = o[key];
            }));
            var key = keys[keys.length - 1];
            void 0 === o[key] || flags.bools[key] || "boolean" == typeof o[key] ? o[key] = value : Array.isArray(o[key]) ? o[key].push(value) : o[key] = [ o[key], value ];
        }
        function aliasIsBoolean(key) {
            return aliases[key].some((function(x) {
                return flags.bools[x];
            }));
        }
        -1 !== args.indexOf("--") && (notFlags = args.slice(args.indexOf("--") + 1), args = args.slice(0, args.indexOf("--")));
        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            if (/^--.+=/.test(arg)) {
                var m = arg.match(/^--([^=]+)=([\s\S]*)$/), key = m[1], value = m[2];
                flags.bools[key] && (value = "false" !== value), setArg(key, value, arg);
            } else if (/^--no-.+/.test(arg)) setArg(key = arg.match(/^--no-(.+)/)[1], !1, arg); else if (/^--.+/.test(arg)) key = arg.match(/^--(.+)/)[1], 
            void 0 === (next = args[i + 1]) || /^-/.test(next) || flags.bools[key] || flags.allBools || aliases[key] && aliasIsBoolean(key) ? /^(true|false)$/.test(next) ? (setArg(key, "true" === next, arg), 
            i++) : setArg(key, !flags.strings[key] || "", arg) : (setArg(key, next, arg), i++); else if (/^-[^-]+/.test(arg)) {
                for (var letters = arg.slice(1, -1).split(""), broken = !1, j = 0; j < letters.length; j++) {
                    var next;
                    if ("-" !== (next = arg.slice(j + 2))) {
                        if (/[A-Za-z]/.test(letters[j]) && /=/.test(next)) {
                            setArg(letters[j], next.split("=")[1], arg), broken = !0;
                            break;
                        }
                        if (/[A-Za-z]/.test(letters[j]) && /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
                            setArg(letters[j], next, arg), broken = !0;
                            break;
                        }
                        if (letters[j + 1] && letters[j + 1].match(/\W/)) {
                            setArg(letters[j], arg.slice(j + 2), arg), broken = !0;
                            break;
                        }
                        setArg(letters[j], !flags.strings[letters[j]] || "", arg);
                    } else setArg(letters[j], next, arg);
                }
                key = arg.slice(-1)[0], broken || "-" === key || (!args[i + 1] || /^(-|--)[^-]/.test(args[i + 1]) || flags.bools[key] || aliases[key] && aliasIsBoolean(key) ? args[i + 1] && /true|false/.test(args[i + 1]) ? (setArg(key, "true" === args[i + 1], arg), 
                i++) : setArg(key, !flags.strings[key] || "", arg) : (setArg(key, args[i + 1], arg), 
                i++));
            } else if (flags.unknownFn && !1 === flags.unknownFn(arg) || argv._.push(flags.strings._ || !isNumber(arg) ? arg : Number(arg)), 
            opts.stopEarly) {
                argv._.push.apply(argv._, args.slice(i + 1));
                break;
            }
        }
        return Object.keys(defaults).forEach((function(key) {
            var obj, keys, o;
            obj = argv, keys = key.split("."), o = obj, keys.slice(0, -1).forEach((function(key) {
                o = o[key] || {};
            })), keys[keys.length - 1] in o || (setKey(argv, key.split("."), defaults[key]), 
            (aliases[key] || []).forEach((function(x) {
                setKey(argv, x.split("."), defaults[key]);
            })));
        })), opts["--"] ? (argv["--"] = new Array, notFlags.forEach((function(key) {
            argv["--"].push(key);
        }))) : notFlags.forEach((function(key) {
            argv._.push(key);
        })), argv;
    };
}
