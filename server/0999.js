function(module, exports, __webpack_require__) {
    const manifest = __webpack_require__(465), manifestNoCatalogs = Object.assign({}, manifest);
    manifestNoCatalogs.name += " (without catalog support)", manifestNoCatalogs.catalogs = [], 
    manifestNoCatalogs.resources = manifest.resources.filter((resource => "catalog" != resource.name && "catalog" != resource)), 
    module.exports = manifestNoCatalogs;
}
