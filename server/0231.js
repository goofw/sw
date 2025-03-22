function(module, exports) {
    module.exports = {
        newInvalidAsn1Error: function(msg) {
            var e = new Error;
            return e.name = "InvalidAsn1Error", e.message = msg || "", e;
        }
    };
}
