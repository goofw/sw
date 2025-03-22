function(module, exports, __webpack_require__) {
    "use strict";
    var IDENTIFIER = /^[a-z_$][a-z0-9_$-]*$/i, customRuleCode = __webpack_require__(1112), metaSchema = __webpack_require__(503);
    module.exports = {
        add: function(keyword, definition) {
            var RULES = this.RULES;
            if (RULES.keywords[keyword]) throw new Error("Keyword " + keyword + " is already defined");
            if (!IDENTIFIER.test(keyword)) throw new Error("Keyword " + keyword + " is not a valid identifier");
            if (definition) {
                this.validateKeyword(definition, !0);
                var dataType = definition.type;
                if (Array.isArray(dataType)) for (var i = 0; i < dataType.length; i++) _addRule(keyword, dataType[i], definition); else _addRule(keyword, dataType, definition);
                var metaSchema = definition.metaSchema;
                metaSchema && (definition.$data && this._opts.$data && (metaSchema = {
                    anyOf: [ metaSchema, {
                        $ref: "https://raw.githubusercontent.com/epoberezkin/ajv/master/lib/refs/data.json#"
                    } ]
                }), definition.validateSchema = this.compile(metaSchema, !0));
            }
            function _addRule(keyword, dataType, definition) {
                for (var ruleGroup, i = 0; i < RULES.length; i++) {
                    var rg = RULES[i];
                    if (rg.type == dataType) {
                        ruleGroup = rg;
                        break;
                    }
                }
                ruleGroup || (ruleGroup = {
                    type: dataType,
                    rules: []
                }, RULES.push(ruleGroup));
                var rule = {
                    keyword: keyword,
                    definition: definition,
                    custom: !0,
                    code: customRuleCode,
                    implements: definition.implements
                };
                ruleGroup.rules.push(rule), RULES.custom[keyword] = rule;
            }
            return RULES.keywords[keyword] = RULES.all[keyword] = !0, this;
        },
        get: function(keyword) {
            var rule = this.RULES.custom[keyword];
            return rule ? rule.definition : this.RULES.keywords[keyword] || !1;
        },
        remove: function(keyword) {
            var RULES = this.RULES;
            delete RULES.keywords[keyword], delete RULES.all[keyword], delete RULES.custom[keyword];
            for (var i = 0; i < RULES.length; i++) for (var rules = RULES[i].rules, j = 0; j < rules.length; j++) if (rules[j].keyword == keyword) {
                rules.splice(j, 1);
                break;
            }
            return this;
        },
        validate: function validateKeyword(definition, throwError) {
            validateKeyword.errors = null;
            var v = this._validateKeyword = this._validateKeyword || this.compile(definitionSchema, !0);
            if (v(definition)) return !0;
            if (validateKeyword.errors = v.errors, throwError) throw new Error("custom keyword definition is invalid: " + this.errorsText(v.errors));
            return !1;
        }
    };
    var definitionSchema = {
        definitions: {
            simpleTypes: metaSchema.definitions.simpleTypes
        },
        type: "object",
        dependencies: {
            schema: [ "validate" ],
            $data: [ "validate" ],
            statements: [ "inline" ],
            valid: {
                not: {
                    required: [ "macro" ]
                }
            }
        },
        properties: {
            type: metaSchema.properties.type,
            schema: {
                type: "boolean"
            },
            statements: {
                type: "boolean"
            },
            dependencies: {
                type: "array",
                items: {
                    type: "string"
                }
            },
            metaSchema: {
                type: "object"
            },
            modifying: {
                type: "boolean"
            },
            valid: {
                type: "boolean"
            },
            $data: {
                type: "boolean"
            },
            async: {
                type: "boolean"
            },
            errors: {
                anyOf: [ {
                    type: "boolean"
                }, {
                    const: "full"
                } ]
            }
        }
    };
}
