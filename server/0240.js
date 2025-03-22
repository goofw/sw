function(module, exports) {
    const cache = {};
    function getRandom() {
        return (Math.random() + 1).toString(36).substring(7);
    }
    module.exports = {
        set: data => {
            let key = getRandom();
            for (;cache[key]; ) key = getRandom();
            return cache[key] = data, key;
        },
        get: key => cache[key] || null
    };
}
