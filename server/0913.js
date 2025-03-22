function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(Promise, Context) {
        var unhandledRejectionHandled, possiblyUnhandledRejection, printWarning, getDomain = Promise._getDomain, async = Promise._async, Warning = __webpack_require__(55).Warning, util = __webpack_require__(16), es5 = __webpack_require__(66), canAttachTrace = util.canAttachTrace, bluebirdFramePattern = /[\\\/]bluebird[\\\/]js[\\\/](release|debug|instrumented)/, nodeFramePattern = /\((?:timers\.js):\d+:\d+\)/, parseLinePattern = /[\/<\(](.+?):(\d+):(\d+)\)?\s*$/, stackFramePattern = null, formatStack = null, indentStackFrames = !1, debugging = !(0 == util.env("BLUEBIRD_DEBUG") || !util.env("BLUEBIRD_DEBUG") && "development" !== util.env("NODE_ENV")), warnings = !(0 == util.env("BLUEBIRD_WARNINGS") || !debugging && !util.env("BLUEBIRD_WARNINGS")), longStackTraces = !(0 == util.env("BLUEBIRD_LONG_STACK_TRACES") || !debugging && !util.env("BLUEBIRD_LONG_STACK_TRACES")), wForgottenReturn = 0 != util.env("BLUEBIRD_W_FORGOTTEN_RETURN") && (warnings || !!util.env("BLUEBIRD_W_FORGOTTEN_RETURN"));
        Promise.prototype.suppressUnhandledRejections = function() {
            var target = this._target();
            target._bitField = -1048577 & target._bitField | 524288;
        }, Promise.prototype._ensurePossibleRejectionHandled = function() {
            if (0 == (524288 & this._bitField)) {
                this._setRejectionIsUnhandled();
                var self = this;
                setTimeout((function() {
                    self._notifyUnhandledRejection();
                }), 1);
            }
        }, Promise.prototype._notifyUnhandledRejectionIsHandled = function() {
            fireRejectionEvent("rejectionHandled", unhandledRejectionHandled, void 0, this);
        }, Promise.prototype._setReturnedNonUndefined = function() {
            this._bitField = 268435456 | this._bitField;
        }, Promise.prototype._returnedNonUndefined = function() {
            return 0 != (268435456 & this._bitField);
        }, Promise.prototype._notifyUnhandledRejection = function() {
            if (this._isRejectionUnhandled()) {
                var reason = this._settledValue();
                this._setUnhandledRejectionIsNotified(), fireRejectionEvent("unhandledRejection", possiblyUnhandledRejection, reason, this);
            }
        }, Promise.prototype._setUnhandledRejectionIsNotified = function() {
            this._bitField = 262144 | this._bitField;
        }, Promise.prototype._unsetUnhandledRejectionIsNotified = function() {
            this._bitField = -262145 & this._bitField;
        }, Promise.prototype._isUnhandledRejectionNotified = function() {
            return (262144 & this._bitField) > 0;
        }, Promise.prototype._setRejectionIsUnhandled = function() {
            this._bitField = 1048576 | this._bitField;
        }, Promise.prototype._unsetRejectionIsUnhandled = function() {
            this._bitField = -1048577 & this._bitField, this._isUnhandledRejectionNotified() && (this._unsetUnhandledRejectionIsNotified(), 
            this._notifyUnhandledRejectionIsHandled());
        }, Promise.prototype._isRejectionUnhandled = function() {
            return (1048576 & this._bitField) > 0;
        }, Promise.prototype._warn = function(message, shouldUseOwnTrace, promise) {
            return warn(message, shouldUseOwnTrace, promise || this);
        }, Promise.onPossiblyUnhandledRejection = function(fn) {
            var domain = getDomain();
            possiblyUnhandledRejection = "function" == typeof fn ? null === domain ? fn : util.domainBind(domain, fn) : void 0;
        }, Promise.onUnhandledRejectionHandled = function(fn) {
            var domain = getDomain();
            unhandledRejectionHandled = "function" == typeof fn ? null === domain ? fn : util.domainBind(domain, fn) : void 0;
        };
        var disableLongStackTraces = function() {};
        Promise.longStackTraces = function() {
            if (async.haveItemsQueued() && !config.longStackTraces) throw new Error("cannot enable long stack traces after promises have been created\n\n    See http://goo.gl/MqrFmX\n");
            if (!config.longStackTraces && longStackTracesIsSupported()) {
                var Promise_captureStackTrace = Promise.prototype._captureStackTrace, Promise_attachExtraTrace = Promise.prototype._attachExtraTrace, Promise_dereferenceTrace = Promise.prototype._dereferenceTrace;
                config.longStackTraces = !0, disableLongStackTraces = function() {
                    if (async.haveItemsQueued() && !config.longStackTraces) throw new Error("cannot enable long stack traces after promises have been created\n\n    See http://goo.gl/MqrFmX\n");
                    Promise.prototype._captureStackTrace = Promise_captureStackTrace, Promise.prototype._attachExtraTrace = Promise_attachExtraTrace, 
                    Promise.prototype._dereferenceTrace = Promise_dereferenceTrace, Context.deactivateLongStackTraces(), 
                    async.enableTrampoline(), config.longStackTraces = !1;
                }, Promise.prototype._captureStackTrace = longStackTracesCaptureStackTrace, Promise.prototype._attachExtraTrace = longStackTracesAttachExtraTrace, 
                Promise.prototype._dereferenceTrace = longStackTracesDereferenceTrace, Context.activateLongStackTraces(), 
                async.disableTrampolineIfNecessary();
            }
        }, Promise.hasLongStackTraces = function() {
            return config.longStackTraces && longStackTracesIsSupported();
        };
        var fireDomEvent = (function() {
            try {
                if ("function" == typeof CustomEvent) {
                    var event = new CustomEvent("CustomEvent");
                    return util.global.dispatchEvent(event), function(name, event) {
                        var eventData = {
                            detail: event,
                            cancelable: !0
                        };
                        es5.defineProperty(eventData, "promise", {
                            value: event.promise
                        }), es5.defineProperty(eventData, "reason", {
                            value: event.reason
                        });
                        var domEvent = new CustomEvent(name.toLowerCase(), eventData);
                        return !util.global.dispatchEvent(domEvent);
                    };
                }
                return "function" == typeof Event ? (event = new Event("CustomEvent"), util.global.dispatchEvent(event), 
                function(name, event) {
                    var domEvent = new Event(name.toLowerCase(), {
                        cancelable: !0
                    });
                    return domEvent.detail = event, es5.defineProperty(domEvent, "promise", {
                        value: event.promise
                    }), es5.defineProperty(domEvent, "reason", {
                        value: event.reason
                    }), !util.global.dispatchEvent(domEvent);
                }) : ((event = document.createEvent("CustomEvent")).initCustomEvent("testingtheevent", !1, !0, {}), 
                util.global.dispatchEvent(event), function(name, event) {
                    var domEvent = document.createEvent("CustomEvent");
                    return domEvent.initCustomEvent(name.toLowerCase(), !1, !0, event), !util.global.dispatchEvent(domEvent);
                });
            } catch (e) {}
            return function() {
                return !1;
            };
        })(), fireGlobalEvent = util.isNode ? function() {
            return process.emit.apply(process, arguments);
        } : util.global ? function(name) {
            var methodName = "on" + name.toLowerCase(), method = util.global[methodName];
            return !!method && (method.apply(util.global, [].slice.call(arguments, 1)), !0);
        } : function() {
            return !1;
        };
        function generatePromiseLifecycleEventObject(name, promise) {
            return {
                promise: promise
            };
        }
        var eventToObjectGenerator = {
            promiseCreated: generatePromiseLifecycleEventObject,
            promiseFulfilled: generatePromiseLifecycleEventObject,
            promiseRejected: generatePromiseLifecycleEventObject,
            promiseResolved: generatePromiseLifecycleEventObject,
            promiseCancelled: generatePromiseLifecycleEventObject,
            promiseChained: function(name, promise, child) {
                return {
                    promise: promise,
                    child: child
                };
            },
            warning: function(name, warning) {
                return {
                    warning: warning
                };
            },
            unhandledRejection: function(name, reason, promise) {
                return {
                    reason: reason,
                    promise: promise
                };
            },
            rejectionHandled: generatePromiseLifecycleEventObject
        }, activeFireEvent = function(name) {
            var globalEventFired = !1;
            try {
                globalEventFired = fireGlobalEvent.apply(null, arguments);
            } catch (e) {
                async.throwLater(e), globalEventFired = !0;
            }
            var domEventFired = !1;
            try {
                domEventFired = fireDomEvent(name, eventToObjectGenerator[name].apply(null, arguments));
            } catch (e) {
                async.throwLater(e), domEventFired = !0;
            }
            return domEventFired || globalEventFired;
        };
        function defaultFireEvent() {
            return !1;
        }
        function cancellationExecute(executor, resolve, reject) {
            var promise = this;
            try {
                executor(resolve, reject, (function(onCancel) {
                    if ("function" != typeof onCancel) throw new TypeError("onCancel must be a function, got: " + util.toString(onCancel));
                    promise._attachCancellationCallback(onCancel);
                }));
            } catch (e) {
                return e;
            }
        }
        function cancellationAttachCancellationCallback(onCancel) {
            if (!this._isCancellable()) return this;
            var previousOnCancel = this._onCancel();
            void 0 !== previousOnCancel ? util.isArray(previousOnCancel) ? previousOnCancel.push(onCancel) : this._setOnCancel([ previousOnCancel, onCancel ]) : this._setOnCancel(onCancel);
        }
        function cancellationOnCancel() {
            return this._onCancelField;
        }
        function cancellationSetOnCancel(onCancel) {
            this._onCancelField = onCancel;
        }
        function cancellationClearCancellationData() {
            this._cancellationParent = void 0, this._onCancelField = void 0;
        }
        function cancellationPropagateFrom(parent, flags) {
            if (0 != (1 & flags)) {
                this._cancellationParent = parent;
                var branchesRemainingToCancel = parent._branchesRemainingToCancel;
                void 0 === branchesRemainingToCancel && (branchesRemainingToCancel = 0), parent._branchesRemainingToCancel = branchesRemainingToCancel + 1;
            }
            0 != (2 & flags) && parent._isBound() && this._setBoundTo(parent._boundTo);
        }
        Promise.config = function(opts) {
            if ("longStackTraces" in (opts = Object(opts)) && (opts.longStackTraces ? Promise.longStackTraces() : !opts.longStackTraces && Promise.hasLongStackTraces() && disableLongStackTraces()), 
            "warnings" in opts) {
                var warningsOption = opts.warnings;
                config.warnings = !!warningsOption, wForgottenReturn = config.warnings, util.isObject(warningsOption) && "wForgottenReturn" in warningsOption && (wForgottenReturn = !!warningsOption.wForgottenReturn);
            }
            if ("cancellation" in opts && opts.cancellation && !config.cancellation) {
                if (async.haveItemsQueued()) throw new Error("cannot enable cancellation after promises are in use");
                Promise.prototype._clearCancellationData = cancellationClearCancellationData, Promise.prototype._propagateFrom = cancellationPropagateFrom, 
                Promise.prototype._onCancel = cancellationOnCancel, Promise.prototype._setOnCancel = cancellationSetOnCancel, 
                Promise.prototype._attachCancellationCallback = cancellationAttachCancellationCallback, 
                Promise.prototype._execute = cancellationExecute, propagateFromFunction = cancellationPropagateFrom, 
                config.cancellation = !0;
            }
            return "monitoring" in opts && (opts.monitoring && !config.monitoring ? (config.monitoring = !0, 
            Promise.prototype._fireEvent = activeFireEvent) : !opts.monitoring && config.monitoring && (config.monitoring = !1, 
            Promise.prototype._fireEvent = defaultFireEvent)), Promise;
        }, Promise.prototype._fireEvent = defaultFireEvent, Promise.prototype._execute = function(executor, resolve, reject) {
            try {
                executor(resolve, reject);
            } catch (e) {
                return e;
            }
        }, Promise.prototype._onCancel = function() {}, Promise.prototype._setOnCancel = function(handler) {}, 
        Promise.prototype._attachCancellationCallback = function(onCancel) {}, Promise.prototype._captureStackTrace = function() {}, 
        Promise.prototype._attachExtraTrace = function() {}, Promise.prototype._dereferenceTrace = function() {}, 
        Promise.prototype._clearCancellationData = function() {}, Promise.prototype._propagateFrom = function(parent, flags) {};
        var propagateFromFunction = function(parent, flags) {
            0 != (2 & flags) && parent._isBound() && this._setBoundTo(parent._boundTo);
        };
        function boundValueFunction() {
            var ret = this._boundTo;
            return void 0 !== ret && ret instanceof Promise ? ret.isFulfilled() ? ret.value() : void 0 : ret;
        }
        function longStackTracesCaptureStackTrace() {
            this._trace = new CapturedTrace(this._peekContext());
        }
        function longStackTracesAttachExtraTrace(error, ignoreSelf) {
            if (canAttachTrace(error)) {
                var trace = this._trace;
                if (void 0 !== trace && ignoreSelf && (trace = trace._parent), void 0 !== trace) trace.attachExtraTrace(error); else if (!error.__stackCleaned__) {
                    var parsed = parseStackAndMessage(error);
                    util.notEnumerableProp(error, "stack", parsed.message + "\n" + parsed.stack.join("\n")), 
                    util.notEnumerableProp(error, "__stackCleaned__", !0);
                }
            }
        }
        function longStackTracesDereferenceTrace() {
            this._trace = void 0;
        }
        function warn(message, shouldUseOwnTrace, promise) {
            if (config.warnings) {
                var ctx, warning = new Warning(message);
                if (shouldUseOwnTrace) promise._attachExtraTrace(warning); else if (config.longStackTraces && (ctx = Promise._peekContext())) ctx.attachExtraTrace(warning); else {
                    var parsed = parseStackAndMessage(warning);
                    warning.stack = parsed.message + "\n" + parsed.stack.join("\n");
                }
                activeFireEvent("warning", warning) || formatAndLogError(warning, "", !0);
            }
        }
        function cleanStack(stack) {
            for (var ret = [], i = 0; i < stack.length; ++i) {
                var line = stack[i], isTraceLine = "    (No stack trace)" === line || stackFramePattern.test(line), isInternalFrame = isTraceLine && shouldIgnore(line);
                isTraceLine && !isInternalFrame && (indentStackFrames && " " !== line.charAt(0) && (line = "    " + line), 
                ret.push(line));
            }
            return ret;
        }
        function parseStackAndMessage(error) {
            var stack = error.stack, message = error.toString();
            return stack = "string" == typeof stack && stack.length > 0 ? (function(error) {
                for (var stack = error.stack.replace(/\s+$/g, "").split("\n"), i = 0; i < stack.length; ++i) {
                    var line = stack[i];
                    if ("    (No stack trace)" === line || stackFramePattern.test(line)) break;
                }
                return i > 0 && "SyntaxError" != error.name && (stack = stack.slice(i)), stack;
            })(error) : [ "    (No stack trace)" ], {
                message: message,
                stack: "SyntaxError" == error.name ? stack : cleanStack(stack)
            };
        }
        function formatAndLogError(error, title, isSoft) {
            if ("undefined" != typeof console) {
                var message;
                if (util.isObject(error)) {
                    var stack = error.stack;
                    message = title + formatStack(stack, error);
                } else message = title + String(error);
                "function" == typeof printWarning ? printWarning(message, isSoft) : "function" != typeof console.log && "object" != typeof console.log || console.log(message);
            }
        }
        function fireRejectionEvent(name, localHandler, reason, promise) {
            var localEventFired = !1;
            try {
                "function" == typeof localHandler && (localEventFired = !0, "rejectionHandled" === name ? localHandler(promise) : localHandler(reason, promise));
            } catch (e) {
                async.throwLater(e);
            }
            "unhandledRejection" === name ? activeFireEvent(name, reason, promise) || localEventFired || formatAndLogError(reason, "Unhandled rejection ") : activeFireEvent(name, promise);
        }
        function formatNonError(obj) {
            var str;
            if ("function" == typeof obj) str = "[function " + (obj.name || "anonymous") + "]"; else {
                if (str = obj && "function" == typeof obj.toString ? obj.toString() : util.toString(obj), 
                /\[object [a-zA-Z0-9$_]+\]/.test(str)) try {
                    str = JSON.stringify(obj);
                } catch (e) {}
                0 === str.length && (str = "(empty array)");
            }
            return "(<" + (function(str) {
                return str.length < 41 ? str : str.substr(0, 38) + "...";
            })(str) + ">, no stack trace)";
        }
        function longStackTracesIsSupported() {
            return "function" == typeof captureStackTrace;
        }
        var shouldIgnore = function() {
            return !1;
        }, parseLineInfoRegex = /[\/<\(]([^:\/]+):(\d+):(?:\d+)\)?\s*$/;
        function parseLineInfo(line) {
            var matches = line.match(parseLineInfoRegex);
            if (matches) return {
                fileName: matches[1],
                line: parseInt(matches[2], 10)
            };
        }
        function CapturedTrace(parent) {
            this._parent = parent, this._promisesCreated = 0;
            var length = this._length = 1 + (void 0 === parent ? 0 : parent._length);
            captureStackTrace(this, CapturedTrace), length > 32 && this.uncycle();
        }
        util.inherits(CapturedTrace, Error), Context.CapturedTrace = CapturedTrace, CapturedTrace.prototype.uncycle = function() {
            var length = this._length;
            if (!(length < 2)) {
                for (var nodes = [], stackToIndex = {}, i = 0, node = this; void 0 !== node; ++i) nodes.push(node), 
                node = node._parent;
                for (i = (length = this._length = i) - 1; i >= 0; --i) {
                    var stack = nodes[i].stack;
                    void 0 === stackToIndex[stack] && (stackToIndex[stack] = i);
                }
                for (i = 0; i < length; ++i) {
                    var index = stackToIndex[nodes[i].stack];
                    if (void 0 !== index && index !== i) {
                        index > 0 && (nodes[index - 1]._parent = void 0, nodes[index - 1]._length = 1), 
                        nodes[i]._parent = void 0, nodes[i]._length = 1;
                        var cycleEdgeNode = i > 0 ? nodes[i - 1] : this;
                        index < length - 1 ? (cycleEdgeNode._parent = nodes[index + 1], cycleEdgeNode._parent.uncycle(), 
                        cycleEdgeNode._length = cycleEdgeNode._parent._length + 1) : (cycleEdgeNode._parent = void 0, 
                        cycleEdgeNode._length = 1);
                        for (var currentChildLength = cycleEdgeNode._length + 1, j = i - 2; j >= 0; --j) nodes[j]._length = currentChildLength, 
                        currentChildLength++;
                        return;
                    }
                }
            }
        }, CapturedTrace.prototype.attachExtraTrace = function(error) {
            if (!error.__stackCleaned__) {
                this.uncycle();
                for (var parsed = parseStackAndMessage(error), message = parsed.message, stacks = [ parsed.stack ], trace = this; void 0 !== trace; ) stacks.push(cleanStack(trace.stack.split("\n"))), 
                trace = trace._parent;
                !(function(stacks) {
                    for (var current = stacks[0], i = 1; i < stacks.length; ++i) {
                        for (var prev = stacks[i], currentLastIndex = current.length - 1, currentLastLine = current[currentLastIndex], commonRootMeetPoint = -1, j = prev.length - 1; j >= 0; --j) if (prev[j] === currentLastLine) {
                            commonRootMeetPoint = j;
                            break;
                        }
                        for (j = commonRootMeetPoint; j >= 0; --j) {
                            var line = prev[j];
                            if (current[currentLastIndex] !== line) break;
                            current.pop(), currentLastIndex--;
                        }
                        current = prev;
                    }
                })(stacks), (function(stacks) {
                    for (var i = 0; i < stacks.length; ++i) (0 === stacks[i].length || i + 1 < stacks.length && stacks[i][0] === stacks[i + 1][0]) && (stacks.splice(i, 1), 
                    i--);
                })(stacks), util.notEnumerableProp(error, "stack", (function(message, stacks) {
                    for (var i = 0; i < stacks.length - 1; ++i) stacks[i].push("From previous event:"), 
                    stacks[i] = stacks[i].join("\n");
                    return i < stacks.length && (stacks[i] = stacks[i].join("\n")), message + "\n" + stacks.join("\n");
                })(message, stacks)), util.notEnumerableProp(error, "__stackCleaned__", !0);
            }
        };
        var captureStackTrace = (function() {
            var v8stackFramePattern = /^\s*at\s*/, v8stackFormatter = function(stack, error) {
                return "string" == typeof stack ? stack : void 0 !== error.name && void 0 !== error.message ? error.toString() : formatNonError(error);
            };
            if ("number" == typeof Error.stackTraceLimit && "function" == typeof Error.captureStackTrace) {
                Error.stackTraceLimit += 6, stackFramePattern = v8stackFramePattern, formatStack = v8stackFormatter;
                var captureStackTrace = Error.captureStackTrace;
                return shouldIgnore = function(line) {
                    return bluebirdFramePattern.test(line);
                }, function(receiver, ignoreUntil) {
                    Error.stackTraceLimit += 6, captureStackTrace(receiver, ignoreUntil), Error.stackTraceLimit -= 6;
                };
            }
            var hasStackAfterThrow, err = new Error;
            if ("string" == typeof err.stack && err.stack.split("\n")[0].indexOf("stackDetection@") >= 0) return stackFramePattern = /@/, 
            formatStack = v8stackFormatter, indentStackFrames = !0, function(o) {
                o.stack = (new Error).stack;
            };
            try {
                throw new Error;
            } catch (e) {
                hasStackAfterThrow = "stack" in e;
            }
            return !("stack" in err) && hasStackAfterThrow && "number" == typeof Error.stackTraceLimit ? (stackFramePattern = v8stackFramePattern, 
            formatStack = v8stackFormatter, function(o) {
                Error.stackTraceLimit += 6;
                try {
                    throw new Error;
                } catch (e) {
                    o.stack = e.stack;
                }
                Error.stackTraceLimit -= 6;
            }) : (formatStack = function(stack, error) {
                return "string" == typeof stack ? stack : "object" != typeof error && "function" != typeof error || void 0 === error.name || void 0 === error.message ? formatNonError(error) : error.toString();
            }, null);
        })();
        "undefined" != typeof console && void 0 !== console.warn && (printWarning = function(message) {
            console.warn(message);
        }, util.isNode && process.stderr.isTTY ? printWarning = function(message, isSoft) {
            var color = isSoft ? "[33m" : "[31m";
            console.warn(color + message + "[0m\n");
        } : util.isNode || "string" != typeof (new Error).stack || (printWarning = function(message, isSoft) {
            console.warn("%c" + message, isSoft ? "color: darkorange" : "color: red");
        }));
        var config = {
            warnings: warnings,
            longStackTraces: !1,
            cancellation: !1,
            monitoring: !1
        };
        return longStackTraces && Promise.longStackTraces(), {
            longStackTraces: function() {
                return config.longStackTraces;
            },
            warnings: function() {
                return config.warnings;
            },
            cancellation: function() {
                return config.cancellation;
            },
            monitoring: function() {
                return config.monitoring;
            },
            propagateFromFunction: function() {
                return propagateFromFunction;
            },
            boundValueFunction: function() {
                return boundValueFunction;
            },
            checkForgottenReturns: function(returnValue, promiseCreated, name, promise, parent) {
                if (void 0 === returnValue && null !== promiseCreated && wForgottenReturn) {
                    if (void 0 !== parent && parent._returnedNonUndefined()) return;
                    if (0 == (65535 & promise._bitField)) return;
                    name && (name += " ");
                    var handlerLine = "", creatorLine = "";
                    if (promiseCreated._trace) {
                        for (var traceLines = promiseCreated._trace.stack.split("\n"), stack = cleanStack(traceLines), i = stack.length - 1; i >= 0; --i) {
                            var line = stack[i];
                            if (!nodeFramePattern.test(line)) {
                                var lineMatches = line.match(parseLinePattern);
                                lineMatches && (handlerLine = "at " + lineMatches[1] + ":" + lineMatches[2] + ":" + lineMatches[3] + " ");
                                break;
                            }
                        }
                        if (stack.length > 0) {
                            var firstUserLine = stack[0];
                            for (i = 0; i < traceLines.length; ++i) if (traceLines[i] === firstUserLine) {
                                i > 0 && (creatorLine = "\n" + traceLines[i - 1]);
                                break;
                            }
                        }
                    }
                    var msg = "a promise was created in a " + name + "handler " + handlerLine + "but was not returned from it, see http://goo.gl/rRqMUw" + creatorLine;
                    promise._warn(msg, !0, promiseCreated);
                }
            },
            setBounds: function(firstLineError, lastLineError) {
                if (longStackTracesIsSupported()) {
                    for (var firstFileName, lastFileName, firstStackLines = (firstLineError.stack || "").split("\n"), lastStackLines = (lastLineError.stack || "").split("\n"), firstIndex = -1, lastIndex = -1, i = 0; i < firstStackLines.length; ++i) if (result = parseLineInfo(firstStackLines[i])) {
                        firstFileName = result.fileName, firstIndex = result.line;
                        break;
                    }
                    for (i = 0; i < lastStackLines.length; ++i) {
                        var result;
                        if (result = parseLineInfo(lastStackLines[i])) {
                            lastFileName = result.fileName, lastIndex = result.line;
                            break;
                        }
                    }
                    firstIndex < 0 || lastIndex < 0 || !firstFileName || !lastFileName || firstFileName !== lastFileName || firstIndex >= lastIndex || (shouldIgnore = function(line) {
                        if (bluebirdFramePattern.test(line)) return !0;
                        var info = parseLineInfo(line);
                        return !!(info && info.fileName === firstFileName && firstIndex <= info.line && info.line <= lastIndex);
                    });
                }
            },
            warn: warn,
            deprecated: function(name, replacement) {
                var message = name + " is deprecated and will be removed in a future version.";
                return replacement && (message += " Use " + replacement + " instead."), warn(message);
            },
            CapturedTrace: CapturedTrace,
            fireDomEvent: fireDomEvent,
            fireGlobalEvent: fireGlobalEvent
        };
    };
}
