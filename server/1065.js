function(module, exports, __webpack_require__) {
    var __WEBPACK_AMD_DEFINE_RESULT__;
    __WEBPACK_AMD_DEFINE_RESULT__ = function() {
        return (function() {
            var exports = validate;
            exports.Integer = {
                type: "integer"
            };
            var primitiveConstructors = {
                String: String,
                Boolean: Boolean,
                Number: Number,
                Object: Object,
                Array: Array,
                Date: Date
            };
            function validate(instance, schema) {
                return validate(instance, schema, {
                    changing: !1
                });
            }
            exports.validate = validate, exports.checkPropertyChange = function(value, schema, property) {
                return validate(value, schema, {
                    changing: property || "property"
                });
            };
            var validate = exports._validate = function(instance, schema, options) {
                options || (options = {});
                var _changing = options.changing;
                function getType(schema) {
                    return schema.type || primitiveConstructors[schema.name] == schema && schema.name.toLowerCase();
                }
                var errors = [];
                function checkProp(value, schema, path, i) {
                    var l;
                    function addError(message) {
                        errors.push({
                            property: path,
                            message: message
                        });
                    }
                    if (path += path ? "number" == typeof i ? "[" + i + "]" : void 0 === i ? "" : "." + i : i, 
                    ("object" != typeof schema || schema instanceof Array) && (path || "function" != typeof schema) && (!schema || !getType(schema))) return "function" == typeof schema ? value instanceof schema || addError("is not an instance of the class/constructor " + schema.name) : schema && addError("Invalid schema/property definition " + schema), 
                    null;
                    function checkType(type, value) {
                        if (type) {
                            if (!("string" != typeof type || "any" == type || ("null" == type ? null === value : typeof value == type) || value instanceof Array && "array" == type || value instanceof Date && "date" == type || "integer" == type && value % 1 == 0)) return [ {
                                property: path,
                                message: typeof value + " value found, but a " + type + " is required"
                            } ];
                            if (type instanceof Array) {
                                for (var unionErrors = [], j = 0; j < type.length && (unionErrors = checkType(type[j], value)).length; j++) ;
                                if (unionErrors.length) return unionErrors;
                            } else if ("object" == typeof type) {
                                var priorErrors = errors;
                                errors = [], checkProp(value, type, path);
                                var theseErrors = errors;
                                return errors = priorErrors, theseErrors;
                            }
                        }
                        return [];
                    }
                    if (_changing && schema.readonly && addError("is a readonly field, it can not be changed"), 
                    schema.extends && checkProp(value, schema.extends, path, i), void 0 === value) schema.required && addError("is missing and it is required"); else if (errors = errors.concat(checkType(getType(schema), value)), 
                    schema.disallow && !checkType(schema.disallow, value).length && addError(" disallowed value was matched"), 
                    null !== value) {
                        if (value instanceof Array) {
                            if (schema.items) {
                                var itemsIsArray = schema.items instanceof Array, propDef = schema.items;
                                for (i = 0, l = value.length; i < l; i += 1) itemsIsArray && (propDef = schema.items[i]), 
                                options.coerce && (value[i] = options.coerce(value[i], propDef)), errors.concat(checkProp(value[i], propDef, path, i));
                            }
                            schema.minItems && value.length < schema.minItems && addError("There must be a minimum of " + schema.minItems + " in the array"), 
                            schema.maxItems && value.length > schema.maxItems && addError("There must be a maximum of " + schema.maxItems + " in the array");
                        } else (schema.properties || schema.additionalProperties) && errors.concat((function(instance, objTypeDef, path, additionalProp) {
                            if ("object" == typeof objTypeDef) for (var i in ("object" != typeof instance || instance instanceof Array) && errors.push({
                                property: path,
                                message: "an object is required"
                            }), objTypeDef) if (objTypeDef.hasOwnProperty(i)) {
                                var value = instance[i];
                                if (void 0 === value && options.existingOnly) continue;
                                var propDef = objTypeDef[i];
                                void 0 === value && propDef.default && (value = instance[i] = propDef.default), 
                                options.coerce && i in instance && (value = instance[i] = options.coerce(value, propDef)), 
                                checkProp(value, propDef, path, i);
                            }
                            for (i in instance) {
                                if (instance.hasOwnProperty(i) && ("_" != i.charAt(0) || "_" != i.charAt(1)) && objTypeDef && !objTypeDef[i] && !1 === additionalProp) {
                                    if (options.filter) {
                                        delete instance[i];
                                        continue;
                                    }
                                    errors.push({
                                        property: path,
                                        message: typeof value + "The property " + i + " is not defined in the schema and the schema does not allow additional properties"
                                    });
                                }
                                var requires = objTypeDef && objTypeDef[i] && objTypeDef[i].requires;
                                requires && !(requires in instance) && errors.push({
                                    property: path,
                                    message: "the presence of the property " + i + " requires that " + requires + " also be present"
                                }), value = instance[i], !additionalProp || objTypeDef && "object" == typeof objTypeDef && i in objTypeDef || (options.coerce && (value = instance[i] = options.coerce(value, additionalProp)), 
                                checkProp(value, additionalProp, path, i)), !_changing && value && value.$schema && (errors = errors.concat(checkProp(value, value.$schema, path, i)));
                            }
                            return errors;
                        })(value, schema.properties, path, schema.additionalProperties));
                        if (schema.pattern && "string" == typeof value && !value.match(schema.pattern) && addError("does not match the regex pattern " + schema.pattern), 
                        schema.maxLength && "string" == typeof value && value.length > schema.maxLength && addError("may only be " + schema.maxLength + " characters long"), 
                        schema.minLength && "string" == typeof value && value.length < schema.minLength && addError("must be at least " + schema.minLength + " characters long"), 
                        void 0 !== typeof schema.minimum && typeof value == typeof schema.minimum && schema.minimum > value && addError("must have a minimum value of " + schema.minimum), 
                        void 0 !== typeof schema.maximum && typeof value == typeof schema.maximum && schema.maximum < value && addError("must have a maximum value of " + schema.maximum), 
                        schema.enum) {
                            var found, enumer = schema.enum;
                            l = enumer.length;
                            for (var j = 0; j < l; j++) if (enumer[j] === value) {
                                found = 1;
                                break;
                            }
                            found || addError("does not have a value in the enumeration " + enumer.join(", "));
                        }
                        "number" == typeof schema.maxDecimal && value.toString().match(new RegExp("\\.[0-9]{" + (schema.maxDecimal + 1) + ",}")) && addError("may only have " + schema.maxDecimal + " digits of decimal places");
                    }
                    return null;
                }
                return schema && checkProp(instance, schema, "", _changing || ""), !_changing && instance && instance.$schema && checkProp(instance, instance.$schema, "", ""), 
                {
                    valid: !errors.length,
                    errors: errors
                };
            };
            return exports.mustBeValid = function(result) {
                if (!result.valid) throw new TypeError(result.errors.map((function(error) {
                    return "for property " + error.property + ": " + error.message;
                })).join(", \n"));
            }, exports;
        })();
    }.apply(exports, []), void 0 === __WEBPACK_AMD_DEFINE_RESULT__ || (module.exports = __WEBPACK_AMD_DEFINE_RESULT__);
}
