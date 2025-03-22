function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(it, $keyword, $ruleType) {
        var out = " ", $lvl = it.level, $dataLvl = it.dataLevel, $schema = it.schema[$keyword], $schemaPath = it.schemaPath + it.util.getProperty($keyword), $errSchemaPath = it.errSchemaPath + "/" + $keyword, $breakOnError = !it.opts.allErrors, $data = "data" + ($dataLvl || ""), $valid = "valid" + $lvl, $errs = "errs__" + $lvl, $it = it.util.copy(it), $closingBraces = "";
        $it.level++;
        var $nextValid = "valid" + $it.level, $currentBaseId = $it.baseId, $prevValid = "prevValid" + $lvl, $passingSchemas = "passingSchemas" + $lvl;
        out += "var " + $errs + " = errors , " + $prevValid + " = false , " + $valid + " = false , " + $passingSchemas + " = null; ";
        var $wasComposite = it.compositeRule;
        it.compositeRule = $it.compositeRule = !0;
        var arr1 = $schema;
        if (arr1) for (var $sch, $i = -1, l1 = arr1.length - 1; $i < l1; ) $sch = arr1[$i += 1], 
        it.util.schemaHasRules($sch, it.RULES.all) ? ($it.schema = $sch, $it.schemaPath = $schemaPath + "[" + $i + "]", 
        $it.errSchemaPath = $errSchemaPath + "/" + $i, out += "  " + it.validate($it) + " ", 
        $it.baseId = $currentBaseId) : out += " var " + $nextValid + " = true; ", $i && (out += " if (" + $nextValid + " && " + $prevValid + ") { " + $valid + " = false; " + $passingSchemas + " = [" + $passingSchemas + ", " + $i + "]; } else { ", 
        $closingBraces += "}"), out += " if (" + $nextValid + ") { " + $valid + " = " + $prevValid + " = true; " + $passingSchemas + " = " + $i + "; }";
        return it.compositeRule = $it.compositeRule = $wasComposite, out += $closingBraces + "if (!" + $valid + ") {   var err =   ", 
        !1 !== it.createErrors ? (out += " { keyword: 'oneOf' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { passingSchemas: " + $passingSchemas + " } ", 
        !1 !== it.opts.messages && (out += " , message: 'should match exactly one schema in oneOf' "), 
        it.opts.verbose && (out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " "), 
        out += " } ") : out += " {} ", out += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", 
        !it.compositeRule && $breakOnError && (it.async ? out += " throw new ValidationError(vErrors); " : out += " validate.errors = vErrors; return false; "), 
        out += "} else {  errors = " + $errs + "; if (vErrors !== null) { if (" + $errs + ") vErrors.length = " + $errs + "; else vErrors = null; }", 
        it.opts.allErrors && (out += " } "), out;
    };
}
