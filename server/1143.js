function(module, exports) {
    (function() {
        var getNanoSeconds, hrtime, loadTime, moduleLoadTime, nodeLoadTime, upTime;
        "undefined" != typeof performance && null !== performance && performance.now ? module.exports = function() {
            return performance.now();
        } : "undefined" != typeof process && null !== process && process.hrtime ? (module.exports = function() {
            return (getNanoSeconds() - nodeLoadTime) / 1e6;
        }, hrtime = process.hrtime, moduleLoadTime = (getNanoSeconds = function() {
            var hr;
            return 1e9 * (hr = hrtime())[0] + hr[1];
        })(), upTime = 1e9 * process.uptime(), nodeLoadTime = moduleLoadTime - upTime) : Date.now ? (module.exports = function() {
            return Date.now() - loadTime;
        }, loadTime = Date.now()) : (module.exports = function() {
            return (new Date).getTime() - loadTime;
        }, loadTime = (new Date).getTime());
    }).call(this);
}
