function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(it, $keyword, $ruleType) {
        var out = " ", $lvl = it.level, $dataLvl = it.dataLevel, $schema = it.schema[$keyword], $schemaPath = it.schemaPath + it.util.getProperty($keyword), $errSchemaPath = it.errSchemaPath + "/" + $keyword, $breakOnError = !it.opts.allErrors, $data = "data" + ($dataLvl || ""), $errs = "errs__" + $lvl, $it = it.util.copy(it);
        $it.level++;
        var $nextValid = "valid" + $it.level;
        if (out += "var " + $errs + " = errors;", it.util.schemaHasRules($schema, it.RULES.all)) {
            $it.schema = $schema, $it.schemaPath = $schemaPath, $it.errSchemaPath = $errSchemaPath;
            var $key = "key" + $lvl, $idx = "idx" + $lvl, $i = "i" + $lvl, $invalidName = "' + " + $key + " + '", $nextData = "data" + ($it.dataLevel = it.dataLevel + 1), $dataProperties = "dataProperties" + $lvl, $ownProperties = it.opts.ownProperties, $currentBaseId = it.baseId;
            $ownProperties && (out += " var " + $dataProperties + " = undefined; "), out += $ownProperties ? " " + $dataProperties + " = " + $dataProperties + " || Object.keys(" + $data + "); for (var " + $idx + "=0; " + $idx + "<" + $dataProperties + ".length; " + $idx + "++) { var " + $key + " = " + $dataProperties + "[" + $idx + "]; " : " for (var " + $key + " in " + $data + ") { ", 
            out += " var startErrs" + $lvl + " = errors; ";
            var $passData = $key, $wasComposite = it.compositeRule;
            it.compositeRule = $it.compositeRule = !0;
            var $code = it.validate($it);
            $it.baseId = $currentBaseId, it.util.varOccurences($code, $nextData) < 2 ? out += " " + it.util.varReplace($code, $nextData, $passData) + " " : out += " var " + $nextData + " = " + $passData + "; " + $code + " ", 
            it.compositeRule = $it.compositeRule = $wasComposite, out += " if (!" + $nextValid + ") { for (var " + $i + "=startErrs" + $lvl + "; " + $i + "<errors; " + $i + "++) { vErrors[" + $i + "].propertyName = " + $key + "; }   var err =   ", 
            !1 !== it.createErrors ? (out += " { keyword: 'propertyNames' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { propertyName: '" + $invalidName + "' } ", 
            !1 !== it.opts.messages && (out += " , message: 'property name \\'" + $invalidName + "\\' is invalid' "), 
            it.opts.verbose && (out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " "), 
            out += " } ") : out += " {} ", out += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", 
            !it.compositeRule && $breakOnError && (it.async ? out += " throw new ValidationError(vErrors); " : out += " validate.errors = vErrors; return false; "), 
            $breakOnError && (out += " break; "), out += " } }";
        }
        return $breakOnError && (out += "  if (" + $errs + " == errors) {"), it.util.cleanUpCode(out);
    };
}
