function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(it, $keyword, $ruleType) {
        var $schemaValue, out = " ", $lvl = it.level, $dataLvl = it.dataLevel, $schema = it.schema[$keyword], $schemaPath = it.schemaPath + it.util.getProperty($keyword), $errSchemaPath = it.errSchemaPath + "/" + $keyword, $breakOnError = !it.opts.allErrors, $data = "data" + ($dataLvl || ""), $isData = it.opts.$data && $schema && $schema.$data;
        $isData ? (out += " var schema" + $lvl + " = " + it.util.getData($schema.$data, $dataLvl, it.dataPathArr) + "; ", 
        $schemaValue = "schema" + $lvl) : $schemaValue = $schema, out += "var division" + $lvl + ";if (", 
        $isData && (out += " " + $schemaValue + " !== undefined && ( typeof " + $schemaValue + " != 'number' || "), 
        out += " (division" + $lvl + " = " + $data + " / " + $schemaValue + ", ", it.opts.multipleOfPrecision ? out += " Math.abs(Math.round(division" + $lvl + ") - division" + $lvl + ") > 1e-" + it.opts.multipleOfPrecision + " " : out += " division" + $lvl + " !== parseInt(division" + $lvl + ") ", 
        out += " ) ", $isData && (out += "  )  "), out += " ) {   ";
        var $$outStack = $$outStack || [];
        $$outStack.push(out), out = "", !1 !== it.createErrors ? (out += " { keyword: 'multipleOf' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { multipleOf: " + $schemaValue + " } ", 
        !1 !== it.opts.messages && (out += " , message: 'should be multiple of ", out += $isData ? "' + " + $schemaValue : $schemaValue + "'"), 
        it.opts.verbose && (out += " , schema:  ", out += $isData ? "validate.schema" + $schemaPath : "" + $schema, 
        out += "         , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " "), 
        out += " } ") : out += " {} ";
        var __err = out;
        return out = $$outStack.pop(), !it.compositeRule && $breakOnError ? it.async ? out += " throw new ValidationError([" + __err + "]); " : out += " validate.errors = [" + __err + "]; return false; " : out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", 
        out += "} ", $breakOnError && (out += " else { "), out;
    };
}
