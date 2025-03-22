function(module, exports, __webpack_require__) {
    const vm = __webpack_require__(625);
    module.exports = function(str, regex, timeout) {
        let sandbox = {
            str: str,
            re: regex,
            result: null
        };
        try {
            vm.runInContext("result = !!str.match(re);", vm.createContext(sandbox), {
                timeout: timeout
            });
        } catch (e) {
            console.log("Warning: regex " + regex + ' was detected as evil when tested against "' + str + '", ignoring this regex pattern');
        }
        return sandbox.result;
    };
}
