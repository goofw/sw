function(module, exports, __webpack_require__) {
    var __WEBPACK_AMD_DEFINE_RESULT__, __extends, __assign, __rest, __decorate, __param, __metadata, __awaiter, __generator, __exportStar, __values, __read, __spread, __spreadArrays, __spreadArray, __await, __asyncGenerator, __asyncDelegator, __asyncValues, __makeTemplateObject, __importStar, __importDefault, __classPrivateFieldGet, __classPrivateFieldSet, __createBinding;
    !(function(factory) {
        var root = "object" == typeof global ? global : "object" == typeof self ? self : "object" == typeof this ? this : {};
        function createExporter(exports, previous) {
            return exports !== root && ("function" == typeof Object.create ? Object.defineProperty(exports, "__esModule", {
                value: !0
            }) : exports.__esModule = !0), function(id, v) {
                return exports[id] = previous ? previous(id, v) : v;
            };
        }
        __WEBPACK_AMD_DEFINE_RESULT__ = function(exports) {
            !(function(exporter) {
                var extendStatics = Object.setPrototypeOf || {
                    __proto__: []
                } instanceof Array && function(d, b) {
                    d.__proto__ = b;
                } || function(d, b) {
                    for (var p in b) Object.prototype.hasOwnProperty.call(b, p) && (d[p] = b[p]);
                };
                __extends = function(d, b) {
                    if ("function" != typeof b && null !== b) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
                    function __() {
                        this.constructor = d;
                    }
                    extendStatics(d, b), d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, 
                    new __);
                }, __assign = Object.assign || function(t) {
                    for (var s, i = 1, n = arguments.length; i < n; i++) for (var p in s = arguments[i]) Object.prototype.hasOwnProperty.call(s, p) && (t[p] = s[p]);
                    return t;
                }, __rest = function(s, e) {
                    var t = {};
                    for (var p in s) Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0 && (t[p] = s[p]);
                    if (null != s && "function" == typeof Object.getOwnPropertySymbols) {
                        var i = 0;
                        for (p = Object.getOwnPropertySymbols(s); i < p.length; i++) e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]) && (t[p[i]] = s[p[i]]);
                    }
                    return t;
                }, __decorate = function(decorators, target, key, desc) {
                    var d, c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc;
                    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
                    return c > 3 && r && Object.defineProperty(target, key, r), r;
                }, __param = function(paramIndex, decorator) {
                    return function(target, key) {
                        decorator(target, key, paramIndex);
                    };
                }, __metadata = function(metadataKey, metadataValue) {
                    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(metadataKey, metadataValue);
                }, __awaiter = function(thisArg, _arguments, P, generator) {
                    return new (P || (P = Promise))((function(resolve, reject) {
                        function fulfilled(value) {
                            try {
                                step(generator.next(value));
                            } catch (e) {
                                reject(e);
                            }
                        }
                        function rejected(value) {
                            try {
                                step(generator.throw(value));
                            } catch (e) {
                                reject(e);
                            }
                        }
                        function step(result) {
                            result.done ? resolve(result.value) : (function(value) {
                                return value instanceof P ? value : new P((function(resolve) {
                                    resolve(value);
                                }));
                            })(result.value).then(fulfilled, rejected);
                        }
                        step((generator = generator.apply(thisArg, _arguments || [])).next());
                    }));
                }, __generator = function(thisArg, body) {
                    var f, y, t, g, _ = {
                        label: 0,
                        sent: function() {
                            if (1 & t[0]) throw t[1];
                            return t[1];
                        },
                        trys: [],
                        ops: []
                    };
                    return g = {
                        next: verb(0),
                        throw: verb(1),
                        return: verb(2)
                    }, "function" == typeof Symbol && (g[Symbol.iterator] = function() {
                        return this;
                    }), g;
                    function verb(n) {
                        return function(v) {
                            return (function(op) {
                                if (f) throw new TypeError("Generator is already executing.");
                                for (;_; ) try {
                                    if (f = 1, y && (t = 2 & op[0] ? y.return : op[0] ? y.throw || ((t = y.return) && t.call(y), 
                                    0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                                    switch (y = 0, t && (op = [ 2 & op[0], t.value ]), op[0]) {
                                      case 0:
                                      case 1:
                                        t = op;
                                        break;

                                      case 4:
                                        return _.label++, {
                                            value: op[1],
                                            done: !1
                                        };

                                      case 5:
                                        _.label++, y = op[1], op = [ 0 ];
                                        continue;

                                      case 7:
                                        op = _.ops.pop(), _.trys.pop();
                                        continue;

                                      default:
                                        if (!((t = (t = _.trys).length > 0 && t[t.length - 1]) || 6 !== op[0] && 2 !== op[0])) {
                                            _ = 0;
                                            continue;
                                        }
                                        if (3 === op[0] && (!t || op[1] > t[0] && op[1] < t[3])) {
                                            _.label = op[1];
                                            break;
                                        }
                                        if (6 === op[0] && _.label < t[1]) {
                                            _.label = t[1], t = op;
                                            break;
                                        }
                                        if (t && _.label < t[2]) {
                                            _.label = t[2], _.ops.push(op);
                                            break;
                                        }
                                        t[2] && _.ops.pop(), _.trys.pop();
                                        continue;
                                    }
                                    op = body.call(thisArg, _);
                                } catch (e) {
                                    op = [ 6, e ], y = 0;
                                } finally {
                                    f = t = 0;
                                }
                                if (5 & op[0]) throw op[1];
                                return {
                                    value: op[0] ? op[1] : void 0,
                                    done: !0
                                };
                            })([ n, v ]);
                        };
                    }
                }, __exportStar = function(m, o) {
                    for (var p in m) "default" === p || Object.prototype.hasOwnProperty.call(o, p) || __createBinding(o, m, p);
                }, __createBinding = Object.create ? function(o, m, k, k2) {
                    void 0 === k2 && (k2 = k), Object.defineProperty(o, k2, {
                        enumerable: !0,
                        get: function() {
                            return m[k];
                        }
                    });
                } : function(o, m, k, k2) {
                    void 0 === k2 && (k2 = k), o[k2] = m[k];
                }, __values = function(o) {
                    var s = "function" == typeof Symbol && Symbol.iterator, m = s && o[s], i = 0;
                    if (m) return m.call(o);
                    if (o && "number" == typeof o.length) return {
                        next: function() {
                            return o && i >= o.length && (o = void 0), {
                                value: o && o[i++],
                                done: !o
                            };
                        }
                    };
                    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
                }, __read = function(o, n) {
                    var m = "function" == typeof Symbol && o[Symbol.iterator];
                    if (!m) return o;
                    var r, e, i = m.call(o), ar = [];
                    try {
                        for (;(void 0 === n || n-- > 0) && !(r = i.next()).done; ) ar.push(r.value);
                    } catch (error) {
                        e = {
                            error: error
                        };
                    } finally {
                        try {
                            r && !r.done && (m = i.return) && m.call(i);
                        } finally {
                            if (e) throw e.error;
                        }
                    }
                    return ar;
                }, __spread = function() {
                    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
                    return ar;
                }, __spreadArrays = function() {
                    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
                    var r = Array(s), k = 0;
                    for (i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, 
                    k++) r[k] = a[j];
                    return r;
                }, __spreadArray = function(to, from, pack) {
                    if (pack || 2 === arguments.length) for (var ar, i = 0, l = from.length; i < l; i++) !ar && i in from || (ar || (ar = Array.prototype.slice.call(from, 0, i)), 
                    ar[i] = from[i]);
                    return to.concat(ar || Array.prototype.slice.call(from));
                }, __await = function(v) {
                    return this instanceof __await ? (this.v = v, this) : new __await(v);
                }, __asyncGenerator = function(thisArg, _arguments, generator) {
                    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
                    var i, g = generator.apply(thisArg, _arguments || []), q = [];
                    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
                        return this;
                    }, i;
                    function verb(n) {
                        g[n] && (i[n] = function(v) {
                            return new Promise((function(a, b) {
                                q.push([ n, v, a, b ]) > 1 || resume(n, v);
                            }));
                        });
                    }
                    function resume(n, v) {
                        try {
                            (r = g[n](v)).value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
                        } catch (e) {
                            settle(q[0][3], e);
                        }
                        var r;
                    }
                    function fulfill(value) {
                        resume("next", value);
                    }
                    function reject(value) {
                        resume("throw", value);
                    }
                    function settle(f, v) {
                        f(v), q.shift(), q.length && resume(q[0][0], q[0][1]);
                    }
                }, __asyncDelegator = function(o) {
                    var i, p;
                    return i = {}, verb("next"), verb("throw", (function(e) {
                        throw e;
                    })), verb("return"), i[Symbol.iterator] = function() {
                        return this;
                    }, i;
                    function verb(n, f) {
                        i[n] = o[n] ? function(v) {
                            return (p = !p) ? {
                                value: __await(o[n](v)),
                                done: "return" === n
                            } : f ? f(v) : v;
                        } : f;
                    }
                }, __asyncValues = function(o) {
                    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
                    var i, m = o[Symbol.asyncIterator];
                    return m ? m.call(o) : (o = __values(o), i = {}, verb("next"), verb("throw"), verb("return"), 
                    i[Symbol.asyncIterator] = function() {
                        return this;
                    }, i);
                    function verb(n) {
                        i[n] = o[n] && function(v) {
                            return new Promise((function(resolve, reject) {
                                !(function(resolve, reject, d, v) {
                                    Promise.resolve(v).then((function(v) {
                                        resolve({
                                            value: v,
                                            done: d
                                        });
                                    }), reject);
                                })(resolve, reject, (v = o[n](v)).done, v.value);
                            }));
                        };
                    }
                }, __makeTemplateObject = function(cooked, raw) {
                    return Object.defineProperty ? Object.defineProperty(cooked, "raw", {
                        value: raw
                    }) : cooked.raw = raw, cooked;
                };
                var __setModuleDefault = Object.create ? function(o, v) {
                    Object.defineProperty(o, "default", {
                        enumerable: !0,
                        value: v
                    });
                } : function(o, v) {
                    o.default = v;
                };
                __importStar = function(mod) {
                    if (mod && mod.__esModule) return mod;
                    var result = {};
                    if (null != mod) for (var k in mod) "default" !== k && Object.prototype.hasOwnProperty.call(mod, k) && __createBinding(result, mod, k);
                    return __setModuleDefault(result, mod), result;
                }, __importDefault = function(mod) {
                    return mod && mod.__esModule ? mod : {
                        default: mod
                    };
                }, __classPrivateFieldGet = function(receiver, state, kind, f) {
                    if ("a" === kind && !f) throw new TypeError("Private accessor was defined without a getter");
                    if ("function" == typeof state ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
                    return "m" === kind ? f : "a" === kind ? f.call(receiver) : f ? f.value : state.get(receiver);
                }, __classPrivateFieldSet = function(receiver, state, value, kind, f) {
                    if ("m" === kind) throw new TypeError("Private method is not writable");
                    if ("a" === kind && !f) throw new TypeError("Private accessor was defined without a setter");
                    if ("function" == typeof state ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
                    return "a" === kind ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), 
                    value;
                }, exporter("__extends", __extends), exporter("__assign", __assign), exporter("__rest", __rest), 
                exporter("__decorate", __decorate), exporter("__param", __param), exporter("__metadata", __metadata), 
                exporter("__awaiter", __awaiter), exporter("__generator", __generator), exporter("__exportStar", __exportStar), 
                exporter("__createBinding", __createBinding), exporter("__values", __values), exporter("__read", __read), 
                exporter("__spread", __spread), exporter("__spreadArrays", __spreadArrays), exporter("__spreadArray", __spreadArray), 
                exporter("__await", __await), exporter("__asyncGenerator", __asyncGenerator), exporter("__asyncDelegator", __asyncDelegator), 
                exporter("__asyncValues", __asyncValues), exporter("__makeTemplateObject", __makeTemplateObject), 
                exporter("__importStar", __importStar), exporter("__importDefault", __importDefault), 
                exporter("__classPrivateFieldGet", __classPrivateFieldGet), exporter("__classPrivateFieldSet", __classPrivateFieldSet);
            })(createExporter(root, createExporter(exports)));
        }.apply(exports, [ exports ]), void 0 === __WEBPACK_AMD_DEFINE_RESULT__ || (module.exports = __WEBPACK_AMD_DEFINE_RESULT__);
    })();
}
