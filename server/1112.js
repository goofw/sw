function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(it, $keyword, $ruleType) {
        var $errorKeyword, $schemaValue, out = " ", $lvl = it.level, $dataLvl = it.dataLevel, $schema = it.schema[$keyword], $schemaPath = it.schemaPath + it.util.getProperty($keyword), $errSchemaPath = it.errSchemaPath + "/" + $keyword, $breakOnError = !it.opts.allErrors, $data = "data" + ($dataLvl || ""), $valid = "valid" + $lvl, $errs = "errs__" + $lvl, $isData = it.opts.$data && $schema && $schema.$data;
        $isData ? (out += " var schema" + $lvl + " = " + it.util.getData($schema.$data, $dataLvl, it.dataPathArr) + "; ", 
        $schemaValue = "schema" + $lvl) : $schemaValue = $schema;
        var $compile, $inline, $macro, $ruleValidate, $validateCode, $definition = "definition" + $lvl, $rDef = this.definition, $closingBraces = "";
        if ($isData && $rDef.$data) {
            $validateCode = "keywordValidate" + $lvl;
            var $validateSchema = $rDef.validateSchema;
            out += " var " + $definition + " = RULES.custom['" + $keyword + "'].definition; var " + $validateCode + " = " + $definition + ".validate;";
        } else {
            if (!($ruleValidate = it.useCustomRule(this, $schema, it.schema, it))) return;
            $schemaValue = "validate.schema" + $schemaPath, $validateCode = $ruleValidate.code, 
            $compile = $rDef.compile, $inline = $rDef.inline, $macro = $rDef.macro;
        }
        var $ruleErrs = $validateCode + ".errors", $i = "i" + $lvl, $ruleErr = "ruleErr" + $lvl, $asyncKeyword = $rDef.async;
        if ($asyncKeyword && !it.async) throw new Error("async keyword in sync schema");
        if ($inline || $macro || (out += $ruleErrs + " = null;"), out += "var " + $errs + " = errors;var " + $valid + ";", 
        $isData && $rDef.$data && ($closingBraces += "}", out += " if (" + $schemaValue + " === undefined) { " + $valid + " = true; } else { ", 
        $validateSchema && ($closingBraces += "}", out += " " + $valid + " = " + $definition + ".validateSchema(" + $schemaValue + "); if (" + $valid + ") { ")), 
        $inline) $rDef.statements ? out += " " + $ruleValidate.validate + " " : out += " " + $valid + " = " + $ruleValidate.validate + "; "; else if ($macro) {
            var $it = it.util.copy(it);
            $closingBraces = "", $it.level++;
            var $nextValid = "valid" + $it.level;
            $it.schema = $ruleValidate.validate, $it.schemaPath = "";
            var $wasComposite = it.compositeRule;
            it.compositeRule = $it.compositeRule = !0;
            var $code = it.validate($it).replace(/validate\.schema/g, $validateCode);
            it.compositeRule = $it.compositeRule = $wasComposite, out += " " + $code;
        } else {
            ($$outStack = $$outStack || []).push(out), out = "", out += "  " + $validateCode + ".call( ", 
            it.opts.passContext ? out += "this" : out += "self", $compile || !1 === $rDef.schema ? out += " , " + $data + " " : out += " , " + $schemaValue + " , " + $data + " , validate.schema" + it.schemaPath + " ", 
            out += " , (dataPath || '')", '""' != it.errorPath && (out += " + " + it.errorPath);
            var $parentData = $dataLvl ? "data" + ($dataLvl - 1 || "") : "parentData", $parentDataProperty = $dataLvl ? it.dataPathArr[$dataLvl] : "parentDataProperty", def_callRuleValidate = out += " , " + $parentData + " , " + $parentDataProperty + " , rootData )  ";
            out = $$outStack.pop(), !1 === $rDef.errors ? (out += " " + $valid + " = ", $asyncKeyword && (out += "await "), 
            out += def_callRuleValidate + "; ") : out += $asyncKeyword ? " var " + ($ruleErrs = "customErrors" + $lvl) + " = null; try { " + $valid + " = await " + def_callRuleValidate + "; } catch (e) { " + $valid + " = false; if (e instanceof ValidationError) " + $ruleErrs + " = e.errors; else throw e; } " : " " + $ruleErrs + " = null; " + $valid + " = " + def_callRuleValidate + "; ";
        }
        if ($rDef.modifying && (out += " if (" + $parentData + ") " + $data + " = " + $parentData + "[" + $parentDataProperty + "];"), 
        out += "" + $closingBraces, $rDef.valid) $breakOnError && (out += " if (true) { "); else {
            var $$outStack;
            out += " if ( ", void 0 === $rDef.valid ? (out += " !", out += $macro ? "" + $nextValid : "" + $valid) : out += " " + !$rDef.valid + " ", 
            out += ") { ", $errorKeyword = this.keyword, ($$outStack = $$outStack || []).push(out), 
            out = "", ($$outStack = $$outStack || []).push(out), out = "", !1 !== it.createErrors ? (out += " { keyword: '" + ($errorKeyword || "custom") + "' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { keyword: '" + this.keyword + "' } ", 
            !1 !== it.opts.messages && (out += " , message: 'should pass \"" + this.keyword + "\" keyword validation' "), 
            it.opts.verbose && (out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " "), 
            out += " } ") : out += " {} ";
            var __err = out;
            out = $$outStack.pop(), !it.compositeRule && $breakOnError ? it.async ? out += " throw new ValidationError([" + __err + "]); " : out += " validate.errors = [" + __err + "]; return false; " : out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
            var def_customError = out;
            out = $$outStack.pop(), $inline ? $rDef.errors ? "full" != $rDef.errors && (out += "  for (var " + $i + "=" + $errs + "; " + $i + "<errors; " + $i + "++) { var " + $ruleErr + " = vErrors[" + $i + "]; if (" + $ruleErr + ".dataPath === undefined) " + $ruleErr + ".dataPath = (dataPath || '') + " + it.errorPath + "; if (" + $ruleErr + ".schemaPath === undefined) { " + $ruleErr + '.schemaPath = "' + $errSchemaPath + '"; } ', 
            it.opts.verbose && (out += " " + $ruleErr + ".schema = " + $schemaValue + "; " + $ruleErr + ".data = " + $data + "; "), 
            out += " } ") : !1 === $rDef.errors ? out += " " + def_customError + " " : (out += " if (" + $errs + " == errors) { " + def_customError + " } else {  for (var " + $i + "=" + $errs + "; " + $i + "<errors; " + $i + "++) { var " + $ruleErr + " = vErrors[" + $i + "]; if (" + $ruleErr + ".dataPath === undefined) " + $ruleErr + ".dataPath = (dataPath || '') + " + it.errorPath + "; if (" + $ruleErr + ".schemaPath === undefined) { " + $ruleErr + '.schemaPath = "' + $errSchemaPath + '"; } ', 
            it.opts.verbose && (out += " " + $ruleErr + ".schema = " + $schemaValue + "; " + $ruleErr + ".data = " + $data + "; "), 
            out += " } } ") : $macro ? (out += "   var err =   ", !1 !== it.createErrors ? (out += " { keyword: '" + ($errorKeyword || "custom") + "' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { keyword: '" + this.keyword + "' } ", 
            !1 !== it.opts.messages && (out += " , message: 'should pass \"" + this.keyword + "\" keyword validation' "), 
            it.opts.verbose && (out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " "), 
            out += " } ") : out += " {} ", out += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", 
            !it.compositeRule && $breakOnError && (it.async ? out += " throw new ValidationError(vErrors); " : out += " validate.errors = vErrors; return false; ")) : !1 === $rDef.errors ? out += " " + def_customError + " " : (out += " if (Array.isArray(" + $ruleErrs + ")) { if (vErrors === null) vErrors = " + $ruleErrs + "; else vErrors = vErrors.concat(" + $ruleErrs + "); errors = vErrors.length;  for (var " + $i + "=" + $errs + "; " + $i + "<errors; " + $i + "++) { var " + $ruleErr + " = vErrors[" + $i + "]; if (" + $ruleErr + ".dataPath === undefined) " + $ruleErr + ".dataPath = (dataPath || '') + " + it.errorPath + ";  " + $ruleErr + '.schemaPath = "' + $errSchemaPath + '";  ', 
            it.opts.verbose && (out += " " + $ruleErr + ".schema = " + $schemaValue + "; " + $ruleErr + ".data = " + $data + "; "), 
            out += " } } else { " + def_customError + " } "), out += " } ", $breakOnError && (out += " else { ");
        }
        return out;
    };
}
