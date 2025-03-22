function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(it, $keyword, $ruleType) {
        var out = " ", $schema = it.schema[$keyword], $schemaPath = it.schemaPath + it.util.getProperty($keyword), $errSchemaPath = it.errSchemaPath + "/" + $keyword, $breakOnError = !it.opts.allErrors, $it = it.util.copy(it), $closingBraces = "";
        $it.level++;
        var $nextValid = "valid" + $it.level, $currentBaseId = $it.baseId, $allSchemasEmpty = !0, arr1 = $schema;
        if (arr1) for (var $sch, $i = -1, l1 = arr1.length - 1; $i < l1; ) $sch = arr1[$i += 1], 
        it.util.schemaHasRules($sch, it.RULES.all) && ($allSchemasEmpty = !1, $it.schema = $sch, 
        $it.schemaPath = $schemaPath + "[" + $i + "]", $it.errSchemaPath = $errSchemaPath + "/" + $i, 
        out += "  " + it.validate($it) + " ", $it.baseId = $currentBaseId, $breakOnError && (out += " if (" + $nextValid + ") { ", 
        $closingBraces += "}"));
        return $breakOnError && (out += $allSchemasEmpty ? " if (true) { " : " " + $closingBraces.slice(0, -1) + " "), 
        it.util.cleanUpCode(out);
    };
}
