function(module, exports, __webpack_require__) {
    const os = __webpack_require__(21), findFilesWin = __webpack_require__(1026), findFilesDarwin = __webpack_require__(1027);
    let findFiles = __webpack_require__(1028);
    "win32" === os.platform() && (findFiles = findFilesWin), "darwin" === os.platform() && (findFiles = findFilesDarwin), 
    module.exports = findFiles;
}
