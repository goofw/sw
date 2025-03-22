function(module, exports, __webpack_require__) {
    var xmlBuilder = __webpack_require__(746), dateFormatter = __webpack_require__(374);
    function serializeValue(value, xml) {
        for (var stack = [ {
            value: value,
            xml: xml
        } ], current = null, valueNode = null, next = null; stack.length > 0; ) if (void 0 !== (current = stack[stack.length - 1]).index) (next = getNextItemsFrame(current)) ? stack.push(next) : stack.pop(); else switch (valueNode = current.xml.ele("value"), 
        typeof current.value) {
          case "boolean":
            appendBoolean(current.value, valueNode), stack.pop();
            break;

          case "string":
            appendString(current.value, valueNode), stack.pop();
            break;

          case "number":
            appendNumber(current.value, valueNode), stack.pop();
            break;

          case "object":
            null === current.value ? (valueNode.ele("nil"), stack.pop()) : current.value instanceof Date ? (appendDatetime(current.value, valueNode), 
            stack.pop()) : Buffer.isBuffer(current.value) ? (appendBuffer(current.value, valueNode), 
            stack.pop()) : (Array.isArray(current.value) ? current.xml = valueNode.ele("array").ele("data") : (current.xml = valueNode.ele("struct"), 
            current.keys = Object.keys(current.value)), current.index = 0, (next = getNextItemsFrame(current)) ? stack.push(next) : stack.pop());
            break;

          default:
            stack.pop();
        }
    }
    function getNextItemsFrame(frame) {
        var nextFrame = null;
        if (frame.keys) {
            if (frame.index < frame.keys.length) {
                var key = frame.keys[frame.index++], member = frame.xml.ele("member").ele("name").text(key).up();
                nextFrame = {
                    value: frame.value[key],
                    xml: member
                };
            }
        } else frame.index < frame.value.length && (nextFrame = {
            value: frame.value[frame.index],
            xml: frame.xml
        }, frame.index++);
        return nextFrame;
    }
    function appendBoolean(value, xml) {
        xml.ele("boolean").txt(value ? 1 : 0);
    }
    exports.serializeMethodCall = function(method, params) {
        params = params || [];
        var xml = xmlBuilder.create().begin("methodCall", {
            version: "1.0"
        }).ele("methodName").txt(method).up().ele("params");
        return params.forEach((function(param) {
            serializeValue(param, xml.ele("param"));
        })), xml.doc().toString();
    }, exports.serializeMethodResponse = function(result) {
        var xml = xmlBuilder.create().begin("methodResponse", {
            version: "1.0"
        }).ele("params").ele("param");
        return serializeValue(result, xml), xml.doc().toString();
    }, exports.serializeFault = function(fault) {
        var xml = xmlBuilder.create().begin("methodResponse", {
            version: "1.0"
        }).ele("fault");
        return serializeValue(fault, xml), xml.doc().toString();
    };
    var illegalChars = /^(?![^<&]*]]>[^<&]*)[^<&]*$/;
    function appendString(value, xml) {
        0 === value.length ? xml.ele("string") : illegalChars.test(value) ? xml.ele("string").txt(value) : xml.ele("string").d(value);
    }
    function appendNumber(value, xml) {
        value % 1 == 0 ? xml.ele("int").txt(value) : xml.ele("double").txt(value);
    }
    function appendDatetime(value, xml) {
        xml.ele("dateTime.iso8601").txt(dateFormatter.encodeIso8601(value));
    }
    function appendBuffer(value, xml) {
        xml.ele("base64").txt(value.toString("base64"));
    }
}
