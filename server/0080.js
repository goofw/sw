function(module, exports, __webpack_require__) {
    "use strict";
    function checkDataType(dataType, data, negate) {
        var EQUAL = negate ? " !== " : " === ", AND = negate ? " || " : " && ", OK = negate ? "!" : "", NOT = negate ? "" : "!";
        switch (dataType) {
          case "null":
            return data + EQUAL + "null";

          case "array":
            return OK + "Array.isArray(" + data + ")";

          case "object":
            return "(" + OK + data + AND + "typeof " + data + EQUAL + '"object"' + AND + NOT + "Array.isArray(" + data + "))";

          case "integer":
            return "(typeof " + data + EQUAL + '"number"' + AND + NOT + "(" + data + " % 1)" + AND + data + EQUAL + data + ")";

          default:
            return "typeof " + data + EQUAL + '"' + dataType + '"';
        }
    }
    module.exports = {
        copy: function(o, to) {
            for (var key in to = to || {}, o) to[key] = o[key];
            return to;
        },
        checkDataType: checkDataType,
        checkDataTypes: function(dataTypes, data) {
            if (1 === dataTypes.length) return checkDataType(dataTypes[0], data, !0);
            var code = "", types = toHash(dataTypes);
            for (var t in types.array && types.object && (code = types.null ? "(" : "(!" + data + " || ", 
            code += "typeof " + data + ' !== "object")', delete types.null, delete types.array, 
            delete types.object), types.number && delete types.integer, types) code += (code ? " && " : "") + checkDataType(t, data, !0);
            return code;
        },
        coerceToTypes: function(optionCoerceTypes, dataTypes) {
            if (Array.isArray(dataTypes)) {
                for (var types = [], i = 0; i < dataTypes.length; i++) {
                    var t = dataTypes[i];
                    (COERCE_TO_TYPES[t] || "array" === optionCoerceTypes && "array" === t) && (types[types.length] = t);
                }
                if (types.length) return types;
            } else {
                if (COERCE_TO_TYPES[dataTypes]) return [ dataTypes ];
                if ("array" === optionCoerceTypes && "array" === dataTypes) return [ "array" ];
            }
        },
        toHash: toHash,
        getProperty: getProperty,
        escapeQuotes: escapeQuotes,
        equal: __webpack_require__(238),
        ucs2length: __webpack_require__(1084),
        varOccurences: function(str, dataVar) {
            dataVar += "[^0-9]";
            var matches = str.match(new RegExp(dataVar, "g"));
            return matches ? matches.length : 0;
        },
        varReplace: function(str, dataVar, expr) {
            return dataVar += "([^0-9])", expr = expr.replace(/\$/g, "$$$$"), str.replace(new RegExp(dataVar, "g"), expr + "$1");
        },
        cleanUpCode: function(out) {
            return out.replace(EMPTY_ELSE, "").replace(EMPTY_IF_NO_ELSE, "").replace(EMPTY_IF_WITH_ELSE, "if (!($1))");
        },
        finalCleanUpCode: function(out, async) {
            var matches = out.match(ERRORS_REGEXP);
            return matches && 2 == matches.length && (out = async ? out.replace(REMOVE_ERRORS_ASYNC, "").replace(RETURN_ASYNC, "return data;") : out.replace(REMOVE_ERRORS, "").replace("return errors === 0;", "validate.errors = null; return true;")), 
            (matches = out.match(ROOTDATA_REGEXP)) && 3 === matches.length ? out.replace(REMOVE_ROOTDATA, "") : out;
        },
        schemaHasRules: function(schema, rules) {
            if ("boolean" == typeof schema) return !schema;
            for (var key in schema) if (rules[key]) return !0;
        },
        schemaHasRulesExcept: function(schema, rules, exceptKeyword) {
            if ("boolean" == typeof schema) return !schema && "not" != exceptKeyword;
            for (var key in schema) if (key != exceptKeyword && rules[key]) return !0;
        },
        schemaUnknownRules: function(schema, rules) {
            if ("boolean" != typeof schema) for (var key in schema) if (!rules[key]) return key;
        },
        toQuotedString: toQuotedString,
        getPathExpr: function(currentPath, expr, jsonPointers, isNumber) {
            return joinPaths(currentPath, jsonPointers ? "'/' + " + expr + (isNumber ? "" : ".replace(/~/g, '~0').replace(/\\//g, '~1')") : isNumber ? "'[' + " + expr + " + ']'" : "'[\\'' + " + expr + " + '\\']'");
        },
        getPath: function(currentPath, prop, jsonPointers) {
            return joinPaths(currentPath, toQuotedString(jsonPointers ? "/" + escapeJsonPointer(prop) : getProperty(prop)));
        },
        getData: function($data, lvl, paths) {
            var up, jsonPointer, data, matches;
            if ("" === $data) return "rootData";
            if ("/" == $data[0]) {
                if (!JSON_POINTER.test($data)) throw new Error("Invalid JSON-pointer: " + $data);
                jsonPointer = $data, data = "rootData";
            } else {
                if (!(matches = $data.match(RELATIVE_JSON_POINTER))) throw new Error("Invalid JSON-pointer: " + $data);
                if (up = +matches[1], "#" == (jsonPointer = matches[2])) {
                    if (up >= lvl) throw new Error("Cannot access property/index " + up + " levels up, current level is " + lvl);
                    return paths[lvl - up];
                }
                if (up > lvl) throw new Error("Cannot access data " + up + " levels up, current level is " + lvl);
                if (data = "data" + (lvl - up || ""), !jsonPointer) return data;
            }
            for (var expr = data, segments = jsonPointer.split("/"), i = 0; i < segments.length; i++) {
                var segment = segments[i];
                segment && (expr += " && " + (data += getProperty(unescapeJsonPointer(segment))));
            }
            return expr;
        },
        unescapeFragment: function(str) {
            return unescapeJsonPointer(decodeURIComponent(str));
        },
        unescapeJsonPointer: unescapeJsonPointer,
        escapeFragment: function(str) {
            return encodeURIComponent(escapeJsonPointer(str));
        },
        escapeJsonPointer: escapeJsonPointer
    };
    var COERCE_TO_TYPES = toHash([ "string", "number", "integer", "boolean", "null" ]);
    function toHash(arr) {
        for (var hash = {}, i = 0; i < arr.length; i++) hash[arr[i]] = !0;
        return hash;
    }
    var IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i, SINGLE_QUOTE = /'|\\/g;
    function getProperty(key) {
        return "number" == typeof key ? "[" + key + "]" : IDENTIFIER.test(key) ? "." + key : "['" + escapeQuotes(key) + "']";
    }
    function escapeQuotes(str) {
        return str.replace(SINGLE_QUOTE, "\\$&").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\f/g, "\\f").replace(/\t/g, "\\t");
    }
    var EMPTY_ELSE = /else\s*{\s*}/g, EMPTY_IF_NO_ELSE = /if\s*\([^)]+\)\s*\{\s*\}(?!\s*else)/g, EMPTY_IF_WITH_ELSE = /if\s*\(([^)]+)\)\s*\{\s*\}\s*else(?!\s*if)/g, ERRORS_REGEXP = /[^v.]errors/g, REMOVE_ERRORS = /var errors = 0;|var vErrors = null;|validate.errors = vErrors;/g, REMOVE_ERRORS_ASYNC = /var errors = 0;|var vErrors = null;/g, RETURN_ASYNC = /if \(errors === 0\) return data;\s*else throw new ValidationError\(vErrors\);/, ROOTDATA_REGEXP = /[^A-Za-z_$]rootData[^A-Za-z0-9_$]/g, REMOVE_ROOTDATA = /if \(rootData === undefined\) rootData = data;/;
    function toQuotedString(str) {
        return "'" + escapeQuotes(str) + "'";
    }
    var JSON_POINTER = /^\/(?:[^~]|~0|~1)*$/, RELATIVE_JSON_POINTER = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
    function joinPaths(a, b) {
        return '""' == a ? b : (a + " + " + b).replace(/' \+ '/g, "");
    }
    function escapeJsonPointer(str) {
        return str.replace(/~/g, "~0").replace(/\//g, "~1");
    }
    function unescapeJsonPointer(str) {
        return str.replace(/~1/g, "/").replace(/~0/g, "~");
    }
}
