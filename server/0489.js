function(module, exports) {
    module.exports = function(list, sortMethod) {
        var isNamedList = !Array.isArray(list), initState = {
            index: 0,
            keyedList: isNamedList || sortMethod ? Object.keys(list) : null,
            jobs: {},
            results: isNamedList ? {} : [],
            size: isNamedList ? Object.keys(list).length : list.length
        };
        return sortMethod && initState.keyedList.sort(isNamedList ? sortMethod : function(a, b) {
            return sortMethod(list[a], list[b]);
        }), initState;
    };
}
