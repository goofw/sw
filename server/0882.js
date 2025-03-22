function(module, exports, __webpack_require__) {
    "use strict";
    var ruleModules = __webpack_require__(1089), toHash = __webpack_require__(80).toHash;
    module.exports = function() {
        var RULES = [ {
            type: "number",
            rules: [ {
                maximum: [ "exclusiveMaximum" ]
            }, {
                minimum: [ "exclusiveMinimum" ]
            }, "multipleOf", "format" ]
        }, {
            type: "string",
            rules: [ "maxLength", "minLength", "pattern", "format" ]
        }, {
            type: "array",
            rules: [ "maxItems", "minItems", "items", "contains", "uniqueItems" ]
        }, {
            type: "object",
            rules: [ "maxProperties", "minProperties", "required", "dependencies", "propertyNames", {
                properties: [ "additionalProperties", "patternProperties" ]
            } ]
        }, {
            rules: [ "$ref", "const", "enum", "not", "anyOf", "oneOf", "allOf", "if" ]
        } ], ALL = [ "type", "$comment" ];
        return RULES.all = toHash(ALL), RULES.types = toHash([ "number", "integer", "string", "array", "object", "boolean", "null" ]), 
        RULES.forEach((function(group) {
            group.rules = group.rules.map((function(keyword) {
                var implKeywords;
                if ("object" == typeof keyword) {
                    var key = Object.keys(keyword)[0];
                    implKeywords = keyword[key], keyword = key, implKeywords.forEach((function(k) {
                        ALL.push(k), RULES.all[k] = !0;
                    }));
                }
                return ALL.push(keyword), RULES.all[keyword] = {
                    keyword: keyword,
                    code: ruleModules[keyword],
                    implements: implKeywords
                };
            })), RULES.all.$comment = {
                keyword: "$comment",
                code: ruleModules.$comment
            }, group.type && (RULES.types[group.type] = group);
        })), RULES.keywords = toHash(ALL.concat([ "$schema", "$id", "id", "$data", "$async", "title", "description", "default", "definitions", "examples", "readOnly", "writeOnly", "contentMediaType", "contentEncoding", "additionalItems", "then", "else" ])), 
        RULES.custom = {}, RULES;
    };
}
