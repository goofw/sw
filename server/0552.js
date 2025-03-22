function(module, exports) {
    "function" == typeof Object.create ? module.exports = function(ctor, superCtor) {
        ctor.super_ = superCtor, ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
                value: ctor,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        });
    } : module.exports = function(ctor, superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = function() {};
        TempCtor.prototype = superCtor.prototype, ctor.prototype = new TempCtor, ctor.prototype.constructor = ctor;
    };
}
