function(module, exports) {
    (function() {
        exports.defaults = {
            .1: {
                explicitCharkey: !1,
                trim: !0,
                normalize: !0,
                normalizeTags: !1,
                attrkey: "@",
                charkey: "#",
                explicitArray: !1,
                ignoreAttrs: !1,
                mergeAttrs: !1,
                explicitRoot: !1,
                validator: null,
                xmlns: !1,
                explicitChildren: !1,
                childkey: "@@",
                charsAsChildren: !1,
                includeWhiteChars: !1,
                async: !1,
                strict: !0,
                attrNameProcessors: null,
                attrValueProcessors: null,
                tagNameProcessors: null,
                valueProcessors: null,
                emptyTag: ""
            },
            .2: {
                explicitCharkey: !1,
                trim: !1,
                normalize: !1,
                normalizeTags: !1,
                attrkey: "$",
                charkey: "_",
                explicitArray: !0,
                ignoreAttrs: !1,
                mergeAttrs: !1,
                explicitRoot: !0,
                validator: null,
                xmlns: !1,
                explicitChildren: !1,
                preserveChildrenOrder: !1,
                childkey: "$$",
                charsAsChildren: !1,
                includeWhiteChars: !1,
                async: !1,
                strict: !0,
                attrNameProcessors: null,
                attrValueProcessors: null,
                tagNameProcessors: null,
                valueProcessors: null,
                rootName: "root",
                xmldec: {
                    version: "1.0",
                    encoding: "UTF-8",
                    standalone: !0
                },
                doctype: null,
                renderOpts: {
                    pretty: !0,
                    indent: "  ",
                    newline: "\n"
                },
                headless: !1,
                chunkSize: 1e4,
                emptyTag: "",
                cdata: !1
            }
        };
    }).call(this);
}
