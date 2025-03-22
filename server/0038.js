function(module, exports, __webpack_require__) {
    var __WEBPACK_AMD_DEFINE_RESULT__;
    !(function() {
        var previous_async, async = {};
        function noop() {}
        function identity(v) {
            return v;
        }
        function toBool(v) {
            return !!v;
        }
        function notId(v) {
            return !v;
        }
        var root = "object" == typeof self && self.self === self && self || "object" == typeof global && global.global === global && global || this;
        function only_once(fn) {
            return function() {
                if (null === fn) throw new Error("Callback was already called.");
                fn.apply(this, arguments), fn = null;
            };
        }
        function _once(fn) {
            return function() {
                null !== fn && (fn.apply(this, arguments), fn = null);
            };
        }
        null != root && (previous_async = root.async), async.noConflict = function() {
            return root.async = previous_async, async;
        };
        var _toString = Object.prototype.toString, _isArray = Array.isArray || function(obj) {
            return "[object Array]" === _toString.call(obj);
        };
        function _isArrayLike(arr) {
            return _isArray(arr) || "number" == typeof arr.length && arr.length >= 0 && arr.length % 1 == 0;
        }
        function _arrayEach(arr, iterator) {
            for (var index = -1, length = arr.length; ++index < length; ) iterator(arr[index], index, arr);
        }
        function _map(arr, iterator) {
            for (var index = -1, length = arr.length, result = Array(length); ++index < length; ) result[index] = iterator(arr[index], index, arr);
            return result;
        }
        function _range(count) {
            return _map(Array(count), (function(v, i) {
                return i;
            }));
        }
        function _reduce(arr, iterator, memo) {
            return _arrayEach(arr, (function(x, i, a) {
                memo = iterator(memo, x, i, a);
            })), memo;
        }
        function _forEachOf(object, iterator) {
            _arrayEach(_keys(object), (function(key) {
                iterator(object[key], key);
            }));
        }
        function _indexOf(arr, item) {
            for (var i = 0; i < arr.length; i++) if (arr[i] === item) return i;
            return -1;
        }
        var _keys = Object.keys || function(obj) {
            var keys = [];
            for (var k in obj) obj.hasOwnProperty(k) && keys.push(k);
            return keys;
        };
        function _keyIterator(coll) {
            var len, keys, i = -1;
            return _isArrayLike(coll) ? (len = coll.length, function() {
                return ++i < len ? i : null;
            }) : (keys = _keys(coll), len = keys.length, function() {
                return ++i < len ? keys[i] : null;
            });
        }
        function _restParam(func, startIndex) {
            return startIndex = null == startIndex ? func.length - 1 : +startIndex, function() {
                for (var length = Math.max(arguments.length - startIndex, 0), rest = Array(length), index = 0; index < length; index++) rest[index] = arguments[index + startIndex];
                switch (startIndex) {
                  case 0:
                    return func.call(this, rest);

                  case 1:
                    return func.call(this, arguments[0], rest);
                }
            };
        }
        function _withoutIndex(iterator) {
            return function(value, index, callback) {
                return iterator(value, callback);
            };
        }
        var _setImmediate = "function" == typeof setImmediate && setImmediate, _delay = _setImmediate ? function(fn) {
            _setImmediate(fn);
        } : function(fn) {
            setTimeout(fn, 0);
        };
        function _eachOfLimit(limit) {
            return function(obj, iterator, callback) {
                callback = _once(callback || noop);
                var nextKey = _keyIterator(obj = obj || []);
                if (limit <= 0) return callback(null);
                var done = !1, running = 0, errored = !1;
                !(function replenish() {
                    if (done && running <= 0) return callback(null);
                    for (;running < limit && !errored; ) {
                        var key = nextKey();
                        if (null === key) return done = !0, void (running <= 0 && callback(null));
                        running += 1, iterator(obj[key], key, only_once((function(err) {
                            running -= 1, err ? (callback(err), errored = !0) : replenish();
                        })));
                    }
                })();
            };
        }
        function doParallel(fn) {
            return function(obj, iterator, callback) {
                return fn(async.eachOf, obj, iterator, callback);
            };
        }
        function doParallelLimit(fn) {
            return function(obj, limit, iterator, callback) {
                return fn(_eachOfLimit(limit), obj, iterator, callback);
            };
        }
        function doSeries(fn) {
            return function(obj, iterator, callback) {
                return fn(async.eachOfSeries, obj, iterator, callback);
            };
        }
        function _asyncMap(eachfn, arr, iterator, callback) {
            callback = _once(callback || noop);
            var results = _isArrayLike(arr = arr || []) ? [] : {};
            eachfn(arr, (function(value, index, callback) {
                iterator(value, (function(err, v) {
                    results[index] = v, callback(err);
                }));
            }), (function(err) {
                callback(err, results);
            }));
        }
        function _filter(eachfn, arr, iterator, callback) {
            var results = [];
            eachfn(arr, (function(x, index, callback) {
                iterator(x, (function(v) {
                    v && results.push({
                        index: index,
                        value: x
                    }), callback();
                }));
            }), (function() {
                callback(_map(results.sort((function(a, b) {
                    return a.index - b.index;
                })), (function(x) {
                    return x.value;
                })));
            }));
        }
        function _reject(eachfn, arr, iterator, callback) {
            _filter(eachfn, arr, (function(value, cb) {
                iterator(value, (function(v) {
                    cb(!v);
                }));
            }), callback);
        }
        function _createTester(eachfn, check, getResult) {
            return function(arr, limit, iterator, cb) {
                function done() {
                    cb && cb(getResult(!1, void 0));
                }
                function iteratee(x, _, callback) {
                    if (!cb) return callback();
                    iterator(x, (function(v) {
                        cb && check(v) && (cb(getResult(!0, x)), cb = iterator = !1), callback();
                    }));
                }
                arguments.length > 3 ? eachfn(arr, limit, iteratee, done) : (cb = iterator, iterator = limit, 
                eachfn(arr, iteratee, done));
            };
        }
        function _findGetResult(v, x) {
            return x;
        }
        function _parallel(eachfn, tasks, callback) {
            callback = callback || noop;
            var results = _isArrayLike(tasks) ? [] : {};
            eachfn(tasks, (function(task, key, callback) {
                task(_restParam((function(err, args) {
                    args.length <= 1 && (args = args[0]), results[key] = args, callback(err);
                })));
            }), (function(err) {
                callback(err, results);
            }));
        }
        function _concat(eachfn, arr, fn, callback) {
            var result = [];
            eachfn(arr, (function(x, index, cb) {
                fn(x, (function(err, y) {
                    result = result.concat(y || []), cb(err);
                }));
            }), (function(err) {
                callback(err, result);
            }));
        }
        function _queue(worker, concurrency, payload) {
            if (null == concurrency) concurrency = 1; else if (0 === concurrency) throw new Error("Concurrency must not be zero");
            function _insert(q, data, pos, callback) {
                if (null != callback && "function" != typeof callback) throw new Error("task callback must be a function");
                if (q.started = !0, _isArray(data) || (data = [ data ]), 0 === data.length && q.idle()) return async.setImmediate((function() {
                    q.drain();
                }));
                _arrayEach(data, (function(task) {
                    var item = {
                        data: task,
                        callback: callback || noop
                    };
                    pos ? q.tasks.unshift(item) : q.tasks.push(item), q.tasks.length === q.concurrency && q.saturated();
                })), async.setImmediate(q.process);
            }
            function _next(q, tasks) {
                return function() {
                    workers -= 1;
                    var removed = !1, args = arguments;
                    _arrayEach(tasks, (function(task) {
                        _arrayEach(workersList, (function(worker, index) {
                            worker !== task || removed || (workersList.splice(index, 1), removed = !0);
                        })), task.callback.apply(task, args);
                    })), q.tasks.length + workers === 0 && q.drain(), q.process();
                };
            }
            var workers = 0, workersList = [], q = {
                tasks: [],
                concurrency: concurrency,
                payload: payload,
                saturated: noop,
                empty: noop,
                drain: noop,
                started: !1,
                paused: !1,
                push: function(data, callback) {
                    _insert(q, data, !1, callback);
                },
                kill: function() {
                    q.drain = noop, q.tasks = [];
                },
                unshift: function(data, callback) {
                    _insert(q, data, !0, callback);
                },
                process: function() {
                    for (;!q.paused && workers < q.concurrency && q.tasks.length; ) {
                        var tasks = q.payload ? q.tasks.splice(0, q.payload) : q.tasks.splice(0, q.tasks.length), data = _map(tasks, (function(task) {
                            return task.data;
                        }));
                        0 === q.tasks.length && q.empty(), workers += 1, workersList.push(tasks[0]);
                        var cb = only_once(_next(q, tasks));
                        worker(data, cb);
                    }
                },
                length: function() {
                    return q.tasks.length;
                },
                running: function() {
                    return workers;
                },
                workersList: function() {
                    return workersList;
                },
                idle: function() {
                    return q.tasks.length + workers === 0;
                },
                pause: function() {
                    q.paused = !0;
                },
                resume: function() {
                    if (!1 !== q.paused) {
                        q.paused = !1;
                        for (var resumeCount = Math.min(q.concurrency, q.tasks.length), w = 1; w <= resumeCount; w++) async.setImmediate(q.process);
                    }
                }
            };
            return q;
        }
        function _console_fn(name) {
            return _restParam((function(fn, args) {
                fn.apply(null, args.concat([ _restParam((function(err, args) {
                    "object" == typeof console && (err ? console.error && console.error(err) : console[name] && _arrayEach(args, (function(x) {
                        console[name](x);
                    })));
                })) ]));
            }));
        }
        function _times(mapper) {
            return function(count, iterator, callback) {
                mapper(_range(count), iterator, callback);
            };
        }
        function _applyEach(eachfn) {
            return _restParam((function(fns, args) {
                var go = _restParam((function(args) {
                    var that = this, callback = args.pop();
                    return eachfn(fns, (function(fn, _, cb) {
                        fn.apply(that, args.concat([ cb ]));
                    }), callback);
                }));
                return args.length ? go.apply(this, args) : go;
            }));
        }
        function ensureAsync(fn) {
            return _restParam((function(args) {
                var callback = args.pop();
                args.push((function() {
                    var innerArgs = arguments;
                    sync ? async.setImmediate((function() {
                        callback.apply(null, innerArgs);
                    })) : callback.apply(null, innerArgs);
                }));
                var sync = !0;
                fn.apply(this, args), sync = !1;
            }));
        }
        "object" == typeof process && "function" == typeof process.nextTick ? async.nextTick = process.nextTick : async.nextTick = _delay, 
        async.setImmediate = _setImmediate ? _delay : async.nextTick, async.forEach = async.each = function(arr, iterator, callback) {
            return async.eachOf(arr, _withoutIndex(iterator), callback);
        }, async.forEachSeries = async.eachSeries = function(arr, iterator, callback) {
            return async.eachOfSeries(arr, _withoutIndex(iterator), callback);
        }, async.forEachLimit = async.eachLimit = function(arr, limit, iterator, callback) {
            return _eachOfLimit(limit)(arr, _withoutIndex(iterator), callback);
        }, async.forEachOf = async.eachOf = function(object, iterator, callback) {
            callback = _once(callback || noop);
            for (var key, iter = _keyIterator(object = object || []), completed = 0; null != (key = iter()); ) completed += 1, 
            iterator(object[key], key, only_once(done));
            function done(err) {
                completed--, err ? callback(err) : null === key && completed <= 0 && callback(null);
            }
            0 === completed && callback(null);
        }, async.forEachOfSeries = async.eachOfSeries = function(obj, iterator, callback) {
            callback = _once(callback || noop);
            var nextKey = _keyIterator(obj = obj || []), key = nextKey();
            !(function iterate() {
                var sync = !0;
                if (null === key) return callback(null);
                iterator(obj[key], key, only_once((function(err) {
                    if (err) callback(err); else {
                        if (null === (key = nextKey())) return callback(null);
                        sync ? async.setImmediate(iterate) : iterate();
                    }
                }))), sync = !1;
            })();
        }, async.forEachOfLimit = async.eachOfLimit = function(obj, limit, iterator, callback) {
            _eachOfLimit(limit)(obj, iterator, callback);
        }, async.map = doParallel(_asyncMap), async.mapSeries = doSeries(_asyncMap), async.mapLimit = doParallelLimit(_asyncMap), 
        async.inject = async.foldl = async.reduce = function(arr, memo, iterator, callback) {
            async.eachOfSeries(arr, (function(x, i, callback) {
                iterator(memo, x, (function(err, v) {
                    memo = v, callback(err);
                }));
            }), (function(err) {
                callback(err, memo);
            }));
        }, async.foldr = async.reduceRight = function(arr, memo, iterator, callback) {
            var reversed = _map(arr, identity).reverse();
            async.reduce(reversed, memo, iterator, callback);
        }, async.transform = function(arr, memo, iterator, callback) {
            3 === arguments.length && (callback = iterator, iterator = memo, memo = _isArray(arr) ? [] : {}), 
            async.eachOf(arr, (function(v, k, cb) {
                iterator(memo, v, k, cb);
            }), (function(err) {
                callback(err, memo);
            }));
        }, async.select = async.filter = doParallel(_filter), async.selectLimit = async.filterLimit = doParallelLimit(_filter), 
        async.selectSeries = async.filterSeries = doSeries(_filter), async.reject = doParallel(_reject), 
        async.rejectLimit = doParallelLimit(_reject), async.rejectSeries = doSeries(_reject), 
        async.any = async.some = _createTester(async.eachOf, toBool, identity), async.someLimit = _createTester(async.eachOfLimit, toBool, identity), 
        async.all = async.every = _createTester(async.eachOf, notId, notId), async.everyLimit = _createTester(async.eachOfLimit, notId, notId), 
        async.detect = _createTester(async.eachOf, identity, _findGetResult), async.detectSeries = _createTester(async.eachOfSeries, identity, _findGetResult), 
        async.detectLimit = _createTester(async.eachOfLimit, identity, _findGetResult), 
        async.sortBy = function(arr, iterator, callback) {
            function comparator(left, right) {
                var a = left.criteria, b = right.criteria;
                return a < b ? -1 : a > b ? 1 : 0;
            }
            async.map(arr, (function(x, callback) {
                iterator(x, (function(err, criteria) {
                    err ? callback(err) : callback(null, {
                        value: x,
                        criteria: criteria
                    });
                }));
            }), (function(err, results) {
                if (err) return callback(err);
                callback(null, _map(results.sort(comparator), (function(x) {
                    return x.value;
                })));
            }));
        }, async.auto = function(tasks, concurrency, callback) {
            "function" == typeof arguments[1] && (callback = concurrency, concurrency = null), 
            callback = _once(callback || noop);
            var keys = _keys(tasks), remainingTasks = keys.length;
            if (!remainingTasks) return callback(null);
            concurrency || (concurrency = remainingTasks);
            var results = {}, runningTasks = 0, hasError = !1, listeners = [];
            function addListener(fn) {
                listeners.unshift(fn);
            }
            function removeListener(fn) {
                var idx = _indexOf(listeners, fn);
                idx >= 0 && listeners.splice(idx, 1);
            }
            function taskComplete() {
                remainingTasks--, _arrayEach(listeners.slice(0), (function(fn) {
                    fn();
                }));
            }
            addListener((function() {
                remainingTasks || callback(null, results);
            })), _arrayEach(keys, (function(k) {
                if (!hasError) {
                    for (var dep, task = _isArray(tasks[k]) ? tasks[k] : [ tasks[k] ], taskCallback = _restParam((function(err, args) {
                        if (runningTasks--, args.length <= 1 && (args = args[0]), err) {
                            var safeResults = {};
                            _forEachOf(results, (function(val, rkey) {
                                safeResults[rkey] = val;
                            })), safeResults[k] = args, hasError = !0, callback(err, safeResults);
                        } else results[k] = args, async.setImmediate(taskComplete);
                    })), requires = task.slice(0, task.length - 1), len = requires.length; len--; ) {
                        if (!(dep = tasks[requires[len]])) throw new Error("Has nonexistent dependency in " + requires.join(", "));
                        if (_isArray(dep) && _indexOf(dep, k) >= 0) throw new Error("Has cyclic dependencies");
                    }
                    ready() ? (runningTasks++, task[task.length - 1](taskCallback, results)) : addListener((function listener() {
                        ready() && (runningTasks++, removeListener(listener), task[task.length - 1](taskCallback, results));
                    }));
                }
                function ready() {
                    return runningTasks < concurrency && _reduce(requires, (function(a, x) {
                        return a && results.hasOwnProperty(x);
                    }), !0) && !results.hasOwnProperty(k);
                }
            }));
        }, async.retry = function(times, task, callback) {
            var DEFAULT_TIMES = 5, DEFAULT_INTERVAL = 0, attempts = [], opts = {
                times: DEFAULT_TIMES,
                interval: DEFAULT_INTERVAL
            };
            function parseTimes(acc, t) {
                if ("number" == typeof t) acc.times = parseInt(t, 10) || DEFAULT_TIMES; else {
                    if ("object" != typeof t) throw new Error("Unsupported argument type for 'times': " + typeof t);
                    acc.times = parseInt(t.times, 10) || DEFAULT_TIMES, acc.interval = parseInt(t.interval, 10) || DEFAULT_INTERVAL;
                }
            }
            var length = arguments.length;
            if (length < 1 || length > 3) throw new Error("Invalid arguments - must be either (task), (task, callback), (times, task) or (times, task, callback)");
            function wrappedTask(wrappedCallback, wrappedResults) {
                function retryAttempt(task, finalAttempt) {
                    return function(seriesCallback) {
                        task((function(err, result) {
                            seriesCallback(!err || finalAttempt, {
                                err: err,
                                result: result
                            });
                        }), wrappedResults);
                    };
                }
                function retryInterval(interval) {
                    return function(seriesCallback) {
                        setTimeout((function() {
                            seriesCallback(null);
                        }), interval);
                    };
                }
                for (;opts.times; ) {
                    var finalAttempt = !(opts.times -= 1);
                    attempts.push(retryAttempt(opts.task, finalAttempt)), !finalAttempt && opts.interval > 0 && attempts.push(retryInterval(opts.interval));
                }
                async.series(attempts, (function(done, data) {
                    data = data[data.length - 1], (wrappedCallback || opts.callback)(data.err, data.result);
                }));
            }
            return length <= 2 && "function" == typeof times && (callback = task, task = times), 
            "function" != typeof times && parseTimes(opts, times), opts.callback = callback, 
            opts.task = task, opts.callback ? wrappedTask() : wrappedTask;
        }, async.waterfall = function(tasks, callback) {
            if (callback = _once(callback || noop), !_isArray(tasks)) {
                var err = new Error("First argument to waterfall must be an array of functions");
                return callback(err);
            }
            if (!tasks.length) return callback();
            !(function wrapIterator(iterator) {
                return _restParam((function(err, args) {
                    if (err) callback.apply(null, [ err ].concat(args)); else {
                        var next = iterator.next();
                        next ? args.push(wrapIterator(next)) : args.push(callback), ensureAsync(iterator).apply(null, args);
                    }
                }));
            })(async.iterator(tasks))();
        }, async.parallel = function(tasks, callback) {
            _parallel(async.eachOf, tasks, callback);
        }, async.parallelLimit = function(tasks, limit, callback) {
            _parallel(_eachOfLimit(limit), tasks, callback);
        }, async.series = function(tasks, callback) {
            _parallel(async.eachOfSeries, tasks, callback);
        }, async.iterator = function(tasks) {
            return (function makeCallback(index) {
                function fn() {
                    return tasks.length && tasks[index].apply(null, arguments), fn.next();
                }
                return fn.next = function() {
                    return index < tasks.length - 1 ? makeCallback(index + 1) : null;
                }, fn;
            })(0);
        }, async.apply = _restParam((function(fn, args) {
            return _restParam((function(callArgs) {
                return fn.apply(null, args.concat(callArgs));
            }));
        })), async.concat = doParallel(_concat), async.concatSeries = doSeries(_concat), 
        async.whilst = function(test, iterator, callback) {
            if (callback = callback || noop, test()) {
                var next = _restParam((function(err, args) {
                    err ? callback(err) : test.apply(this, args) ? iterator(next) : callback.apply(null, [ null ].concat(args));
                }));
                iterator(next);
            } else callback(null);
        }, async.doWhilst = function(iterator, test, callback) {
            var calls = 0;
            return async.whilst((function() {
                return ++calls <= 1 || test.apply(this, arguments);
            }), iterator, callback);
        }, async.until = function(test, iterator, callback) {
            return async.whilst((function() {
                return !test.apply(this, arguments);
            }), iterator, callback);
        }, async.doUntil = function(iterator, test, callback) {
            return async.doWhilst(iterator, (function() {
                return !test.apply(this, arguments);
            }), callback);
        }, async.during = function(test, iterator, callback) {
            callback = callback || noop;
            var next = _restParam((function(err, args) {
                err ? callback(err) : (args.push(check), test.apply(this, args));
            })), check = function(err, truth) {
                err ? callback(err) : truth ? iterator(next) : callback(null);
            };
            test(check);
        }, async.doDuring = function(iterator, test, callback) {
            var calls = 0;
            async.during((function(next) {
                calls++ < 1 ? next(null, !0) : test.apply(this, arguments);
            }), iterator, callback);
        }, async.queue = function(worker, concurrency) {
            return _queue((function(items, cb) {
                worker(items[0], cb);
            }), concurrency, 1);
        }, async.priorityQueue = function(worker, concurrency) {
            function _compareTasks(a, b) {
                return a.priority - b.priority;
            }
            var q = async.queue(worker, concurrency);
            return q.push = function(data, priority, callback) {
                !(function(q, data, priority, callback) {
                    if (null != callback && "function" != typeof callback) throw new Error("task callback must be a function");
                    if (q.started = !0, _isArray(data) || (data = [ data ]), 0 === data.length) return async.setImmediate((function() {
                        q.drain();
                    }));
                    _arrayEach(data, (function(task) {
                        var item = {
                            data: task,
                            priority: priority,
                            callback: "function" == typeof callback ? callback : noop
                        };
                        q.tasks.splice((function(sequence, item, compare) {
                            for (var beg = -1, end = sequence.length - 1; beg < end; ) {
                                var mid = beg + (end - beg + 1 >>> 1);
                                compare(item, sequence[mid]) >= 0 ? beg = mid : end = mid - 1;
                            }
                            return beg;
                        })(q.tasks, item, _compareTasks) + 1, 0, item), q.tasks.length === q.concurrency && q.saturated(), 
                        async.setImmediate(q.process);
                    }));
                })(q, data, priority, callback);
            }, delete q.unshift, q;
        }, async.cargo = function(worker, payload) {
            return _queue(worker, 1, payload);
        }, async.log = _console_fn("log"), async.dir = _console_fn("dir"), async.memoize = function(fn, hasher) {
            var memo = {}, queues = {}, has = Object.prototype.hasOwnProperty;
            hasher = hasher || identity;
            var memoized = _restParam((function(args) {
                var callback = args.pop(), key = hasher.apply(null, args);
                has.call(memo, key) ? async.setImmediate((function() {
                    callback.apply(null, memo[key]);
                })) : has.call(queues, key) ? queues[key].push(callback) : (queues[key] = [ callback ], 
                fn.apply(null, args.concat([ _restParam((function(args) {
                    memo[key] = args;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) q[i].apply(null, args);
                })) ])));
            }));
            return memoized.memo = memo, memoized.unmemoized = fn, memoized;
        }, async.unmemoize = function(fn) {
            return function() {
                return (fn.unmemoized || fn).apply(null, arguments);
            };
        }, async.times = _times(async.map), async.timesSeries = _times(async.mapSeries), 
        async.timesLimit = function(count, limit, iterator, callback) {
            return async.mapLimit(_range(count), limit, iterator, callback);
        }, async.seq = function() {
            var fns = arguments;
            return _restParam((function(args) {
                var that = this, callback = args[args.length - 1];
                "function" == typeof callback ? args.pop() : callback = noop, async.reduce(fns, args, (function(newargs, fn, cb) {
                    fn.apply(that, newargs.concat([ _restParam((function(err, nextargs) {
                        cb(err, nextargs);
                    })) ]));
                }), (function(err, results) {
                    callback.apply(that, [ err ].concat(results));
                }));
            }));
        }, async.compose = function() {
            return async.seq.apply(null, Array.prototype.reverse.call(arguments));
        }, async.applyEach = _applyEach(async.eachOf), async.applyEachSeries = _applyEach(async.eachOfSeries), 
        async.forever = function(fn, callback) {
            var done = only_once(callback || noop), task = ensureAsync(fn);
            !(function next(err) {
                if (err) return done(err);
                task(next);
            })();
        }, async.ensureAsync = ensureAsync, async.constant = _restParam((function(values) {
            var args = [ null ].concat(values);
            return function(callback) {
                return callback.apply(this, args);
            };
        })), async.wrapSync = async.asyncify = function(func) {
            return _restParam((function(args) {
                var result, obj, type, callback = args.pop();
                try {
                    result = func.apply(this, args);
                } catch (e) {
                    return callback(e);
                }
                ("function" == (type = typeof (obj = result)) || "object" === type && obj) && "function" == typeof result.then ? result.then((function(value) {
                    callback(null, value);
                })).catch((function(err) {
                    callback(err.message ? err : new Error(err));
                })) : callback(null, result);
            }));
        }, module.exports ? module.exports = async : void 0 === (__WEBPACK_AMD_DEFINE_RESULT__ = function() {
            return async;
        }.apply(exports, [])) || (module.exports = __WEBPACK_AMD_DEFINE_RESULT__);
    })();
}
