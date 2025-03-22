function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(callSite) {
        var receiver, addSuffix = !0, fileLocation = (function(callSite) {
            var fileName, fileLocation = "";
            if (callSite.isNative() ? fileLocation = "native" : callSite.isEval() ? (fileName = callSite.getScriptNameOrSourceURL()) || (fileLocation = callSite.getEvalOrigin()) : fileName = callSite.getFileName(), 
            fileName) {
                fileLocation += fileName;
                var lineNumber = callSite.getLineNumber();
                if (null != lineNumber) {
                    fileLocation += ":" + lineNumber;
                    var columnNumber = callSite.getColumnNumber();
                    columnNumber && (fileLocation += ":" + columnNumber);
                }
            }
            return fileLocation || "unknown source";
        })(callSite), functionName = callSite.getFunctionName(), isConstructor = callSite.isConstructor(), line = "";
        if (!(callSite.isToplevel() || isConstructor)) {
            var methodName = callSite.getMethodName(), typeName = (receiver = callSite.receiver).constructor && receiver.constructor.name || null;
            functionName ? (typeName && 0 !== functionName.indexOf(typeName) && (line += typeName + "."), 
            line += functionName, methodName && functionName.lastIndexOf("." + methodName) !== functionName.length - methodName.length - 1 && (line += " [as " + methodName + "]")) : line += typeName + "." + (methodName || "<anonymous>");
        } else isConstructor ? line += "new " + (functionName || "<anonymous>") : functionName ? line += functionName : (addSuffix = !1, 
        line += fileLocation);
        return addSuffix && (line += " (" + fileLocation + ")"), line;
    };
}
