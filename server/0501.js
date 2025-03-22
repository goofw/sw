function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(it, $keyword, $ruleType) {
        var $schemaValue, out = " ", $lvl = it.level, $dataLvl = it.dataLevel, $schema = it.schema[$keyword], $schemaPath = it.schemaPath + it.util.getProperty($keyword), $errSchemaPath = it.errSchemaPath + "/" + $keyword, $breakOnError = !it.opts.allErrors, $data = "data" + ($dataLvl || ""), $isData = it.opts.$data && $schema && $schema.$data;
        $isData ? (out += " var schema" + $lvl + " = " + it.util.getData($schema.$data, $dataLvl, it.dataPathArr) + "; ", 
        $schemaValue = "schema" + $lvl) : $schemaValue = $schema;
        var $op = "maxLength" == $keyword ? ">" : "<";
        out += "if ( ", $isData && (out += " (" + $schemaValue + " !== undefined && typeof " + $schemaValue + " != 'number') || "), 
        !1 === it.opts.unicode ? out += " " + $data + ".length " : out += " ucs2length(" + $data + ") ", 
        out += " " + $op + " " + $schemaValue + ") { ";
        var $errorKeyword = $keyword, $$outStack = $$outStack || [];
        $$outStack.push(out), out = "", !1 !== it.createErrors ? (out += " { keyword: '" + ($errorKeyword || "_limitLength") + "' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { limit: " + $schemaValue + " } ", 
        !1 !== it.opts.messages && (out += " , message: 'should NOT be ", out += "maxLength" == $keyword ? "longer" : "shorter", 
        out += " than ", out += $isData ? "' + " + $schemaValue + " + '" : "" + $schema, 
        out += " characters' "), it.opts.verbose && (out += " , schema:  ", out += $isData ? "validate.schema" + $schemaPath : "" + $schema, 
        out += "         , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " "), 
        out += " } ") : out += " {} ";
        var __err = out;
        return out = $$outStack.pop(), !it.compositeRule && $breakOnError ? it.async ? out += " throw new ValidationError([" + __err + "]); " : out += " validate.errors = [" + __err + "]; return false; " : out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", 
        out += "} ", $breakOnError && (out += " else { "), out;
    };
}
