function(module, exports) {
    module.exports = function(st) {
        var type, types = [ "Directory", "File", "SymbolicLink", "Link", "BlockDevice", "CharacterDevice", "FIFO", "Socket" ];
        if (st.type && -1 !== types.indexOf(st.type)) return st[st.type] = !0, st.type;
        for (var i = 0, l = types.length; i < l; i++) {
            var is = st[type = types[i]] || st["is" + type];
            if ("function" == typeof is && (is = is.call(st)), is) return st[type] = !0, st.type = type, 
            type;
        }
        return null;
    };
}
