function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(it, $keyword, $ruleType) {
        var $schemaValue, out = " ", $lvl = it.level, $dataLvl = it.dataLevel, $schema = it.schema[$keyword], $schemaPath = it.schemaPath + it.util.getProperty($keyword), $errSchemaPath = it.errSchemaPath + "/" + $keyword, $breakOnError = !it.opts.allErrors, $data = "data" + ($dataLvl || ""), $isData = it.opts.$data && $schema && $schema.$data;
        $isData ? (out += " var schema" + $lvl + " = " + it.util.getData($schema.$data, $dataLvl, it.dataPathArr) + "; ", 
        $schemaValue = "schema" + $lvl) : $schemaValue = $schema;
        var $isMax = "maximum" == $keyword, $exclusiveKeyword = $isMax ? "exclusiveMaximum" : "exclusiveMinimum", $schemaExcl = it.schema[$exclusiveKeyword], $isDataExcl = it.opts.$data && $schemaExcl && $schemaExcl.$data, $op = $isMax ? "<" : ">", $notOp = $isMax ? ">" : "<", $errorKeyword = void 0;
        if ($isDataExcl) {
            var $$outStack, $schemaValueExcl = it.util.getData($schemaExcl.$data, $dataLvl, it.dataPathArr), $exclusive = "exclusive" + $lvl, $exclType = "exclType" + $lvl, $exclIsNumber = "exclIsNumber" + $lvl, $opStr = "' + " + ($opExpr = "op" + $lvl) + " + '";
            out += " var schemaExcl" + $lvl + " = " + $schemaValueExcl + "; ", out += " var " + $exclusive + "; var " + $exclType + " = typeof " + ($schemaValueExcl = "schemaExcl" + $lvl) + "; if (" + $exclType + " != 'boolean' && " + $exclType + " != 'undefined' && " + $exclType + " != 'number') { ", 
            $errorKeyword = $exclusiveKeyword, ($$outStack = $$outStack || []).push(out), out = "", 
            !1 !== it.createErrors ? (out += " { keyword: '" + ($errorKeyword || "_exclusiveLimit") + "' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: {} ", 
            !1 !== it.opts.messages && (out += " , message: '" + $exclusiveKeyword + " should be boolean' "), 
            it.opts.verbose && (out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " "), 
            out += " } ") : out += " {} ";
            var __err = out;
            out = $$outStack.pop(), !it.compositeRule && $breakOnError ? it.async ? out += " throw new ValidationError([" + __err + "]); " : out += " validate.errors = [" + __err + "]; return false; " : out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", 
            out += " } else if ( ", $isData && (out += " (" + $schemaValue + " !== undefined && typeof " + $schemaValue + " != 'number') || "), 
            out += " " + $exclType + " == 'number' ? ( (" + $exclusive + " = " + $schemaValue + " === undefined || " + $schemaValueExcl + " " + $op + "= " + $schemaValue + ") ? " + $data + " " + $notOp + "= " + $schemaValueExcl + " : " + $data + " " + $notOp + " " + $schemaValue + " ) : ( (" + $exclusive + " = " + $schemaValueExcl + " === true) ? " + $data + " " + $notOp + "= " + $schemaValue + " : " + $data + " " + $notOp + " " + $schemaValue + " ) || " + $data + " !== " + $data + ") { var op" + $lvl + " = " + $exclusive + " ? '" + $op + "' : '" + $op + "='; ", 
            void 0 === $schema && ($errorKeyword = $exclusiveKeyword, $errSchemaPath = it.errSchemaPath + "/" + $exclusiveKeyword, 
            $schemaValue = $schemaValueExcl, $isData = $isDataExcl);
        } else if ($opStr = $op, ($exclIsNumber = "number" == typeof $schemaExcl) && $isData) {
            var $opExpr = "'" + $opStr + "'";
            out += " if ( ", $isData && (out += " (" + $schemaValue + " !== undefined && typeof " + $schemaValue + " != 'number') || "), 
            out += " ( " + $schemaValue + " === undefined || " + $schemaExcl + " " + $op + "= " + $schemaValue + " ? " + $data + " " + $notOp + "= " + $schemaExcl + " : " + $data + " " + $notOp + " " + $schemaValue + " ) || " + $data + " !== " + $data + ") { ";
        } else $exclIsNumber && void 0 === $schema ? ($exclusive = !0, $errorKeyword = $exclusiveKeyword, 
        $errSchemaPath = it.errSchemaPath + "/" + $exclusiveKeyword, $schemaValue = $schemaExcl, 
        $notOp += "=") : ($exclIsNumber && ($schemaValue = Math[$isMax ? "min" : "max"]($schemaExcl, $schema)), 
        $schemaExcl === (!$exclIsNumber || $schemaValue) ? ($exclusive = !0, $errorKeyword = $exclusiveKeyword, 
        $errSchemaPath = it.errSchemaPath + "/" + $exclusiveKeyword, $notOp += "=") : ($exclusive = !1, 
        $opStr += "=")), $opExpr = "'" + $opStr + "'", out += " if ( ", $isData && (out += " (" + $schemaValue + " !== undefined && typeof " + $schemaValue + " != 'number') || "), 
        out += " " + $data + " " + $notOp + " " + $schemaValue + " || " + $data + " !== " + $data + ") { ";
        return $errorKeyword = $errorKeyword || $keyword, ($$outStack = $$outStack || []).push(out), 
        out = "", !1 !== it.createErrors ? (out += " { keyword: '" + ($errorKeyword || "_limit") + "' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { comparison: " + $opExpr + ", limit: " + $schemaValue + ", exclusive: " + $exclusive + " } ", 
        !1 !== it.opts.messages && (out += " , message: 'should be " + $opStr + " ", out += $isData ? "' + " + $schemaValue : $schemaValue + "'"), 
        it.opts.verbose && (out += " , schema:  ", out += $isData ? "validate.schema" + $schemaPath : "" + $schema, 
        out += "         , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " "), 
        out += " } ") : out += " {} ", __err = out, out = $$outStack.pop(), !it.compositeRule && $breakOnError ? it.async ? out += " throw new ValidationError([" + __err + "]); " : out += " validate.errors = [" + __err + "]; return false; " : out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", 
        out += " } ", $breakOnError && (out += " else { "), out;
    };
}
