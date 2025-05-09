function(module) {
    module.exports = {
        $id: "content.json#",
        $schema: "http://json-schema.org/draft-06/schema#",
        type: "object",
        required: [ "size", "mimeType" ],
        properties: {
            size: {
                type: "integer"
            },
            compression: {
                type: "integer"
            },
            mimeType: {
                type: "string"
            },
            text: {
                type: "string"
            },
            encoding: {
                type: "string"
            },
            comment: {
                type: "string"
            }
        }
    };
}
