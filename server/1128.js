function(module) {
    module.exports = {
        $id: "pageTimings.json#",
        $schema: "http://json-schema.org/draft-06/schema#",
        type: "object",
        properties: {
            onContentLoad: {
                type: "number",
                min: -1
            },
            onLoad: {
                type: "number",
                min: -1
            },
            comment: {
                type: "string"
            }
        }
    };
}
