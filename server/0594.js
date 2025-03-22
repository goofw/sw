function(module, exports, __webpack_require__) {
    "use strict";
    const knownProps = [ "destroy", "setTimeout", "socket", "headers", "trailers", "rawHeaders", "statusCode", "httpVersion", "httpVersionMinor", "httpVersionMajor", "rawTrailers", "statusMessage" ];
    module.exports = (fromStream, toStream) => {
        const fromProps = new Set(Object.keys(fromStream).concat(knownProps));
        for (const prop of fromProps) prop in toStream || (toStream[prop] = "function" == typeof fromStream[prop] ? fromStream[prop].bind(fromStream) : fromStream[prop]);
    };
}
