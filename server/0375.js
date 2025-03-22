function(module, exports, __webpack_require__) {
    var sax = __webpack_require__(749), dateFormatter = __webpack_require__(374), Deserializer = function(encoding) {
        this.type = null, this.responseType = null, this.stack = [], this.marks = [], this.data = [], 
        this.methodname = null, this.encoding = encoding || "utf8", this.value = !1, this.callback = null, 
        this.error = null, this.parser = sax.createStream(), this.parser.on("opentag", this.onOpentag.bind(this)), 
        this.parser.on("closetag", this.onClosetag.bind(this)), this.parser.on("text", this.onText.bind(this)), 
        this.parser.on("end", this.onDone.bind(this)), this.parser.on("error", this.onError.bind(this));
    };
    Deserializer.prototype.deserializeMethodResponse = function(stream, callback) {
        var that = this;
        this.callback = function(error, result) {
            error ? callback(error) : result.length > 1 ? callback(new Error("Response has more than one param")) : "methodresponse" !== that.type ? callback(new Error("Not a method response")) : that.responseType ? callback(null, result[0]) : callback(new Error("Invalid method response"));
        }, stream.setEncoding(this.encoding), stream.on("error", this.onError.bind(this)), 
        stream.pipe(this.parser);
    }, Deserializer.prototype.deserializeMethodCall = function(stream, callback) {
        var that = this;
        this.callback = function(error, result) {
            error ? callback(error) : "methodcall" !== that.type ? callback(new Error("Not a method call")) : that.methodname ? callback(null, that.methodname, result) : callback(new Error("Method call did not contain a method name"));
        }, stream.setEncoding(this.encoding), stream.on("error", this.onError.bind(this)), 
        stream.pipe(this.parser);
    }, Deserializer.prototype.onDone = function() {
        this.error || (null === this.type || this.marks.length ? this.callback(new Error("Invalid XML-RPC message")) : "fault" === this.responseType ? this.callback((function(fault) {
            var error = new Error("XML-RPC fault" + (fault.faultString ? ": " + fault.faultString : ""));
            return error.code = fault.faultCode, error.faultCode = fault.faultCode, error.faultString = fault.faultString, 
            error;
        })(this.stack[0])) : this.callback(void 0, this.stack));
    }, Deserializer.prototype.onError = function(msg) {
        this.error || (this.error = "string" == typeof msg ? new Error(msg) : msg, this.callback(this.error));
    }, Deserializer.prototype.push = function(value) {
        this.stack.push(value);
    }, Deserializer.prototype.onOpentag = function(node) {
        "ARRAY" !== node.name && "STRUCT" !== node.name || this.marks.push(this.stack.length), 
        this.data = [], this.value = "VALUE" === node.name;
    }, Deserializer.prototype.onText = function(text) {
        this.data.push(text);
    }, Deserializer.prototype.onClosetag = function(el) {
        var data = this.data.join("");
        try {
            switch (el) {
              case "BOOLEAN":
                this.endBoolean(data);
                break;

              case "INT":
              case "I4":
                this.endInt(data);
                break;

              case "I8":
                this.endI8(data);
                break;

              case "DOUBLE":
                this.endDouble(data);
                break;

              case "STRING":
              case "NAME":
                this.endString(data);
                break;

              case "ARRAY":
                this.endArray(data);
                break;

              case "STRUCT":
                this.endStruct(data);
                break;

              case "BASE64":
                this.endBase64(data);
                break;

              case "DATETIME.ISO8601":
                this.endDateTime(data);
                break;

              case "VALUE":
                this.endValue(data);
                break;

              case "PARAMS":
                this.endParams(data);
                break;

              case "FAULT":
                this.endFault(data);
                break;

              case "METHODRESPONSE":
                this.endMethodResponse(data);
                break;

              case "METHODNAME":
                this.endMethodName(data);
                break;

              case "METHODCALL":
                this.endMethodCall(data);
                break;

              case "NIL":
                this.endNil(data);
                break;

              case "DATA":
              case "PARAM":
              case "MEMBER":
                break;

              default:
                this.onError("Unknown XML-RPC tag '" + el + "'");
            }
        } catch (e) {
            this.onError(e);
        }
    }, Deserializer.prototype.endNil = function(data) {
        this.push(null), this.value = !1;
    }, Deserializer.prototype.endBoolean = function(data) {
        if ("1" === data) this.push(!0); else {
            if ("0" !== data) throw new Error("Illegal boolean value '" + data + "'");
            this.push(!1);
        }
        this.value = !1;
    }, Deserializer.prototype.endInt = function(data) {
        var value = parseInt(data, 10);
        if (isNaN(value)) throw new Error("Expected an integer but got '" + data + "'");
        this.push(value), this.value = !1;
    }, Deserializer.prototype.endDouble = function(data) {
        var value = parseFloat(data);
        if (isNaN(value)) throw new Error("Expected a double but got '" + data + "'");
        this.push(value), this.value = !1;
    }, Deserializer.prototype.endString = function(data) {
        this.push(data), this.value = !1;
    }, Deserializer.prototype.endArray = function(data) {
        var mark = this.marks.pop();
        this.stack.splice(mark, this.stack.length - mark, this.stack.slice(mark)), this.value = !1;
    }, Deserializer.prototype.endStruct = function(data) {
        for (var mark = this.marks.pop(), struct = {}, items = this.stack.slice(mark), i = 0; i < items.length; i += 2) struct[items[i]] = items[i + 1];
        this.stack.splice(mark, this.stack.length - mark, struct), this.value = !1;
    }, Deserializer.prototype.endBase64 = function(data) {
        var buffer = new Buffer(data, "base64");
        this.push(buffer), this.value = !1;
    }, Deserializer.prototype.endDateTime = function(data) {
        var date = dateFormatter.decodeIso8601(data);
        this.push(date), this.value = !1;
    };
    var isInteger = /^-?\d+$/;
    Deserializer.prototype.endI8 = function(data) {
        if (!isInteger.test(data)) throw new Error("Expected integer (I8) value but got '" + data + "'");
        this.endString(data);
    }, Deserializer.prototype.endValue = function(data) {
        this.value && this.endString(data);
    }, Deserializer.prototype.endParams = function(data) {
        this.responseType = "params";
    }, Deserializer.prototype.endFault = function(data) {
        this.responseType = "fault";
    }, Deserializer.prototype.endMethodResponse = function(data) {
        this.type = "methodresponse";
    }, Deserializer.prototype.endMethodName = function(data) {
        this.methodname = data;
    }, Deserializer.prototype.endMethodCall = function(data) {
        this.type = "methodcall";
    }, module.exports = Deserializer;
}
