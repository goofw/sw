function(module, exports, __webpack_require__) {
    var factory;
    factory = function() {
        var root = "object" == typeof self && self.self === self && self || "object" == typeof global && global.global === global && global || Function("return this")() || {}, ArrayProto = Array.prototype, ObjProto = Object.prototype, SymbolProto = "undefined" != typeof Symbol ? Symbol.prototype : null, push = ArrayProto.push, slice = ArrayProto.slice, toString = ObjProto.toString, hasOwnProperty = ObjProto.hasOwnProperty, supportsArrayBuffer = "undefined" != typeof ArrayBuffer, supportsDataView = "undefined" != typeof DataView, nativeIsArray = Array.isArray, nativeKeys = Object.keys, nativeCreate = Object.create, nativeIsView = supportsArrayBuffer && ArrayBuffer.isView, _isNaN = isNaN, _isFinite = isFinite, hasEnumBug = !{
            toString: null
        }.propertyIsEnumerable("toString"), nonEnumerableProps = [ "valueOf", "isPrototypeOf", "toString", "propertyIsEnumerable", "hasOwnProperty", "toLocaleString" ], MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
        function restArguments(func, startIndex) {
            return startIndex = null == startIndex ? func.length - 1 : +startIndex, function() {
                for (var length = Math.max(arguments.length - startIndex, 0), rest = Array(length), index = 0; index < length; index++) rest[index] = arguments[index + startIndex];
                switch (startIndex) {
                  case 0:
                    return func.call(this, rest);

                  case 1:
                    return func.call(this, arguments[0], rest);

                  case 2:
                    return func.call(this, arguments[0], arguments[1], rest);
                }
                var args = Array(startIndex + 1);
                for (index = 0; index < startIndex; index++) args[index] = arguments[index];
                return args[startIndex] = rest, func.apply(this, args);
            };
        }
        function isObject(obj) {
            var type = typeof obj;
            return "function" === type || "object" === type && !!obj;
        }
        function isUndefined(obj) {
            return void 0 === obj;
        }
        function isBoolean(obj) {
            return !0 === obj || !1 === obj || "[object Boolean]" === toString.call(obj);
        }
        function tagTester(name) {
            var tag = "[object " + name + "]";
            return function(obj) {
                return toString.call(obj) === tag;
            };
        }
        var isString = tagTester("String"), isNumber = tagTester("Number"), isDate = tagTester("Date"), isRegExp = tagTester("RegExp"), isError = tagTester("Error"), isSymbol = tagTester("Symbol"), isArrayBuffer = tagTester("ArrayBuffer"), isFunction = tagTester("Function"), nodelist = root.document && root.document.childNodes;
        "object" != typeof Int8Array && "function" != typeof nodelist && (isFunction = function(obj) {
            return "function" == typeof obj || !1;
        });
        var isFunction$1 = isFunction, hasObjectTag = tagTester("Object"), hasStringTagBug = supportsDataView && hasObjectTag(new DataView(new ArrayBuffer(8))), isIE11 = "undefined" != typeof Map && hasObjectTag(new Map), isDataView = tagTester("DataView"), isDataView$1 = hasStringTagBug ? function(obj) {
            return null != obj && isFunction$1(obj.getInt8) && isArrayBuffer(obj.buffer);
        } : isDataView, isArray = nativeIsArray || tagTester("Array");
        function has$1(obj, key) {
            return null != obj && hasOwnProperty.call(obj, key);
        }
        var isArguments = tagTester("Arguments");
        !(function() {
            isArguments(arguments) || (isArguments = function(obj) {
                return has$1(obj, "callee");
            });
        })();
        var isArguments$1 = isArguments;
        function isNaN$1(obj) {
            return isNumber(obj) && _isNaN(obj);
        }
        function constant(value) {
            return function() {
                return value;
            };
        }
        function createSizePropertyCheck(getSizeProperty) {
            return function(collection) {
                var sizeProperty = getSizeProperty(collection);
                return "number" == typeof sizeProperty && sizeProperty >= 0 && sizeProperty <= MAX_ARRAY_INDEX;
            };
        }
        function shallowProperty(key) {
            return function(obj) {
                return null == obj ? void 0 : obj[key];
            };
        }
        var getByteLength = shallowProperty("byteLength"), isBufferLike = createSizePropertyCheck(getByteLength), typedArrayPattern = /\[object ((I|Ui)nt(8|16|32)|Float(32|64)|Uint8Clamped|Big(I|Ui)nt64)Array\]/, isTypedArray$1 = supportsArrayBuffer ? function(obj) {
            return nativeIsView ? nativeIsView(obj) && !isDataView$1(obj) : isBufferLike(obj) && typedArrayPattern.test(toString.call(obj));
        } : constant(!1), getLength = shallowProperty("length");
        function collectNonEnumProps(obj, keys) {
            keys = (function(keys) {
                for (var hash = {}, l = keys.length, i = 0; i < l; ++i) hash[keys[i]] = !0;
                return {
                    contains: function(key) {
                        return !0 === hash[key];
                    },
                    push: function(key) {
                        return hash[key] = !0, keys.push(key);
                    }
                };
            })(keys);
            var nonEnumIdx = nonEnumerableProps.length, constructor = obj.constructor, proto = isFunction$1(constructor) && constructor.prototype || ObjProto, prop = "constructor";
            for (has$1(obj, prop) && !keys.contains(prop) && keys.push(prop); nonEnumIdx--; ) (prop = nonEnumerableProps[nonEnumIdx]) in obj && obj[prop] !== proto[prop] && !keys.contains(prop) && keys.push(prop);
        }
        function keys(obj) {
            if (!isObject(obj)) return [];
            if (nativeKeys) return nativeKeys(obj);
            var keys = [];
            for (var key in obj) has$1(obj, key) && keys.push(key);
            return hasEnumBug && collectNonEnumProps(obj, keys), keys;
        }
        function isMatch(object, attrs) {
            var _keys = keys(attrs), length = _keys.length;
            if (null == object) return !length;
            for (var obj = Object(object), i = 0; i < length; i++) {
                var key = _keys[i];
                if (attrs[key] !== obj[key] || !(key in obj)) return !1;
            }
            return !0;
        }
        function _$1(obj) {
            return obj instanceof _$1 ? obj : this instanceof _$1 ? void (this._wrapped = obj) : new _$1(obj);
        }
        function toBufferView(bufferSource) {
            return new Uint8Array(bufferSource.buffer || bufferSource, bufferSource.byteOffset || 0, getByteLength(bufferSource));
        }
        function eq(a, b, aStack, bStack) {
            if (a === b) return 0 !== a || 1 / a == 1 / b;
            if (null == a || null == b) return !1;
            if (a != a) return b != b;
            var type = typeof a;
            return ("function" === type || "object" === type || "object" == typeof b) && deepEq(a, b, aStack, bStack);
        }
        function deepEq(a, b, aStack, bStack) {
            a instanceof _$1 && (a = a._wrapped), b instanceof _$1 && (b = b._wrapped);
            var className = toString.call(a);
            if (className !== toString.call(b)) return !1;
            if (hasStringTagBug && "[object Object]" == className && isDataView$1(a)) {
                if (!isDataView$1(b)) return !1;
                className = "[object DataView]";
            }
            switch (className) {
              case "[object RegExp]":
              case "[object String]":
                return "" + a == "" + b;

              case "[object Number]":
                return +a != +a ? +b != +b : 0 == +a ? 1 / +a == 1 / b : +a == +b;

              case "[object Date]":
              case "[object Boolean]":
                return +a == +b;

              case "[object Symbol]":
                return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);

              case "[object ArrayBuffer]":
              case "[object DataView]":
                return deepEq(toBufferView(a), toBufferView(b), aStack, bStack);
            }
            var areArrays = "[object Array]" === className;
            if (!areArrays && isTypedArray$1(a)) {
                if (getByteLength(a) !== getByteLength(b)) return !1;
                if (a.buffer === b.buffer && a.byteOffset === b.byteOffset) return !0;
                areArrays = !0;
            }
            if (!areArrays) {
                if ("object" != typeof a || "object" != typeof b) return !1;
                var aCtor = a.constructor, bCtor = b.constructor;
                if (aCtor !== bCtor && !(isFunction$1(aCtor) && aCtor instanceof aCtor && isFunction$1(bCtor) && bCtor instanceof bCtor) && "constructor" in a && "constructor" in b) return !1;
            }
            bStack = bStack || [];
            for (var length = (aStack = aStack || []).length; length--; ) if (aStack[length] === a) return bStack[length] === b;
            if (aStack.push(a), bStack.push(b), areArrays) {
                if ((length = a.length) !== b.length) return !1;
                for (;length--; ) if (!eq(a[length], b[length], aStack, bStack)) return !1;
            } else {
                var key, _keys = keys(a);
                if (length = _keys.length, keys(b).length !== length) return !1;
                for (;length--; ) if (!has$1(b, key = _keys[length]) || !eq(a[key], b[key], aStack, bStack)) return !1;
            }
            return aStack.pop(), bStack.pop(), !0;
        }
        function allKeys(obj) {
            if (!isObject(obj)) return [];
            var keys = [];
            for (var key in obj) keys.push(key);
            return hasEnumBug && collectNonEnumProps(obj, keys), keys;
        }
        function ie11fingerprint(methods) {
            var length = getLength(methods);
            return function(obj) {
                if (null == obj) return !1;
                var keys = allKeys(obj);
                if (getLength(keys)) return !1;
                for (var i = 0; i < length; i++) if (!isFunction$1(obj[methods[i]])) return !1;
                return methods !== weakMapMethods || !isFunction$1(obj[forEachName]);
            };
        }
        _$1.VERSION = "1.13.2", _$1.prototype.value = function() {
            return this._wrapped;
        }, _$1.prototype.valueOf = _$1.prototype.toJSON = _$1.prototype.value, _$1.prototype.toString = function() {
            return String(this._wrapped);
        };
        var forEachName = "forEach", commonInit = [ "clear", "delete" ], mapTail = [ "get", "has", "set" ], mapMethods = commonInit.concat(forEachName, mapTail), weakMapMethods = commonInit.concat(mapTail), setMethods = [ "add" ].concat(commonInit, forEachName, "has"), isMap = isIE11 ? ie11fingerprint(mapMethods) : tagTester("Map"), isWeakMap = isIE11 ? ie11fingerprint(weakMapMethods) : tagTester("WeakMap"), isSet = isIE11 ? ie11fingerprint(setMethods) : tagTester("Set"), isWeakSet = tagTester("WeakSet");
        function values(obj) {
            for (var _keys = keys(obj), length = _keys.length, values = Array(length), i = 0; i < length; i++) values[i] = obj[_keys[i]];
            return values;
        }
        function invert(obj) {
            for (var result = {}, _keys = keys(obj), i = 0, length = _keys.length; i < length; i++) result[obj[_keys[i]]] = _keys[i];
            return result;
        }
        function functions(obj) {
            var names = [];
            for (var key in obj) isFunction$1(obj[key]) && names.push(key);
            return names.sort();
        }
        function createAssigner(keysFunc, defaults) {
            return function(obj) {
                var length = arguments.length;
                if (defaults && (obj = Object(obj)), length < 2 || null == obj) return obj;
                for (var index = 1; index < length; index++) for (var source = arguments[index], keys = keysFunc(source), l = keys.length, i = 0; i < l; i++) {
                    var key = keys[i];
                    defaults && void 0 !== obj[key] || (obj[key] = source[key]);
                }
                return obj;
            };
        }
        var extend = createAssigner(allKeys), extendOwn = createAssigner(keys), defaults = createAssigner(allKeys, !0);
        function baseCreate(prototype) {
            if (!isObject(prototype)) return {};
            if (nativeCreate) return nativeCreate(prototype);
            var Ctor = function() {};
            Ctor.prototype = prototype;
            var result = new Ctor;
            return Ctor.prototype = null, result;
        }
        function toPath$1(path) {
            return isArray(path) ? path : [ path ];
        }
        function toPath(path) {
            return _$1.toPath(path);
        }
        function deepGet(obj, path) {
            for (var length = path.length, i = 0; i < length; i++) {
                if (null == obj) return;
                obj = obj[path[i]];
            }
            return length ? obj : void 0;
        }
        function get(object, path, defaultValue) {
            var value = deepGet(object, toPath(path));
            return isUndefined(value) ? defaultValue : value;
        }
        function identity(value) {
            return value;
        }
        function matcher(attrs) {
            return attrs = extendOwn({}, attrs), function(obj) {
                return isMatch(obj, attrs);
            };
        }
        function property(path) {
            return path = toPath(path), function(obj) {
                return deepGet(obj, path);
            };
        }
        function optimizeCb(func, context, argCount) {
            if (void 0 === context) return func;
            switch (null == argCount ? 3 : argCount) {
              case 1:
                return function(value) {
                    return func.call(context, value);
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
        }
        function baseIteratee(value, context, argCount) {
            return null == value ? identity : isFunction$1(value) ? optimizeCb(value, context, argCount) : isObject(value) && !isArray(value) ? matcher(value) : property(value);
        }
        function iteratee(value, context) {
            return baseIteratee(value, context, 1 / 0);
        }
        function cb(value, context, argCount) {
            return _$1.iteratee !== iteratee ? _$1.iteratee(value, context) : baseIteratee(value, context, argCount);
        }
        function noop() {}
        function random(min, max) {
            return null == max && (max = min, min = 0), min + Math.floor(Math.random() * (max - min + 1));
        }
        _$1.toPath = toPath$1, _$1.iteratee = iteratee;
        var now = Date.now || function() {
            return (new Date).getTime();
        };
        function createEscaper(map) {
            var escaper = function(match) {
                return map[match];
            }, source = "(?:" + keys(map).join("|") + ")", testRegexp = RegExp(source), replaceRegexp = RegExp(source, "g");
            return function(string) {
                return string = null == string ? "" : "" + string, testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
            };
        }
        var escapeMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#x27;",
            "`": "&#x60;"
        }, _escape = createEscaper(escapeMap), _unescape = createEscaper(invert(escapeMap)), templateSettings = _$1.templateSettings = {
            evaluate: /<%([\s\S]+?)%>/g,
            interpolate: /<%=([\s\S]+?)%>/g,
            escape: /<%-([\s\S]+?)%>/g
        }, noMatch = /(.)^/, escapes = {
            "'": "'",
            "\\": "\\",
            "\r": "r",
            "\n": "n",
            "\u2028": "u2028",
            "\u2029": "u2029"
        }, escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;
        function escapeChar(match) {
            return "\\" + escapes[match];
        }
        var bareIdentifier = /^\s*(\w|\$)+\s*$/, idCounter = 0;
        function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
            if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
            var self = baseCreate(sourceFunc.prototype), result = sourceFunc.apply(self, args);
            return isObject(result) ? result : self;
        }
        var partial = restArguments((function(func, boundArgs) {
            var placeholder = partial.placeholder, bound = function() {
                for (var position = 0, length = boundArgs.length, args = Array(length), i = 0; i < length; i++) args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
                for (;position < arguments.length; ) args.push(arguments[position++]);
                return executeBound(func, bound, this, this, args);
            };
            return bound;
        }));
        partial.placeholder = _$1;
        var bind = restArguments((function(func, context, args) {
            if (!isFunction$1(func)) throw new TypeError("Bind must be called on a function");
            var bound = restArguments((function(callArgs) {
                return executeBound(func, bound, context, this, args.concat(callArgs));
            }));
            return bound;
        })), isArrayLike = createSizePropertyCheck(getLength);
        function flatten$1(input, depth, strict, output) {
            if (output = output || [], depth || 0 === depth) {
                if (depth <= 0) return output.concat(input);
            } else depth = 1 / 0;
            for (var idx = output.length, i = 0, length = getLength(input); i < length; i++) {
                var value = input[i];
                if (isArrayLike(value) && (isArray(value) || isArguments$1(value))) if (depth > 1) flatten$1(value, depth - 1, strict, output), 
                idx = output.length; else for (var j = 0, len = value.length; j < len; ) output[idx++] = value[j++]; else strict || (output[idx++] = value);
            }
            return output;
        }
        var bindAll = restArguments((function(obj, keys) {
            var index = (keys = flatten$1(keys, !1, !1)).length;
            if (index < 1) throw new Error("bindAll must be passed function names");
            for (;index--; ) {
                var key = keys[index];
                obj[key] = bind(obj[key], obj);
            }
            return obj;
        })), delay = restArguments((function(func, wait, args) {
            return setTimeout((function() {
                return func.apply(null, args);
            }), wait);
        })), defer = partial(delay, _$1, 1);
        function negate(predicate) {
            return function() {
                return !predicate.apply(this, arguments);
            };
        }
        function before(times, func) {
            var memo;
            return function() {
                return --times > 0 && (memo = func.apply(this, arguments)), times <= 1 && (func = null), 
                memo;
            };
        }
        var once = partial(before, 2);
        function findKey(obj, predicate, context) {
            predicate = cb(predicate, context);
            for (var key, _keys = keys(obj), i = 0, length = _keys.length; i < length; i++) if (predicate(obj[key = _keys[i]], key, obj)) return key;
        }
        function createPredicateIndexFinder(dir) {
            return function(array, predicate, context) {
                predicate = cb(predicate, context);
                for (var length = getLength(array), index = dir > 0 ? 0 : length - 1; index >= 0 && index < length; index += dir) if (predicate(array[index], index, array)) return index;
                return -1;
            };
        }
        var findIndex = createPredicateIndexFinder(1), findLastIndex = createPredicateIndexFinder(-1);
        function sortedIndex(array, obj, iteratee, context) {
            for (var value = (iteratee = cb(iteratee, context, 1))(obj), low = 0, high = getLength(array); low < high; ) {
                var mid = Math.floor((low + high) / 2);
                iteratee(array[mid]) < value ? low = mid + 1 : high = mid;
            }
            return low;
        }
        function createIndexFinder(dir, predicateFind, sortedIndex) {
            return function(array, item, idx) {
                var i = 0, length = getLength(array);
                if ("number" == typeof idx) dir > 0 ? i = idx >= 0 ? idx : Math.max(idx + length, i) : length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1; else if (sortedIndex && idx && length) return array[idx = sortedIndex(array, item)] === item ? idx : -1;
                if (item != item) return (idx = predicateFind(slice.call(array, i, length), isNaN$1)) >= 0 ? idx + i : -1;
                for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) if (array[idx] === item) return idx;
                return -1;
            };
        }
        var indexOf = createIndexFinder(1, findIndex, sortedIndex), lastIndexOf = createIndexFinder(-1, findLastIndex);
        function find(obj, predicate, context) {
            var key = (isArrayLike(obj) ? findIndex : findKey)(obj, predicate, context);
            if (void 0 !== key && -1 !== key) return obj[key];
        }
        function each(obj, iteratee, context) {
            var i, length;
            if (iteratee = optimizeCb(iteratee, context), isArrayLike(obj)) for (i = 0, length = obj.length; i < length; i++) iteratee(obj[i], i, obj); else {
                var _keys = keys(obj);
                for (i = 0, length = _keys.length; i < length; i++) iteratee(obj[_keys[i]], _keys[i], obj);
            }
            return obj;
        }
        function map(obj, iteratee, context) {
            iteratee = cb(iteratee, context);
            for (var _keys = !isArrayLike(obj) && keys(obj), length = (_keys || obj).length, results = Array(length), index = 0; index < length; index++) {
                var currentKey = _keys ? _keys[index] : index;
                results[index] = iteratee(obj[currentKey], currentKey, obj);
            }
            return results;
        }
        function createReduce(dir) {
            var reducer = function(obj, iteratee, memo, initial) {
                var _keys = !isArrayLike(obj) && keys(obj), length = (_keys || obj).length, index = dir > 0 ? 0 : length - 1;
                for (initial || (memo = obj[_keys ? _keys[index] : index], index += dir); index >= 0 && index < length; index += dir) {
                    var currentKey = _keys ? _keys[index] : index;
                    memo = iteratee(memo, obj[currentKey], currentKey, obj);
                }
                return memo;
            };
            return function(obj, iteratee, memo, context) {
                var initial = arguments.length >= 3;
                return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
            };
        }
        var reduce = createReduce(1), reduceRight = createReduce(-1);
        function filter(obj, predicate, context) {
            var results = [];
            return predicate = cb(predicate, context), each(obj, (function(value, index, list) {
                predicate(value, index, list) && results.push(value);
            })), results;
        }
        function every(obj, predicate, context) {
            predicate = cb(predicate, context);
            for (var _keys = !isArrayLike(obj) && keys(obj), length = (_keys || obj).length, index = 0; index < length; index++) {
                var currentKey = _keys ? _keys[index] : index;
                if (!predicate(obj[currentKey], currentKey, obj)) return !1;
            }
            return !0;
        }
        function some(obj, predicate, context) {
            predicate = cb(predicate, context);
            for (var _keys = !isArrayLike(obj) && keys(obj), length = (_keys || obj).length, index = 0; index < length; index++) {
                var currentKey = _keys ? _keys[index] : index;
                if (predicate(obj[currentKey], currentKey, obj)) return !0;
            }
            return !1;
        }
        function contains(obj, item, fromIndex, guard) {
            return isArrayLike(obj) || (obj = values(obj)), ("number" != typeof fromIndex || guard) && (fromIndex = 0), 
            indexOf(obj, item, fromIndex) >= 0;
        }
        var invoke = restArguments((function(obj, path, args) {
            var contextPath, func;
            return isFunction$1(path) ? func = path : (path = toPath(path), contextPath = path.slice(0, -1), 
            path = path[path.length - 1]), map(obj, (function(context) {
                var method = func;
                if (!method) {
                    if (contextPath && contextPath.length && (context = deepGet(context, contextPath)), 
                    null == context) return;
                    method = context[path];
                }
                return null == method ? method : method.apply(context, args);
            }));
        }));
        function pluck(obj, key) {
            return map(obj, property(key));
        }
        function max(obj, iteratee, context) {
            var value, computed, result = -1 / 0, lastComputed = -1 / 0;
            if (null == iteratee || "number" == typeof iteratee && "object" != typeof obj[0] && null != obj) for (var i = 0, length = (obj = isArrayLike(obj) ? obj : values(obj)).length; i < length; i++) null != (value = obj[i]) && value > result && (result = value); else iteratee = cb(iteratee, context), 
            each(obj, (function(v, index, list) {
                ((computed = iteratee(v, index, list)) > lastComputed || computed === -1 / 0 && result === -1 / 0) && (result = v, 
                lastComputed = computed);
            }));
            return result;
        }
        var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
        function toArray(obj) {
            return obj ? isArray(obj) ? slice.call(obj) : isString(obj) ? obj.match(reStrSymbol) : isArrayLike(obj) ? map(obj, identity) : values(obj) : [];
        }
        function sample(obj, n, guard) {
            if (null == n || guard) return isArrayLike(obj) || (obj = values(obj)), obj[random(obj.length - 1)];
            var sample = toArray(obj), length = getLength(sample);
            n = Math.max(Math.min(n, length), 0);
            for (var last = length - 1, index = 0; index < n; index++) {
                var rand = random(index, last), temp = sample[index];
                sample[index] = sample[rand], sample[rand] = temp;
            }
            return sample.slice(0, n);
        }
        function group(behavior, partition) {
            return function(obj, iteratee, context) {
                var result = partition ? [ [], [] ] : {};
                return iteratee = cb(iteratee, context), each(obj, (function(value, index) {
                    var key = iteratee(value, index, obj);
                    behavior(result, value, key);
                })), result;
            };
        }
        var groupBy = group((function(result, value, key) {
            has$1(result, key) ? result[key].push(value) : result[key] = [ value ];
        })), indexBy = group((function(result, value, key) {
            result[key] = value;
        })), countBy = group((function(result, value, key) {
            has$1(result, key) ? result[key]++ : result[key] = 1;
        })), partition = group((function(result, value, pass) {
            result[pass ? 0 : 1].push(value);
        }), !0);
        function keyInObj(value, key, obj) {
            return key in obj;
        }
        var pick = restArguments((function(obj, keys) {
            var result = {}, iteratee = keys[0];
            if (null == obj) return result;
            isFunction$1(iteratee) ? (keys.length > 1 && (iteratee = optimizeCb(iteratee, keys[1])), 
            keys = allKeys(obj)) : (iteratee = keyInObj, keys = flatten$1(keys, !1, !1), obj = Object(obj));
            for (var i = 0, length = keys.length; i < length; i++) {
                var key = keys[i], value = obj[key];
                iteratee(value, key, obj) && (result[key] = value);
            }
            return result;
        })), omit = restArguments((function(obj, keys) {
            var context, iteratee = keys[0];
            return isFunction$1(iteratee) ? (iteratee = negate(iteratee), keys.length > 1 && (context = keys[1])) : (keys = map(flatten$1(keys, !1, !1), String), 
            iteratee = function(value, key) {
                return !contains(keys, key);
            }), pick(obj, iteratee, context);
        }));
        function initial(array, n, guard) {
            return slice.call(array, 0, Math.max(0, array.length - (null == n || guard ? 1 : n)));
        }
        function first(array, n, guard) {
            return null == array || array.length < 1 ? null == n || guard ? void 0 : [] : null == n || guard ? array[0] : initial(array, array.length - n);
        }
        function rest(array, n, guard) {
            return slice.call(array, null == n || guard ? 1 : n);
        }
        var difference = restArguments((function(array, rest) {
            return rest = flatten$1(rest, !0, !0), filter(array, (function(value) {
                return !contains(rest, value);
            }));
        })), without = restArguments((function(array, otherArrays) {
            return difference(array, otherArrays);
        }));
        function uniq(array, isSorted, iteratee, context) {
            isBoolean(isSorted) || (context = iteratee, iteratee = isSorted, isSorted = !1), 
            null != iteratee && (iteratee = cb(iteratee, context));
            for (var result = [], seen = [], i = 0, length = getLength(array); i < length; i++) {
                var value = array[i], computed = iteratee ? iteratee(value, i, array) : value;
                isSorted && !iteratee ? (i && seen === computed || result.push(value), seen = computed) : iteratee ? contains(seen, computed) || (seen.push(computed), 
                result.push(value)) : contains(result, value) || result.push(value);
            }
            return result;
        }
        var union = restArguments((function(arrays) {
            return uniq(flatten$1(arrays, !0, !0));
        }));
        function unzip(array) {
            for (var length = array && max(array, getLength).length || 0, result = Array(length), index = 0; index < length; index++) result[index] = pluck(array, index);
            return result;
        }
        var zip = restArguments(unzip);
        function chainResult(instance, obj) {
            return instance._chain ? _$1(obj).chain() : obj;
        }
        function mixin(obj) {
            return each(functions(obj), (function(name) {
                var func = _$1[name] = obj[name];
                _$1.prototype[name] = function() {
                    var args = [ this._wrapped ];
                    return push.apply(args, arguments), chainResult(this, func.apply(_$1, args));
                };
            })), _$1;
        }
        each([ "pop", "push", "reverse", "shift", "sort", "splice", "unshift" ], (function(name) {
            var method = ArrayProto[name];
            _$1.prototype[name] = function() {
                var obj = this._wrapped;
                return null != obj && (method.apply(obj, arguments), "shift" !== name && "splice" !== name || 0 !== obj.length || delete obj[0]), 
                chainResult(this, obj);
            };
        })), each([ "concat", "join", "slice" ], (function(name) {
            var method = ArrayProto[name];
            _$1.prototype[name] = function() {
                var obj = this._wrapped;
                return null != obj && (obj = method.apply(obj, arguments)), chainResult(this, obj);
            };
        }));
        var allExports = {
            __proto__: null,
            VERSION: "1.13.2",
            restArguments: restArguments,
            isObject: isObject,
            isNull: function(obj) {
                return null === obj;
            },
            isUndefined: isUndefined,
            isBoolean: isBoolean,
            isElement: function(obj) {
                return !(!obj || 1 !== obj.nodeType);
            },
            isString: isString,
            isNumber: isNumber,
            isDate: isDate,
            isRegExp: isRegExp,
            isError: isError,
            isSymbol: isSymbol,
            isArrayBuffer: isArrayBuffer,
            isDataView: isDataView$1,
            isArray: isArray,
            isFunction: isFunction$1,
            isArguments: isArguments$1,
            isFinite: function(obj) {
                return !isSymbol(obj) && _isFinite(obj) && !isNaN(parseFloat(obj));
            },
            isNaN: isNaN$1,
            isTypedArray: isTypedArray$1,
            isEmpty: function(obj) {
                if (null == obj) return !0;
                var length = getLength(obj);
                return "number" == typeof length && (isArray(obj) || isString(obj) || isArguments$1(obj)) ? 0 === length : 0 === getLength(keys(obj));
            },
            isMatch: isMatch,
            isEqual: function(a, b) {
                return eq(a, b);
            },
            isMap: isMap,
            isWeakMap: isWeakMap,
            isSet: isSet,
            isWeakSet: isWeakSet,
            keys: keys,
            allKeys: allKeys,
            values: values,
            pairs: function(obj) {
                for (var _keys = keys(obj), length = _keys.length, pairs = Array(length), i = 0; i < length; i++) pairs[i] = [ _keys[i], obj[_keys[i]] ];
                return pairs;
            },
            invert: invert,
            functions: functions,
            methods: functions,
            extend: extend,
            extendOwn: extendOwn,
            assign: extendOwn,
            defaults: defaults,
            create: function(prototype, props) {
                var result = baseCreate(prototype);
                return props && extendOwn(result, props), result;
            },
            clone: function(obj) {
                return isObject(obj) ? isArray(obj) ? obj.slice() : extend({}, obj) : obj;
            },
            tap: function(obj, interceptor) {
                return interceptor(obj), obj;
            },
            get: get,
            has: function(obj, path) {
                for (var length = (path = toPath(path)).length, i = 0; i < length; i++) {
                    var key = path[i];
                    if (!has$1(obj, key)) return !1;
                    obj = obj[key];
                }
                return !!length;
            },
            mapObject: function(obj, iteratee, context) {
                iteratee = cb(iteratee, context);
                for (var _keys = keys(obj), length = _keys.length, results = {}, index = 0; index < length; index++) {
                    var currentKey = _keys[index];
                    results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
                }
                return results;
            },
            identity: identity,
            constant: constant,
            noop: noop,
            toPath: toPath$1,
            property: property,
            propertyOf: function(obj) {
                return null == obj ? noop : function(path) {
                    return get(obj, path);
                };
            },
            matcher: matcher,
            matches: matcher,
            times: function(n, iteratee, context) {
                var accum = Array(Math.max(0, n));
                iteratee = optimizeCb(iteratee, context, 1);
                for (var i = 0; i < n; i++) accum[i] = iteratee(i);
                return accum;
            },
            random: random,
            now: now,
            escape: _escape,
            unescape: _unescape,
            templateSettings: templateSettings,
            template: function(text, settings, oldSettings) {
                !settings && oldSettings && (settings = oldSettings), settings = defaults({}, settings, _$1.templateSettings);
                var matcher = RegExp([ (settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source ].join("|") + "|$", "g"), index = 0, source = "__p+='";
                text.replace(matcher, (function(match, escape, interpolate, evaluate, offset) {
                    return source += text.slice(index, offset).replace(escapeRegExp, escapeChar), index = offset + match.length, 
                    escape ? source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'" : interpolate ? source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'" : evaluate && (source += "';\n" + evaluate + "\n__p+='"), 
                    match;
                })), source += "';\n";
                var render, argument = settings.variable;
                if (argument) {
                    if (!bareIdentifier.test(argument)) throw new Error("variable is not a bare identifier: " + argument);
                } else source = "with(obj||{}){\n" + source + "}\n", argument = "obj";
                source = "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n" + source + "return __p;\n";
                try {
                    render = new Function(argument, "_", source);
                } catch (e) {
                    throw e.source = source, e;
                }
                var template = function(data) {
                    return render.call(this, data, _$1);
                };
                return template.source = "function(" + argument + "){\n" + source + "}", template;
            },
            result: function(obj, path, fallback) {
                var length = (path = toPath(path)).length;
                if (!length) return isFunction$1(fallback) ? fallback.call(obj) : fallback;
                for (var i = 0; i < length; i++) {
                    var prop = null == obj ? void 0 : obj[path[i]];
                    void 0 === prop && (prop = fallback, i = length), obj = isFunction$1(prop) ? prop.call(obj) : prop;
                }
                return obj;
            },
            uniqueId: function(prefix) {
                var id = ++idCounter + "";
                return prefix ? prefix + id : id;
            },
            chain: function(obj) {
                var instance = _$1(obj);
                return instance._chain = !0, instance;
            },
            iteratee: iteratee,
            partial: partial,
            bind: bind,
            bindAll: bindAll,
            memoize: function(func, hasher) {
                var memoize = function(key) {
                    var cache = memoize.cache, address = "" + (hasher ? hasher.apply(this, arguments) : key);
                    return has$1(cache, address) || (cache[address] = func.apply(this, arguments)), 
                    cache[address];
                };
                return memoize.cache = {}, memoize;
            },
            delay: delay,
            defer: defer,
            throttle: function(func, wait, options) {
                var timeout, context, args, result, previous = 0;
                options || (options = {});
                var later = function() {
                    previous = !1 === options.leading ? 0 : now(), timeout = null, result = func.apply(context, args), 
                    timeout || (context = args = null);
                }, throttled = function() {
                    var _now = now();
                    previous || !1 !== options.leading || (previous = _now);
                    var remaining = wait - (_now - previous);
                    return context = this, args = arguments, remaining <= 0 || remaining > wait ? (timeout && (clearTimeout(timeout), 
                    timeout = null), previous = _now, result = func.apply(context, args), timeout || (context = args = null)) : timeout || !1 === options.trailing || (timeout = setTimeout(later, remaining)), 
                    result;
                };
                return throttled.cancel = function() {
                    clearTimeout(timeout), previous = 0, timeout = context = args = null;
                }, throttled;
            },
            debounce: function(func, wait, immediate) {
                var timeout, previous, args, result, context, later = function() {
                    var passed = now() - previous;
                    wait > passed ? timeout = setTimeout(later, wait - passed) : (timeout = null, immediate || (result = func.apply(context, args)), 
                    timeout || (args = context = null));
                }, debounced = restArguments((function(_args) {
                    return context = this, args = _args, previous = now(), timeout || (timeout = setTimeout(later, wait), 
                    immediate && (result = func.apply(context, args))), result;
                }));
                return debounced.cancel = function() {
                    clearTimeout(timeout), timeout = args = context = null;
                }, debounced;
            },
            wrap: function(func, wrapper) {
                return partial(wrapper, func);
            },
            negate: negate,
            compose: function() {
                var args = arguments, start = args.length - 1;
                return function() {
                    for (var i = start, result = args[start].apply(this, arguments); i--; ) result = args[i].call(this, result);
                    return result;
                };
            },
            after: function(times, func) {
                return function() {
                    if (--times < 1) return func.apply(this, arguments);
                };
            },
            before: before,
            once: once,
            findKey: findKey,
            findIndex: findIndex,
            findLastIndex: findLastIndex,
            sortedIndex: sortedIndex,
            indexOf: indexOf,
            lastIndexOf: lastIndexOf,
            find: find,
            detect: find,
            findWhere: function(obj, attrs) {
                return find(obj, matcher(attrs));
            },
            each: each,
            forEach: each,
            map: map,
            collect: map,
            reduce: reduce,
            foldl: reduce,
            inject: reduce,
            reduceRight: reduceRight,
            foldr: reduceRight,
            filter: filter,
            select: filter,
            reject: function(obj, predicate, context) {
                return filter(obj, negate(cb(predicate)), context);
            },
            every: every,
            all: every,
            some: some,
            any: some,
            contains: contains,
            includes: contains,
            include: contains,
            invoke: invoke,
            pluck: pluck,
            where: function(obj, attrs) {
                return filter(obj, matcher(attrs));
            },
            max: max,
            min: function(obj, iteratee, context) {
                var value, computed, result = 1 / 0, lastComputed = 1 / 0;
                if (null == iteratee || "number" == typeof iteratee && "object" != typeof obj[0] && null != obj) for (var i = 0, length = (obj = isArrayLike(obj) ? obj : values(obj)).length; i < length; i++) null != (value = obj[i]) && value < result && (result = value); else iteratee = cb(iteratee, context), 
                each(obj, (function(v, index, list) {
                    ((computed = iteratee(v, index, list)) < lastComputed || computed === 1 / 0 && result === 1 / 0) && (result = v, 
                    lastComputed = computed);
                }));
                return result;
            },
            shuffle: function(obj) {
                return sample(obj, 1 / 0);
            },
            sample: sample,
            sortBy: function(obj, iteratee, context) {
                var index = 0;
                return iteratee = cb(iteratee, context), pluck(map(obj, (function(value, key, list) {
                    return {
                        value: value,
                        index: index++,
                        criteria: iteratee(value, key, list)
                    };
                })).sort((function(left, right) {
                    var a = left.criteria, b = right.criteria;
                    if (a !== b) {
                        if (a > b || void 0 === a) return 1;
                        if (a < b || void 0 === b) return -1;
                    }
                    return left.index - right.index;
                })), "value");
            },
            groupBy: groupBy,
            indexBy: indexBy,
            countBy: countBy,
            partition: partition,
            toArray: toArray,
            size: function(obj) {
                return null == obj ? 0 : isArrayLike(obj) ? obj.length : keys(obj).length;
            },
            pick: pick,
            omit: omit,
            first: first,
            head: first,
            take: first,
            initial: initial,
            last: function(array, n, guard) {
                return null == array || array.length < 1 ? null == n || guard ? void 0 : [] : null == n || guard ? array[array.length - 1] : rest(array, Math.max(0, array.length - n));
            },
            rest: rest,
            tail: rest,
            drop: rest,
            compact: function(array) {
                return filter(array, Boolean);
            },
            flatten: function(array, depth) {
                return flatten$1(array, depth, !1);
            },
            without: without,
            uniq: uniq,
            unique: uniq,
            union: union,
            intersection: function(array) {
                for (var result = [], argsLength = arguments.length, i = 0, length = getLength(array); i < length; i++) {
                    var item = array[i];
                    if (!contains(result, item)) {
                        var j;
                        for (j = 1; j < argsLength && contains(arguments[j], item); j++) ;
                        j === argsLength && result.push(item);
                    }
                }
                return result;
            },
            difference: difference,
            unzip: unzip,
            transpose: unzip,
            zip: zip,
            object: function(list, values) {
                for (var result = {}, i = 0, length = getLength(list); i < length; i++) values ? result[list[i]] = values[i] : result[list[i][0]] = list[i][1];
                return result;
            },
            range: function(start, stop, step) {
                null == stop && (stop = start || 0, start = 0), step || (step = stop < start ? -1 : 1);
                for (var length = Math.max(Math.ceil((stop - start) / step), 0), range = Array(length), idx = 0; idx < length; idx++, 
                start += step) range[idx] = start;
                return range;
            },
            chunk: function(array, count) {
                if (null == count || count < 1) return [];
                for (var result = [], i = 0, length = array.length; i < length; ) result.push(slice.call(array, i, i += count));
                return result;
            },
            mixin: mixin,
            default: _$1
        }, _ = mixin(allExports);
        return _._ = _, _;
    }, module.exports = factory();
}
