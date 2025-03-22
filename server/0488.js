function(module, exports) {
    function clean(key) {
        "function" == typeof this.jobs[key] && this.jobs[key]();
    }
    module.exports = function(state) {
        Object.keys(state.jobs).forEach(clean.bind(state)), state.jobs = {};
    };
}
