function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(it, $keyword, $ruleType) {
        var $async, $refCode, out = " ", $lvl = it.level, $dataLvl = it.dataLevel, $schema = it.schema[$keyword], $errSchemaPath = it.errSchemaPath + "/" + $keyword, $breakOnError = !it.opts.allErrors, $data = "data" + ($dataLvl || ""), $valid = "valid" + $lvl;
        if ("#" == $schema || "#/" == $schema) it.isRoot ? ($async = it.async, $refCode = "validate") : ($async = !0 === it.root.schema.$async, 
        $refCode = "root.refVal[0]"); else {
            var $refVal = it.resolveRef(it.baseId, $schema, it.isRoot);
            if (void 0 === $refVal) {
                var $message = it.MissingRefError.message(it.baseId, $schema);
                if ("fail" == it.opts.missingRefs) {
                    it.logger.error($message), ($$outStack = $$outStack || []).push(out), out = "", 
                    !1 !== it.createErrors ? (out += " { keyword: '$ref' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { ref: '" + it.util.escapeQuotes($schema) + "' } ", 
                    !1 !== it.opts.messages && (out += " , message: 'can\\'t resolve reference " + it.util.escapeQuotes($schema) + "' "), 
                    it.opts.verbose && (out += " , schema: " + it.util.toQuotedString($schema) + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " "), 
                    out += " } ") : out += " {} ";
                    var __err = out;
                    out = $$outStack.pop(), !it.compositeRule && $breakOnError ? it.async ? out += " throw new ValidationError([" + __err + "]); " : out += " validate.errors = [" + __err + "]; return false; " : out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", 
                    $breakOnError && (out += " if (false) { ");
                } else {
                    if ("ignore" != it.opts.missingRefs) throw new it.MissingRefError(it.baseId, $schema, $message);
                    it.logger.warn($message), $breakOnError && (out += " if (true) { ");
                }
            } else if ($refVal.inline) {
                var $it = it.util.copy(it);
                $it.level++;
                var $nextValid = "valid" + $it.level;
                $it.schema = $refVal.schema, $it.schemaPath = "", $it.errSchemaPath = $schema, out += " " + it.validate($it).replace(/validate\.schema/g, $refVal.code) + " ", 
                $breakOnError && (out += " if (" + $nextValid + ") { ");
            } else $async = !0 === $refVal.$async || it.async && !1 !== $refVal.$async, $refCode = $refVal.code;
        }
        if ($refCode) {
            var $$outStack;
            ($$outStack = $$outStack || []).push(out), out = "", it.opts.passContext ? out += " " + $refCode + ".call(this, " : out += " " + $refCode + "( ", 
            out += " " + $data + ", (dataPath || '')", '""' != it.errorPath && (out += " + " + it.errorPath);
            var __callValidate = out += " , " + ($dataLvl ? "data" + ($dataLvl - 1 || "") : "parentData") + " , " + ($dataLvl ? it.dataPathArr[$dataLvl] : "parentDataProperty") + ", rootData)  ";
            if (out = $$outStack.pop(), $async) {
                if (!it.async) throw new Error("async schema referenced by sync schema");
                $breakOnError && (out += " var " + $valid + "; "), out += " try { await " + __callValidate + "; ", 
                $breakOnError && (out += " " + $valid + " = true; "), out += " } catch (e) { if (!(e instanceof ValidationError)) throw e; if (vErrors === null) vErrors = e.errors; else vErrors = vErrors.concat(e.errors); errors = vErrors.length; ", 
                $breakOnError && (out += " " + $valid + " = false; "), out += " } ", $breakOnError && (out += " if (" + $valid + ") { ");
            } else out += " if (!" + __callValidate + ") { if (vErrors === null) vErrors = " + $refCode + ".errors; else vErrors = vErrors.concat(" + $refCode + ".errors); errors = vErrors.length; } ", 
            $breakOnError && (out += " else { ");
        }
        return out;
    };
}
