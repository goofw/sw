function(module) {
    module.exports = {
        $id: "postData.json#",
        $schema: "http://json-schema.org/draft-06/schema#",
        type: "object",
        optional: !0,
        required: [ "mimeType" ],
        properties: {
            mimeType: {
                type: "string"
            },
            text: {
                type: "string"
            },
            params: {
                type: "array",
                required: [ "name" ],
                properties: {
                    name: {
                        type: "string"
                    },
                    value: {
                        type: "string"
                    },
                    fileName: {
                        type: "string"
                    },
                    contentType: {
                        type: "string"
                    },
                    comment: {
                        type: "string"
                    }
                }
            },
            comment: {
                type: "string"
            }
        }
    };
}
