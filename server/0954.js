function(module, exports, __webpack_require__) {
    var sprintf = __webpack_require__(224).sprintf, utils = __webpack_require__(448), SyntaxError = __webpack_require__(955).SyntaxError, _cache = {}, RE = new RegExp("('[^']*'|\"[^\"]*\"|::|//?|\\.\\.|\\(\\)|[/.*:\\[\\]\\(\\)@=])|((?:\\{[^}]+\\})?[^/\\[\\]\\(\\)@=\\s]+)|\\s+", "g"), xpath_tokenizer = utils.findall.bind(null, RE), ops = {
        "": function(next, token) {
            var tag = token[0];
            return function(context, result) {
                var i, len, rv = [];
                for (i = 0, len = result.length; i < len; i++) result[i]._children.forEach((function(e) {
                    e.tag === tag && rv.push(e);
                }));
                return rv;
            };
        },
        "*": function(next, token) {
            return function(context, result) {
                var i, len, rv = [];
                for (i = 0, len = result.length; i < len; i++) result[i]._children.forEach((function(e) {
                    rv.push(e);
                }));
                return rv;
            };
        },
        ".": function(next, token) {
            return function(context, result) {
                var i, len, elem, rv = [];
                for (i = 0, len = result.length; i < len; i++) elem = result[i], rv.push(elem);
                return rv;
            };
        },
        "..": function(next, token) {
            return function(context, result) {
                var i, len, elem, rv = [], parent_map = context.parent_map;
                for (parent_map || (context.parent_map = parent_map = {}, context.root.iter(null, (function(p) {
                    p._children.forEach((function(e) {
                        parent_map[e] = p;
                    }));
                }))), i = 0, len = result.length; i < len; i++) elem = result[i], parent_map.hasOwnProperty(elem) && rv.push(parent_map[elem]);
                return rv;
            };
        },
        "//": function(next, token) {
            var tag;
            if ("*" === (token = next())[1]) tag = "*"; else {
                if (token[1]) throw new SyntaxError(token);
                tag = token[0] || "";
            }
            return function(context, result) {
                var i, len, elem, rv = [];
                for (i = 0, len = result.length; i < len; i++) (elem = result[i]).iter(tag, (function(e) {
                    e !== elem && rv.push(e);
                }));
                return rv;
            };
        },
        "[": function(next, token) {
            var tag, key, value, select;
            if ("@" === (token = next())[1]) {
                if ((token = next())[1]) throw new SyntaxError(token, "Invalid attribute predicate");
                if (key = token[0], "]" === (token = next())[1]) select = function(context, result) {
                    var i, len, elem, rv = [];
                    for (i = 0, len = result.length; i < len; i++) (elem = result[i]).get(key) && rv.push(elem);
                    return rv;
                }; else if ("=" === token[1]) {
                    if ('"' !== (value = next()[1])[0] && "'" !== value[value.length - 1]) throw new SyntaxError(token, "Ivalid comparison target");
                    value = value.slice(1, value.length - 1), token = next(), select = function(context, result) {
                        var i, len, elem, rv = [];
                        for (i = 0, len = result.length; i < len; i++) (elem = result[i]).get(key) === value && rv.push(elem);
                        return rv;
                    };
                }
                if ("]" !== token[1]) throw new SyntaxError(token, "Invalid attribute predicate");
            } else {
                if (token[1]) throw new SyntaxError(null, "Invalid predicate");
                if (tag = token[0] || "", "]" !== (token = next())[1]) throw new SyntaxError(token, "Invalid node predicate");
                select = function(context, result) {
                    var i, len, elem, rv = [];
                    for (i = 0, len = result.length; i < len; i++) (elem = result[i]).find(tag) && rv.push(elem);
                    return rv;
                };
            }
            return select;
        }
    };
    function _SelectorContext(root) {
        this.parent_map = null, this.root = root;
    }
    function findall(elem, path) {
        var selector, result, i, len, token, value, select, context;
        if (_cache.hasOwnProperty(path)) selector = _cache[path]; else {
            if (Object.keys(_cache).length > 100 && (_cache = {}), "/" === path.charAt(0)) throw new SyntaxError(null, "Cannot use absolute path on element");
            function getToken() {
                return result.shift();
            }
            for (result = xpath_tokenizer(path), selector = [], token = getToken(); ;) {
                var c = token[1] || "";
                if (!(value = ops[c](getToken, token))) throw new SyntaxError(null, sprintf("Invalid path: %s", path));
                if (selector.push(value), !(token = getToken())) break;
                if ("/" === token[1] && (token = getToken()), !token) break;
            }
            _cache[path] = selector;
        }
        for (result = [ elem ], context = new _SelectorContext(elem), i = 0, len = selector.length; i < len; i++) select = selector[i], 
        result = select(context, result);
        return result || [];
    }
    exports.find = function(element, path) {
        var resultElements = findall(element, path);
        return resultElements && resultElements.length > 0 ? resultElements[0] : null;
    }, exports.findall = findall, exports.findtext = function(element, path, defvalue) {
        var resultElements = findall(element, path);
        return resultElements && resultElements.length > 0 ? resultElements[0].text : defvalue;
    };
}
