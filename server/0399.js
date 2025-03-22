function(module, exports, __webpack_require__) {
    const EventEmitter = __webpack_require__(5), bridge = "android" === process.platform ? process._linkedBinding("android_bridge") : null, events = {}, eventEmitter = new EventEmitter;
    module.exports = {
        dispatch: (event, data) => {
            null !== bridge && bridge.dispatch(event, JSON.stringify(data));
        },
        on: (event, cb) => {
            null !== bridge && (events[event] || (events[event] = !0, bridge.setListener(event, (data => {
                eventEmitter.emit(event, JSON.parse(data));
            }))), eventEmitter.on(event, cb));
        },
        off: (event, cb) => {
            null !== bridge && eventEmitter.off(event, cb);
        }
    };
}
