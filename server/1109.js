function(module, exports, __webpack_require__) {
    "use strict";
    var KEYWORDS = [ "multipleOf", "maximum", "exclusiveMaximum", "minimum", "exclusiveMinimum", "maxLength", "minLength", "pattern", "additionalItems", "maxItems", "minItems", "uniqueItems", "maxProperties", "minProperties", "required", "additionalProperties", "enum", "format", "const" ];
    module.exports = function(metaSchema, keywordsJsonPointers) {
        for (var i = 0; i < keywordsJsonPointers.length; i++) {
            metaSchema = JSON.parse(JSON.stringify(metaSchema));
            var j, segments = keywordsJsonPointers[i].split("/"), keywords = metaSchema;
            for (j = 1; j < segments.length; j++) keywords = keywords[segments[j]];
            for (j = 0; j < KEYWORDS.length; j++) {
                var key = KEYWORDS[j], schema = keywords[key];
                schema && (keywords[key] = {
                    anyOf: [ schema, {
                        $ref: "https://raw.githubusercontent.com/epoberezkin/ajv/master/lib/refs/data.json#"
                    } ]
                });
            }
        }
        return metaSchema;
    };
}
