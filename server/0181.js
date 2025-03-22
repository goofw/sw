function(module, exports, __webpack_require__) {
    module.exports = minimatch, minimatch.Minimatch = Minimatch;
    var path = (function() {
        try {
            return __webpack_require__(4);
        } catch (e) {}
    })() || {
        sep: "/"
    };
    minimatch.sep = path.sep;
    var GLOBSTAR = minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {}, expand = __webpack_require__(779), plTypes = {
        "!": {
            open: "(?:(?!(?:",
            close: "))[^/]*?)"
        },
        "?": {
            open: "(?:",
            close: ")?"
        },
        "+": {
            open: "(?:",
            close: ")+"
        },
        "*": {
            open: "(?:",
            close: ")*"
        },
        "@": {
            open: "(?:",
            close: ")"
        }
    }, reSpecials = "().*{}+?[]^$\\!".split("").reduce((function(set, c) {
        return set[c] = !0, set;
    }), {}), slashSplit = /\/+/;
    function ext(a, b) {
        b = b || {};
        var t = {};
        return Object.keys(a).forEach((function(k) {
            t[k] = a[k];
        })), Object.keys(b).forEach((function(k) {
            t[k] = b[k];
        })), t;
    }
    function minimatch(p, pattern, options) {
        return assertValidPattern(pattern), options || (options = {}), !(!options.nocomment && "#" === pattern.charAt(0)) && new Minimatch(pattern, options).match(p);
    }
    function Minimatch(pattern, options) {
        if (!(this instanceof Minimatch)) return new Minimatch(pattern, options);
        assertValidPattern(pattern), options || (options = {}), pattern = pattern.trim(), 
        options.allowWindowsEscape || "/" === path.sep || (pattern = pattern.split(path.sep).join("/")), 
        this.options = options, this.set = [], this.pattern = pattern, this.regexp = null, 
        this.negate = !1, this.comment = !1, this.empty = !1, this.partial = !!options.partial, 
        this.make();
    }
    function braceExpand(pattern, options) {
        return options || (options = this instanceof Minimatch ? this.options : {}), pattern = void 0 === pattern ? this.pattern : pattern, 
        assertValidPattern(pattern), options.nobrace || !/\{(?:(?!\{).)*\}/.test(pattern) ? [ pattern ] : expand(pattern);
    }
    minimatch.filter = function(pattern, options) {
        return options = options || {}, function(p, i, list) {
            return minimatch(p, pattern, options);
        };
    }, minimatch.defaults = function(def) {
        if (!def || "object" != typeof def || !Object.keys(def).length) return minimatch;
        var orig = minimatch, m = function(p, pattern, options) {
            return orig(p, pattern, ext(def, options));
        };
        return (m.Minimatch = function(pattern, options) {
            return new orig.Minimatch(pattern, ext(def, options));
        }).defaults = function(options) {
            return orig.defaults(ext(def, options)).Minimatch;
        }, m.filter = function(pattern, options) {
            return orig.filter(pattern, ext(def, options));
        }, m.defaults = function(options) {
            return orig.defaults(ext(def, options));
        }, m.makeRe = function(pattern, options) {
            return orig.makeRe(pattern, ext(def, options));
        }, m.braceExpand = function(pattern, options) {
            return orig.braceExpand(pattern, ext(def, options));
        }, m.match = function(list, pattern, options) {
            return orig.match(list, pattern, ext(def, options));
        }, m;
    }, Minimatch.defaults = function(def) {
        return minimatch.defaults(def).Minimatch;
    }, Minimatch.prototype.debug = function() {}, Minimatch.prototype.make = function() {
        var pattern = this.pattern, options = this.options;
        if (options.nocomment || "#" !== pattern.charAt(0)) if (pattern) {
            this.parseNegate();
            var set = this.globSet = this.braceExpand();
            options.debug && (this.debug = function() {
                console.error.apply(console, arguments);
            }), this.debug(this.pattern, set), set = this.globParts = set.map((function(s) {
                return s.split(slashSplit);
            })), this.debug(this.pattern, set), set = set.map((function(s, si, set) {
                return s.map(this.parse, this);
            }), this), this.debug(this.pattern, set), set = set.filter((function(s) {
                return -1 === s.indexOf(!1);
            })), this.debug(this.pattern, set), this.set = set;
        } else this.empty = !0; else this.comment = !0;
    }, Minimatch.prototype.parseNegate = function() {
        var pattern = this.pattern, negate = !1, negateOffset = 0;
        if (!this.options.nonegate) {
            for (var i = 0, l = pattern.length; i < l && "!" === pattern.charAt(i); i++) negate = !negate, 
            negateOffset++;
            negateOffset && (this.pattern = pattern.substr(negateOffset)), this.negate = negate;
        }
    }, minimatch.braceExpand = function(pattern, options) {
        return braceExpand(pattern, options);
    }, Minimatch.prototype.braceExpand = braceExpand;
    var assertValidPattern = function(pattern) {
        if ("string" != typeof pattern) throw new TypeError("invalid pattern");
        if (pattern.length > 65536) throw new TypeError("pattern is too long");
    };
    Minimatch.prototype.parse = function(pattern, isSub) {
        assertValidPattern(pattern);
        var options = this.options;
        if ("**" === pattern) {
            if (!options.noglobstar) return GLOBSTAR;
            pattern = "*";
        }
        if ("" === pattern) return "";
        var stateChar, re = "", hasMagic = !!options.nocase, escaping = !1, patternListStack = [], negativeLists = [], inClass = !1, reClassStart = -1, classStart = -1, patternStart = "." === pattern.charAt(0) ? "" : options.dot ? "(?!(?:^|\\/)\\.{1,2}(?:$|\\/))" : "(?!\\.)", self = this;
        function clearStateChar() {
            if (stateChar) {
                switch (stateChar) {
                  case "*":
                    re += "[^/]*?", hasMagic = !0;
                    break;

                  case "?":
                    re += "[^/]", hasMagic = !0;
                    break;

                  default:
                    re += "\\" + stateChar;
                }
                self.debug("clearStateChar %j %j", stateChar, re), stateChar = !1;
            }
        }
        for (var c, i = 0, len = pattern.length; i < len && (c = pattern.charAt(i)); i++) if (this.debug("%s\t%s %s %j", pattern, i, re, c), 
        escaping && reSpecials[c]) re += "\\" + c, escaping = !1; else switch (c) {
          case "/":
            return !1;

          case "\\":
            clearStateChar(), escaping = !0;
            continue;

          case "?":
          case "*":
          case "+":
          case "@":
          case "!":
            if (this.debug("%s\t%s %s %j <-- stateChar", pattern, i, re, c), inClass) {
                this.debug("  in class"), "!" === c && i === classStart + 1 && (c = "^"), re += c;
                continue;
            }
            self.debug("call clearStateChar %j", stateChar), clearStateChar(), stateChar = c, 
            options.noext && clearStateChar();
            continue;

          case "(":
            if (inClass) {
                re += "(";
                continue;
            }
            if (!stateChar) {
                re += "\\(";
                continue;
            }
            patternListStack.push({
                type: stateChar,
                start: i - 1,
                reStart: re.length,
                open: plTypes[stateChar].open,
                close: plTypes[stateChar].close
            }), re += "!" === stateChar ? "(?:(?!(?:" : "(?:", this.debug("plType %j %j", stateChar, re), 
            stateChar = !1;
            continue;

          case ")":
            if (inClass || !patternListStack.length) {
                re += "\\)";
                continue;
            }
            clearStateChar(), hasMagic = !0;
            var pl = patternListStack.pop();
            re += pl.close, "!" === pl.type && negativeLists.push(pl), pl.reEnd = re.length;
            continue;

          case "|":
            if (inClass || !patternListStack.length || escaping) {
                re += "\\|", escaping = !1;
                continue;
            }
            clearStateChar(), re += "|";
            continue;

          case "[":
            if (clearStateChar(), inClass) {
                re += "\\" + c;
                continue;
            }
            inClass = !0, classStart = i, reClassStart = re.length, re += c;
            continue;

          case "]":
            if (i === classStart + 1 || !inClass) {
                re += "\\" + c, escaping = !1;
                continue;
            }
            var cs = pattern.substring(classStart + 1, i);
            try {
                RegExp("[" + cs + "]");
            } catch (er) {
                var sp = this.parse(cs, SUBPARSE);
                re = re.substr(0, reClassStart) + "\\[" + sp[0] + "\\]", hasMagic = hasMagic || sp[1], 
                inClass = !1;
                continue;
            }
            hasMagic = !0, inClass = !1, re += c;
            continue;

          default:
            clearStateChar(), escaping ? escaping = !1 : !reSpecials[c] || "^" === c && inClass || (re += "\\"), 
            re += c;
        }
        for (inClass && (cs = pattern.substr(classStart + 1), sp = this.parse(cs, SUBPARSE), 
        re = re.substr(0, reClassStart) + "\\[" + sp[0], hasMagic = hasMagic || sp[1]), 
        pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
            var tail = re.slice(pl.reStart + pl.open.length);
            this.debug("setting tail", re, pl), tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, (function(_, $1, $2) {
                return $2 || ($2 = "\\"), $1 + $1 + $2 + "|";
            })), this.debug("tail=%j\n   %s", tail, tail, pl, re);
            var t = "*" === pl.type ? "[^/]*?" : "?" === pl.type ? "[^/]" : "\\" + pl.type;
            hasMagic = !0, re = re.slice(0, pl.reStart) + t + "\\(" + tail;
        }
        clearStateChar(), escaping && (re += "\\\\");
        var addPatternStart = !1;
        switch (re.charAt(0)) {
          case "[":
          case ".":
          case "(":
            addPatternStart = !0;
        }
        for (var n = negativeLists.length - 1; n > -1; n--) {
            var nl = negativeLists[n], nlBefore = re.slice(0, nl.reStart), nlFirst = re.slice(nl.reStart, nl.reEnd - 8), nlLast = re.slice(nl.reEnd - 8, nl.reEnd), nlAfter = re.slice(nl.reEnd);
            nlLast += nlAfter;
            var openParensBefore = nlBefore.split("(").length - 1, cleanAfter = nlAfter;
            for (i = 0; i < openParensBefore; i++) cleanAfter = cleanAfter.replace(/\)[+*?]?/, "");
            var dollar = "";
            "" === (nlAfter = cleanAfter) && isSub !== SUBPARSE && (dollar = "$"), re = nlBefore + nlFirst + nlAfter + dollar + nlLast;
        }
        if ("" !== re && hasMagic && (re = "(?=.)" + re), addPatternStart && (re = patternStart + re), 
        isSub === SUBPARSE) return [ re, hasMagic ];
        if (!hasMagic) return pattern.replace(/\\(.)/g, "$1");
        var flags = options.nocase ? "i" : "";
        try {
            var regExp = new RegExp("^" + re + "$", flags);
        } catch (er) {
            return new RegExp("$.");
        }
        return regExp._glob = pattern, regExp._src = re, regExp;
    };
    var SUBPARSE = {};
    minimatch.makeRe = function(pattern, options) {
        return new Minimatch(pattern, options || {}).makeRe();
    }, Minimatch.prototype.makeRe = function() {
        if (this.regexp || !1 === this.regexp) return this.regexp;
        var set = this.set;
        if (!set.length) return this.regexp = !1, this.regexp;
        var options = this.options, twoStar = options.noglobstar ? "[^/]*?" : options.dot ? "(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?" : "(?:(?!(?:\\/|^)\\.).)*?", flags = options.nocase ? "i" : "", re = set.map((function(pattern) {
            return pattern.map((function(p) {
                return p === GLOBSTAR ? twoStar : "string" == typeof p ? p.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") : p._src;
            })).join("\\/");
        })).join("|");
        re = "^(?:" + re + ")$", this.negate && (re = "^(?!" + re + ").*$");
        try {
            this.regexp = new RegExp(re, flags);
        } catch (ex) {
            this.regexp = !1;
        }
        return this.regexp;
    }, minimatch.match = function(list, pattern, options) {
        var mm = new Minimatch(pattern, options = options || {});
        return list = list.filter((function(f) {
            return mm.match(f);
        })), mm.options.nonull && !list.length && list.push(pattern), list;
    }, Minimatch.prototype.match = function(f, partial) {
        if (void 0 === partial && (partial = this.partial), this.debug("match", f, this.pattern), 
        this.comment) return !1;
        if (this.empty) return "" === f;
        if ("/" === f && partial) return !0;
        var options = this.options;
        "/" !== path.sep && (f = f.split(path.sep).join("/")), f = f.split(slashSplit), 
        this.debug(this.pattern, "split", f);
        var filename, i, set = this.set;
        for (this.debug(this.pattern, "set", set), i = f.length - 1; i >= 0 && !(filename = f[i]); i--) ;
        for (i = 0; i < set.length; i++) {
            var pattern = set[i], file = f;
            if (options.matchBase && 1 === pattern.length && (file = [ filename ]), this.matchOne(file, pattern, partial)) return !!options.flipNegate || !this.negate;
        }
        return !options.flipNegate && this.negate;
    }, Minimatch.prototype.matchOne = function(file, pattern, partial) {
        var options = this.options;
        this.debug("matchOne", {
            this: this,
            file: file,
            pattern: pattern
        }), this.debug("matchOne", file.length, pattern.length);
        for (var fi = 0, pi = 0, fl = file.length, pl = pattern.length; fi < fl && pi < pl; fi++, 
        pi++) {
            this.debug("matchOne loop");
            var hit, p = pattern[pi], f = file[fi];
            if (this.debug(pattern, p, f), !1 === p) return !1;
            if (p === GLOBSTAR) {
                this.debug("GLOBSTAR", [ pattern, p, f ]);
                var fr = fi, pr = pi + 1;
                if (pr === pl) {
                    for (this.debug("** at the end"); fi < fl; fi++) if ("." === file[fi] || ".." === file[fi] || !options.dot && "." === file[fi].charAt(0)) return !1;
                    return !0;
                }
                for (;fr < fl; ) {
                    var swallowee = file[fr];
                    if (this.debug("\nglobstar while", file, fr, pattern, pr, swallowee), this.matchOne(file.slice(fr), pattern.slice(pr), partial)) return this.debug("globstar found match!", fr, fl, swallowee), 
                    !0;
                    if ("." === swallowee || ".." === swallowee || !options.dot && "." === swallowee.charAt(0)) {
                        this.debug("dot detected!", file, fr, pattern, pr);
                        break;
                    }
                    this.debug("globstar swallow a segment, and continue"), fr++;
                }
                return !(!partial || (this.debug("\n>>> no match, partial?", file, fr, pattern, pr), 
                fr !== fl));
            }
            if ("string" == typeof p ? (hit = f === p, this.debug("string match", p, f, hit)) : (hit = f.match(p), 
            this.debug("pattern match", p, f, hit)), !hit) return !1;
        }
        if (fi === fl && pi === pl) return !0;
        if (fi === fl) return partial;
        if (pi === pl) return fi === fl - 1 && "" === file[fi];
        throw new Error("wtf?");
    };
}
