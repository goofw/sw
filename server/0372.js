function(module, exports, __webpack_require__) {
    var __WEBPACK_AMD_DEFINE_RESULT__;
    (function() {
        var root = this, previousUnderscore = root._, ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype, push = ArrayProto.push, slice = ArrayProto.slice, toString = ObjProto.toString, hasOwnProperty = ObjProto.hasOwnProperty, nativeIsArray = Array.isArray, nativeKeys = Object.keys, nativeBind = FuncProto.bind, nativeCreate = Object.create, Ctor = function() {}, _ = function(obj) {
            return obj instanceof _ ? obj : this instanceof _ ? void (this._wrapped = obj) : new _(obj);
        };
        module.exports && (exports = module.exports = _), exports._ = _, _.VERSION = "1.8.3";
        var optimizeCb = function(func, context, argCount) {
            if (void 0 === context) return func;
            switch (null == argCount ? 3 : argCount) {
              case 1:
                return function(value) {
                    return func.call(context, value);
                };

              case 2:
                return function(value, other) {
                    return func.call(context, value, other);
                };

              case 3:
                return function(value, index, collection) {
                    return func.call(context, value, index, collection);
                };

              case 4:
                return function(accumulator, value, index, collection) {
                    return func.call(context, accumulator, value, index, collection);
                };
            }
            return function() {
                return func.apply(context, arguments);
            };
        }, cb = function(value, context, argCount) {
            return null == value ? _.identity : _.isFunction(value) ? optimizeCb(value, context, argCount) : _.isObject(value) ? _.matcher(value) : _.property(value);
        };
        _.iteratee = function(value, context) {
            return cb(value, context, 1 / 0);
        };
        var createAssigner = function(keysFunc, undefinedOnly) {
            return function(obj) {
                var length = arguments.length;
                if (length < 2 || null == obj) return obj;
                for (var index = 1; index < length; index++) for (var source = arguments[index], keys = keysFunc(source), l = keys.length, i = 0; i < l; i++) {
                    var key = keys[i];
                    undefinedOnly && void 0 !== obj[key] || (obj[key] = source[key]);
                }
                return obj;
            };
        }, baseCreate = function(prototype) {
            if (!_.isObject(prototype)) return {};
            if (nativeCreate) return nativeCreate(prototype);
            Ctor.prototype = prototype;
            var result = new Ctor;
            return Ctor.prototype = null, result;
        }, property = function(key) {
            return function(obj) {
                return null == obj ? void 0 : obj[key];
            };
        }, MAX_ARRAY_INDEX = Math.pow(2, 53) - 1, getLength = property("length"), isArrayLike = function(collection) {
            var length = getLength(collection);
            return "number" == typeof length && length >= 0 && length <= MAX_ARRAY_INDEX;
        };
        function createReduce(dir) {
            function iterator(obj, iteratee, memo, keys, index, length) {
                for (;index >= 0 && index < length; index += dir) {
                    var currentKey = keys ? keys[index] : index;
                    memo = iteratee(memo, obj[currentKey], currentKey, obj);
                }
                return memo;
            }
            return function(obj, iteratee, memo, context) {
                iteratee = optimizeCb(iteratee, context, 4);
                var keys = !isArrayLike(obj) && _.keys(obj), length = (keys || obj).length, index = dir > 0 ? 0 : length - 1;
                return arguments.length < 3 && (memo = obj[keys ? keys[index] : index], index += dir), 
                iterator(obj, iteratee, memo, keys, index, length);
            };
        }
        _.each = _.forEach = function(obj, iteratee, context) {
            var i, length;
            if (iteratee = optimizeCb(iteratee, context), isArrayLike(obj)) for (i = 0, length = obj.length; i < length; i++) iteratee(obj[i], i, obj); else {
                var keys = _.keys(obj);
                for (i = 0, length = keys.length; i < length; i++) iteratee(obj[keys[i]], keys[i], obj);
            }
            return obj;
        }, _.map = _.collect = function(obj, iteratee, context) {
            iteratee = cb(iteratee, context);
            for (var keys = !isArrayLike(obj) && _.keys(obj), length = (keys || obj).length, results = Array(length), index = 0; index < length; index++) {
                var currentKey = keys ? keys[index] : index;
                results[index] = iteratee(obj[currentKey], currentKey, obj);
            }
            return results;
        }, _.reduce = _.foldl = _.inject = createReduce(1), _.reduceRight = _.foldr = createReduce(-1), 
        _.find = _.detect = function(obj, predicate, context) {
            var key;
            if (void 0 !== (key = isArrayLike(obj) ? _.findIndex(obj, predicate, context) : _.findKey(obj, predicate, context)) && -1 !== key) return obj[key];
        }, _.filter = _.select = function(obj, predicate, context) {
            var results = [];
            return predicate = cb(predicate, context), _.each(obj, (function(value, index, list) {
                predicate(value, index, list) && results.push(value);
            })), results;
        }, _.reject = function(obj, predicate, context) {
            return _.filter(obj, _.negate(cb(predicate)), context);
        }, _.every = _.all = function(obj, predicate, context) {
            predicate = cb(predicate, context);
            for (var keys = !isArrayLike(obj) && _.keys(obj), length = (keys || obj).length, index = 0; index < length; index++) {
                var currentKey = keys ? keys[index] : index;
                if (!predicate(obj[currentKey], currentKey, obj)) return !1;
            }
            return !0;
        }, _.some = _.any = function(obj, predicate, context) {
            predicate = cb(predicate, context);
            for (var keys = !isArrayLike(obj) && _.keys(obj), length = (keys || obj).length, index = 0; index < length; index++) {
                var currentKey = keys ? keys[index] : index;
                if (predicate(obj[currentKey], currentKey, obj)) return !0;
            }
            return !1;
        }, _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
            return isArrayLike(obj) || (obj = _.values(obj)), ("number" != typeof fromIndex || guard) && (fromIndex = 0), 
            _.indexOf(obj, item, fromIndex) >= 0;
        }, _.invoke = function(obj, method) {
            var args = slice.call(arguments, 2), isFunc = _.isFunction(method);
            return _.map(obj, (function(value) {
                var func = isFunc ? method : value[method];
                return null == func ? func : func.apply(value, args);
            }));
        }, _.pluck = function(obj, key) {
            return _.map(obj, _.property(key));
        }, _.where = function(obj, attrs) {
            return _.filter(obj, _.matcher(attrs));
        }, _.findWhere = function(obj, attrs) {
            return _.find(obj, _.matcher(attrs));
        }, _.max = function(obj, iteratee, context) {
            var value, computed, result = -1 / 0, lastComputed = -1 / 0;
            if (null == iteratee && null != obj) for (var i = 0, length = (obj = isArrayLike(obj) ? obj : _.values(obj)).length; i < length; i++) (value = obj[i]) > result && (result = value); else iteratee = cb(iteratee, context), 
            _.each(obj, (function(value, index, list) {
                ((computed = iteratee(value, index, list)) > lastComputed || computed === -1 / 0 && result === -1 / 0) && (result = value, 
                lastComputed = computed);
            }));
            return result;
        }, _.min = function(obj, iteratee, context) {
            var value, computed, result = 1 / 0, lastComputed = 1 / 0;
            if (null == iteratee && null != obj) for (var i = 0, length = (obj = isArrayLike(obj) ? obj : _.values(obj)).length; i < length; i++) (value = obj[i]) < result && (result = value); else iteratee = cb(iteratee, context), 
            _.each(obj, (function(value, index, list) {
                ((computed = iteratee(value, index, list)) < lastComputed || computed === 1 / 0 && result === 1 / 0) && (result = value, 
                lastComputed = computed);
            }));
            return result;
        }, _.shuffle = function(obj) {
            for (var rand, set = isArrayLike(obj) ? obj : _.values(obj), length = set.length, shuffled = Array(length), index = 0; index < length; index++) (rand = _.random(0, index)) !== index && (shuffled[index] = shuffled[rand]), 
            shuffled[rand] = set[index];
            return shuffled;
        }, _.sample = function(obj, n, guard) {
            return null == n || guard ? (isArrayLike(obj) || (obj = _.values(obj)), obj[_.random(obj.length - 1)]) : _.shuffle(obj).slice(0, Math.max(0, n));
        }, _.sortBy = function(obj, iteratee, context) {
            return iteratee = cb(iteratee, context), _.pluck(_.map(obj, (function(value, index, list) {
                return {
                    value: value,
                    index: index,
                    criteria: iteratee(value, index, list)
                };
            })).sort((function(left, right) {
                var a = left.criteria, b = right.criteria;
                if (a !== b) {
                    if (a > b || void 0 === a) return 1;
                    if (a < b || void 0 === b) return -1;
                }
                return left.index - right.index;
            })), "value");
        };
        var group = function(behavior) {
            return function(obj, iteratee, context) {
                var result = {};
                return iteratee = cb(iteratee, context), _.each(obj, (function(value, index) {
                    var key = iteratee(value, index, obj);
                    behavior(result, value, key);
                })), result;
            };
        };
        _.groupBy = group((function(result, value, key) {
            _.has(result, key) ? result[key].push(value) : result[key] = [ value ];
        })), _.indexBy = group((function(result, value, key) {
            result[key] = value;
        })), _.countBy = group((function(result, value, key) {
            _.has(result, key) ? result[key]++ : result[key] = 1;
        })), _.toArray = function(obj) {
            return obj ? _.isArray(obj) ? slice.call(obj) : isArrayLike(obj) ? _.map(obj, _.identity) : _.values(obj) : [];
        }, _.size = function(obj) {
            return null == obj ? 0 : isArrayLike(obj) ? obj.length : _.keys(obj).length;
        }, _.partition = function(obj, predicate, context) {
            predicate = cb(predicate, context);
            var pass = [], fail = [];
            return _.each(obj, (function(value, key, obj) {
                (predicate(value, key, obj) ? pass : fail).push(value);
            })), [ pass, fail ];
        }, _.first = _.head = _.take = function(array, n, guard) {
            if (null != array) return null == n || guard ? array[0] : _.initial(array, array.length - n);
        }, _.initial = function(array, n, guard) {
            return slice.call(array, 0, Math.max(0, array.length - (null == n || guard ? 1 : n)));
        }, _.last = function(array, n, guard) {
            if (null != array) return null == n || guard ? array[array.length - 1] : _.rest(array, Math.max(0, array.length - n));
        }, _.rest = _.tail = _.drop = function(array, n, guard) {
            return slice.call(array, null == n || guard ? 1 : n);
        }, _.compact = function(array) {
            return _.filter(array, _.identity);
        };
        var flatten = function(input, shallow, strict, startIndex) {
            for (var output = [], idx = 0, i = startIndex || 0, length = getLength(input); i < length; i++) {
                var value = input[i];
                if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
                    shallow || (value = flatten(value, shallow, strict));
                    var j = 0, len = value.length;
                    for (output.length += len; j < len; ) output[idx++] = value[j++];
                } else strict || (output[idx++] = value);
            }
            return output;
        };
        function createPredicateIndexFinder(dir) {
            return function(array, predicate, context) {
                predicate = cb(predicate, context);
                for (var length = getLength(array), index = dir > 0 ? 0 : length - 1; index >= 0 && index < length; index += dir) if (predicate(array[index], index, array)) return index;
                return -1;
            };
        }
        function createIndexFinder(dir, predicateFind, sortedIndex) {
            return function(array, item, idx) {
                var i = 0, length = getLength(array);
                if ("number" == typeof idx) dir > 0 ? i = idx >= 0 ? idx : Math.max(idx + length, i) : length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1; else if (sortedIndex && idx && length) return array[idx = sortedIndex(array, item)] === item ? idx : -1;
                if (item != item) return (idx = predicateFind(slice.call(array, i, length), _.isNaN)) >= 0 ? idx + i : -1;
                for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) if (array[idx] === item) return idx;
                return -1;
            };
        }
        _.flatten = function(array, shallow) {
            return flatten(array, shallow, !1);
        }, _.without = function(array) {
            return _.difference(array, slice.call(arguments, 1));
        }, _.uniq = _.unique = function(array, isSorted, iteratee, context) {
            _.isBoolean(isSorted) || (context = iteratee, iteratee = isSorted, isSorted = !1), 
            null != iteratee && (iteratee = cb(iteratee, context));
            for (var result = [], seen = [], i = 0, length = getLength(array); i < length; i++) {
                var value = array[i], computed = iteratee ? iteratee(value, i, array) : value;
                isSorted ? (i && seen === computed || result.push(value), seen = computed) : iteratee ? _.contains(seen, computed) || (seen.push(computed), 
                result.push(value)) : _.contains(result, value) || result.push(value);
            }
            return result;
        }, _.union = function() {
            return _.uniq(flatten(arguments, !0, !0));
        }, _.intersection = function(array) {
            for (var result = [], argsLength = arguments.length, i = 0, length = getLength(array); i < length; i++) {
                var item = array[i];
                if (!_.contains(result, item)) {
                    for (var j = 1; j < argsLength && _.contains(arguments[j], item); j++) ;
                    j === argsLength && result.push(item);
                }
            }
            return result;
        }, _.difference = function(array) {
            var rest = flatten(arguments, !0, !0, 1);
            return _.filter(array, (function(value) {
                return !_.contains(rest, value);
            }));
        }, _.zip = function() {
            return _.unzip(arguments);
        }, _.unzip = function(array) {
            for (var length = array && _.max(array, getLength).length || 0, result = Array(length), index = 0; index < length; index++) result[index] = _.pluck(array, index);
            return result;
        }, _.object = function(list, values) {
            for (var result = {}, i = 0, length = getLength(list); i < length; i++) values ? result[list[i]] = values[i] : result[list[i][0]] = list[i][1];
            return result;
        }, _.findIndex = createPredicateIndexFinder(1), _.findLastIndex = createPredicateIndexFinder(-1), 
        _.sortedIndex = function(array, obj, iteratee, context) {
            for (var value = (iteratee = cb(iteratee, context, 1))(obj), low = 0, high = getLength(array); low < high; ) {
                var mid = Math.floor((low + high) / 2);
                iteratee(array[mid]) < value ? low = mid + 1 : high = mid;
            }
            return low;
        }, _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex), _.lastIndexOf = createIndexFinder(-1, _.findLastIndex), 
        _.range = function(start, stop, step) {
            null == stop && (stop = start || 0, start = 0), step = step || 1;
            for (var length = Math.max(Math.ceil((stop - start) / step), 0), range = Array(length), idx = 0; idx < length; idx++, 
            start += step) range[idx] = start;
            return range;
        };
        var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
            if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
            var self = baseCreate(sourceFunc.prototype), result = sourceFunc.apply(self, args);
            return _.isObject(result) ? result : self;
        };
        _.bind = function(func, context) {
            if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
            if (!_.isFunction(func)) throw new TypeError("Bind must be called on a function");
            var args = slice.call(arguments, 2), bound = function() {
                return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
            };
            return bound;
        }, _.partial = function(func) {
            var boundArgs = slice.call(arguments, 1), bound = function() {
                for (var position = 0, length = boundArgs.length, args = Array(length), i = 0; i < length; i++) args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
                for (;position < arguments.length; ) args.push(arguments[position++]);
                return executeBound(func, bound, this, this, args);
            };
            return bound;
        }, _.bindAll = function(obj) {
            var i, key, length = arguments.length;
            if (length <= 1) throw new Error("bindAll must be passed function names");
            for (i = 1; i < length; i++) obj[key = arguments[i]] = _.bind(obj[key], obj);
            return obj;
        }, _.memoize = function(func, hasher) {
            var memoize = function(key) {
                var cache = memoize.cache, address = "" + (hasher ? hasher.apply(this, arguments) : key);
                return _.has(cache, address) || (cache[address] = func.apply(this, arguments)), 
                cache[address];
            };
            return memoize.cache = {}, memoize;
        }, _.delay = function(func, wait) {
            var args = slice.call(arguments, 2);
            return setTimeout((function() {
                return func.apply(null, args);
            }), wait);
        }, _.defer = _.partial(_.delay, _, 1), _.throttle = function(func, wait, options) {
            var context, args, result, timeout = null, previous = 0;
            options || (options = {});
            var later = function() {
                previous = !1 === options.leading ? 0 : _.now(), timeout = null, result = func.apply(context, args), 
                timeout || (context = args = null);
            };
            return function() {
                var now = _.now();
                previous || !1 !== options.leading || (previous = now);
                var remaining = wait - (now - previous);
                return context = this, args = arguments, remaining <= 0 || remaining > wait ? (timeout && (clearTimeout(timeout), 
                timeout = null), previous = now, result = func.apply(context, args), timeout || (context = args = null)) : timeout || !1 === options.trailing || (timeout = setTimeout(later, remaining)), 
                result;
            };
        }, _.debounce = function(func, wait, immediate) {
            var timeout, args, context, timestamp, result, later = function() {
                var last = _.now() - timestamp;
                last < wait && last >= 0 ? timeout = setTimeout(later, wait - last) : (timeout = null, 
                immediate || (result = func.apply(context, args), timeout || (context = args = null)));
            };
            return function() {
                context = this, args = arguments, timestamp = _.now();
                var callNow = immediate && !timeout;
                return timeout || (timeout = setTimeout(later, wait)), callNow && (result = func.apply(context, args), 
                context = args = null), result;
            };
        }, _.wrap = function(func, wrapper) {
            return _.partial(wrapper, func);
        }, _.negate = function(predicate) {
            return function() {
                return !predicate.apply(this, arguments);
            };
        }, _.compose = function() {
            var args = arguments, start = args.length - 1;
            return function() {
                for (var i = start, result = args[start].apply(this, arguments); i--; ) result = args[i].call(this, result);
                return result;
            };
        }, _.after = function(times, func) {
            return function() {
                if (--times < 1) return func.apply(this, arguments);
            };
        }, _.before = function(times, func) {
            var memo;
            return function() {
                return --times > 0 && (memo = func.apply(this, arguments)), times <= 1 && (func = null), 
                memo;
            };
        }, _.once = _.partial(_.before, 2);
        var hasEnumBug = !{
            toString: null
        }.propertyIsEnumerable("toString"), nonEnumerableProps = [ "valueOf", "isPrototypeOf", "toString", "propertyIsEnumerable", "hasOwnProperty", "toLocaleString" ];
        function collectNonEnumProps(obj, keys) {
            var nonEnumIdx = nonEnumerableProps.length, constructor = obj.constructor, proto = _.isFunction(constructor) && constructor.prototype || ObjProto, prop = "constructor";
            for (_.has(obj, prop) && !_.contains(keys, prop) && keys.push(prop); nonEnumIdx--; ) (prop = nonEnumerableProps[nonEnumIdx]) in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop) && keys.push(prop);
        }
        _.keys = function(obj) {
            if (!_.isObject(obj)) return [];
            if (nativeKeys) return nativeKeys(obj);
            var keys = [];
            for (var key in obj) _.has(obj, key) && keys.push(key);
            return hasEnumBug && collectNonEnumProps(obj, keys), keys;
        }, _.allKeys = function(obj) {
            if (!_.isObject(obj)) return [];
            var keys = [];
            for (var key in obj) keys.push(key);
            return hasEnumBug && collectNonEnumProps(obj, keys), keys;
        }, _.values = function(obj) {
            for (var keys = _.keys(obj), length = keys.length, values = Array(length), i = 0; i < length; i++) values[i] = obj[keys[i]];
            return values;
        }, _.mapObject = function(obj, iteratee, context) {
            iteratee = cb(iteratee, context);
            for (var currentKey, keys = _.keys(obj), length = keys.length, results = {}, index = 0; index < length; index++) results[currentKey = keys[index]] = iteratee(obj[currentKey], currentKey, obj);
            return results;
        }, _.pairs = function(obj) {
            for (var keys = _.keys(obj), length = keys.length, pairs = Array(length), i = 0; i < length; i++) pairs[i] = [ keys[i], obj[keys[i]] ];
            return pairs;
        }, _.invert = function(obj) {
            for (var result = {}, keys = _.keys(obj), i = 0, length = keys.length; i < length; i++) result[obj[keys[i]]] = keys[i];
            return result;
        }, _.functions = _.methods = function(obj) {
            var names = [];
            for (var key in obj) _.isFunction(obj[key]) && names.push(key);
            return names.sort();
        }, _.extend = createAssigner(_.allKeys), _.extendOwn = _.assign = createAssigner(_.keys), 
        _.findKey = function(obj, predicate, context) {
            predicate = cb(predicate, context);
            for (var key, keys = _.keys(obj), i = 0, length = keys.length; i < length; i++) if (predicate(obj[key = keys[i]], key, obj)) return key;
        }, _.pick = function(object, oiteratee, context) {
            var iteratee, keys, result = {}, obj = object;
            if (null == obj) return result;
            _.isFunction(oiteratee) ? (keys = _.allKeys(obj), iteratee = optimizeCb(oiteratee, context)) : (keys = flatten(arguments, !1, !1, 1), 
            iteratee = function(value, key, obj) {
                return key in obj;
            }, obj = Object(obj));
            for (var i = 0, length = keys.length; i < length; i++) {
                var key = keys[i], value = obj[key];
                iteratee(value, key, obj) && (result[key] = value);
            }
            return result;
        }, _.omit = function(obj, iteratee, context) {
            if (_.isFunction(iteratee)) iteratee = _.negate(iteratee); else {
                var keys = _.map(flatten(arguments, !1, !1, 1), String);
                iteratee = function(value, key) {
                    return !_.contains(keys, key);
                };
            }
            return _.pick(obj, iteratee, context);
        }, _.defaults = createAssigner(_.allKeys, !0), _.create = function(prototype, props) {
            var result = baseCreate(prototype);
            return props && _.extendOwn(result, props), result;
        }, _.clone = function(obj) {
            return _.isObject(obj) ? _.isArray(obj) ? obj.slice() : _.extend({}, obj) : obj;
        }, _.tap = function(obj, interceptor) {
            return interceptor(obj), obj;
        }, _.isMatch = function(object, attrs) {
            var keys = _.keys(attrs), length = keys.length;
            if (null == object) return !length;
            for (var obj = Object(object), i = 0; i < length; i++) {
                var key = keys[i];
                if (attrs[key] !== obj[key] || !(key in obj)) return !1;
            }
            return !0;
        };
        var eq = function(a, b, aStack, bStack) {
            if (a === b) return 0 !== a || 1 / a == 1 / b;
            if (null == a || null == b) return a === b;
            a instanceof _ && (a = a._wrapped), b instanceof _ && (b = b._wrapped);
            var className = toString.call(a);
            if (className !== toString.call(b)) return !1;
            switch (className) {
              case "[object RegExp]":
              case "[object String]":
                return "" + a == "" + b;

              case "[object Number]":
                return +a != +a ? +b != +b : 0 == +a ? 1 / +a == 1 / b : +a == +b;

              case "[object Date]":
              case "[object Boolean]":
                return +a == +b;
            }
            var areArrays = "[object Array]" === className;
            if (!areArrays) {
                if ("object" != typeof a || "object" != typeof b) return !1;
                var aCtor = a.constructor, bCtor = b.constructor;
                if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor) && "constructor" in a && "constructor" in b) return !1;
            }
            bStack = bStack || [];
            for (var length = (aStack = aStack || []).length; length--; ) if (aStack[length] === a) return bStack[length] === b;
            if (aStack.push(a), bStack.push(b), areArrays) {
                if ((length = a.length) !== b.length) return !1;
                for (;length--; ) if (!eq(a[length], b[length], aStack, bStack)) return !1;
            } else {
                var key, keys = _.keys(a);
                if (length = keys.length, _.keys(b).length !== length) return !1;
                for (;length--; ) if (key = keys[length], !_.has(b, key) || !eq(a[key], b[key], aStack, bStack)) return !1;
            }
            return aStack.pop(), bStack.pop(), !0;
        };
        _.isEqual = function(a, b) {
            return eq(a, b);
        }, _.isEmpty = function(obj) {
            return null == obj || (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj)) ? 0 === obj.length : 0 === _.keys(obj).length);
        }, _.isElement = function(obj) {
            return !(!obj || 1 !== obj.nodeType);
        }, _.isArray = nativeIsArray || function(obj) {
            return "[object Array]" === toString.call(obj);
        }, _.isObject = function(obj) {
            var type = typeof obj;
            return "function" === type || "object" === type && !!obj;
        }, _.each([ "Arguments", "Function", "String", "Number", "Date", "RegExp", "Error" ], (function(name) {
            _["is" + name] = function(obj) {
                return toString.call(obj) === "[object " + name + "]";
            };
        })), _.isArguments(arguments) || (_.isArguments = function(obj) {
            return _.has(obj, "callee");
        }), "object" != typeof Int8Array && (_.isFunction = function(obj) {
            return "function" == typeof obj || !1;
        }), _.isFinite = function(obj) {
            return isFinite(obj) && !isNaN(parseFloat(obj));
        }, _.isNaN = function(obj) {
            return _.isNumber(obj) && obj !== +obj;
        }, _.isBoolean = function(obj) {
            return !0 === obj || !1 === obj || "[object Boolean]" === toString.call(obj);
        }, _.isNull = function(obj) {
            return null === obj;
        }, _.isUndefined = function(obj) {
            return void 0 === obj;
        }, _.has = function(obj, key) {
            return null != obj && hasOwnProperty.call(obj, key);
        }, _.noConflict = function() {
            return root._ = previousUnderscore, this;
        }, _.identity = function(value) {
            return value;
        }, _.constant = function(value) {
            return function() {
                return value;
            };
        }, _.noop = function() {}, _.property = property, _.propertyOf = function(obj) {
            return null == obj ? function() {} : function(key) {
                return obj[key];
            };
        }, _.matcher = _.matches = function(attrs) {
            return attrs = _.extendOwn({}, attrs), function(obj) {
                return _.isMatch(obj, attrs);
            };
        }, _.times = function(n, iteratee, context) {
            var accum = Array(Math.max(0, n));
            iteratee = optimizeCb(iteratee, context, 1);
            for (var i = 0; i < n; i++) accum[i] = iteratee(i);
            return accum;
        }, _.random = function(min, max) {
            return null == max && (max = min, min = 0), min + Math.floor(Math.random() * (max - min + 1));
        }, _.now = Date.now || function() {
            return (new Date).getTime();
        };
        var escapeMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#x27;",
            "`": "&#x60;"
        }, unescapeMap = _.invert(escapeMap), createEscaper = function(map) {
            var escaper = function(match) {
                return map[match];
            }, source = "(?:" + _.keys(map).join("|") + ")", testRegexp = RegExp(source), replaceRegexp = RegExp(source, "g");
            return function(string) {
                return string = null == string ? "" : "" + string, testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
            };
        };
        _.escape = createEscaper(escapeMap), _.unescape = createEscaper(unescapeMap), _.result = function(object, property, fallback) {
            var value = null == object ? void 0 : object[property];
            return void 0 === value && (value = fallback), _.isFunction(value) ? value.call(object) : value;
        };
        var idCounter = 0;
        _.uniqueId = function(prefix) {
            var id = ++idCounter + "";
            return prefix ? prefix + id : id;
        }, _.templateSettings = {
            evaluate: /<%([\s\S]+?)%>/g,
            interpolate: /<%=([\s\S]+?)%>/g,
            escape: /<%-([\s\S]+?)%>/g
        };
        var noMatch = /(.)^/, escapes = {
            "'": "'",
            "\\": "\\",
            "\r": "r",
            "\n": "n",
            "\u2028": "u2028",
            "\u2029": "u2029"
        }, escaper = /\\|'|\r|\n|\u2028|\u2029/g, escapeChar = function(match) {
            return "\\" + escapes[match];
        };
        _.template = function(text, settings, oldSettings) {
            !settings && oldSettings && (settings = oldSettings), settings = _.defaults({}, settings, _.templateSettings);
            var matcher = RegExp([ (settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source ].join("|") + "|$", "g"), index = 0, source = "__p+='";
            text.replace(matcher, (function(match, escape, interpolate, evaluate, offset) {
                return source += text.slice(index, offset).replace(escaper, escapeChar), index = offset + match.length, 
                escape ? source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'" : interpolate ? source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'" : evaluate && (source += "';\n" + evaluate + "\n__p+='"), 
                match;
            })), source += "';\n", settings.variable || (source = "with(obj||{}){\n" + source + "}\n"), 
            source = "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n" + source + "return __p;\n";
            try {
                var render = new Function(settings.variable || "obj", "_", source);
            } catch (e) {
                throw e.source = source, e;
            }
            var template = function(data) {
                return render.call(this, data, _);
            }, argument = settings.variable || "obj";
            return template.source = "function(" + argument + "){\n" + source + "}", template;
        }, _.chain = function(obj) {
            var instance = _(obj);
            return instance._chain = !0, instance;
        };
        var result = function(instance, obj) {
            return instance._chain ? _(obj).chain() : obj;
        };
        _.mixin = function(obj) {
            _.each(_.functions(obj), (function(name) {
                var func = _[name] = obj[name];
                _.prototype[name] = function() {
                    var args = [ this._wrapped ];
                    return push.apply(args, arguments), result(this, func.apply(_, args));
                };
            }));
        }, _.mixin(_), _.each([ "pop", "push", "reverse", "shift", "sort", "splice", "unshift" ], (function(name) {
            var method = ArrayProto[name];
            _.prototype[name] = function() {
                var obj = this._wrapped;
                return method.apply(obj, arguments), "shift" !== name && "splice" !== name || 0 !== obj.length || delete obj[0], 
                result(this, obj);
            };
        })), _.each([ "concat", "join", "slice" ], (function(name) {
            var method = ArrayProto[name];
            _.prototype[name] = function() {
                return result(this, method.apply(this._wrapped, arguments));
            };
        })), _.prototype.value = function() {
            return this._wrapped;
        }, _.prototype.valueOf = _.prototype.toJSON = _.prototype.value, _.prototype.toString = function() {
            return "" + this._wrapped;
        }, void 0 === (__WEBPACK_AMD_DEFINE_RESULT__ = function() {
            return _;
        }.apply(exports, [])) || (module.exports = __WEBPACK_AMD_DEFINE_RESULT__);
    }).call(this);
}
