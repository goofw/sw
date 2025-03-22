function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = function(Promise) {
        var SomePromiseArray = Promise._SomePromiseArray;
        function any(promises) {
            var ret = new SomePromiseArray(promises), promise = ret.promise();
            return ret.setHowMany(1), ret.setUnwrap(), ret.init(), promise;
        }
        Promise.any = function(promises) {
            return any(promises);
        }, Promise.prototype.any = function() {
            return any(this);
        };
    };
}
