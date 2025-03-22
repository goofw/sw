function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(it, $keyword, $ruleType) {
        var out = " ", $schema = it.schema[$keyword], $errSchemaPath = it.errSchemaPath + "/" + $keyword, $comment = (it.opts.allErrors, 
        it.util.toQuotedString($schema));
        return !0 === it.opts.$comment ? out += " console.log(" + $comment + ");" : "function" == typeof it.opts.$comment && (out += " self._opts.$comment(" + $comment + ", " + it.util.toQuotedString($errSchemaPath) + ", validate.root.schema);"), 
        out;
    };
}
