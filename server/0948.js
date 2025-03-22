function(module, exports) {
    module.exports = {
        package: "extensions.api.cast_channel",
        messages: [ {
            name: "CastMessage",
            fields: [ {
                rule: "required",
                options: {},
                type: "ProtocolVersion",
                name: "protocol_version",
                id: 1
            }, {
                rule: "required",
                options: {},
                type: "string",
                name: "source_id",
                id: 2
            }, {
                rule: "required",
                options: {},
                type: "string",
                name: "destination_id",
                id: 3
            }, {
                rule: "required",
                options: {},
                type: "string",
                name: "namespace",
                id: 4
            }, {
                rule: "required",
                options: {},
                type: "PayloadType",
                name: "payload_type",
                id: 5
            }, {
                rule: "optional",
                options: {},
                type: "string",
                name: "payload_utf8",
                id: 6
            }, {
                rule: "optional",
                options: {},
                type: "bytes",
                name: "payload_binary",
                id: 7
            } ],
            enums: [ {
                name: "ProtocolVersion",
                values: [ {
                    name: "CASTV2_1_0",
                    id: 0
                } ],
                options: {}
            }, {
                name: "PayloadType",
                values: [ {
                    name: "STRING",
                    id: 0
                }, {
                    name: "BINARY",
                    id: 1
                } ],
                options: {}
            } ],
            messages: [],
            options: {},
            oneofs: {}
        }, {
            name: "AuthChallenge",
            fields: [],
            enums: [],
            messages: [],
            options: {},
            oneofs: {}
        }, {
            name: "AuthResponse",
            fields: [ {
                rule: "required",
                options: {},
                type: "bytes",
                name: "signature",
                id: 1
            }, {
                rule: "required",
                options: {},
                type: "bytes",
                name: "client_auth_certificate",
                id: 2
            }, {
                rule: "repeated",
                options: {},
                type: "bytes",
                name: "client_ca",
                id: 3
            } ],
            enums: [],
            messages: [],
            options: {},
            oneofs: {}
        }, {
            name: "AuthError",
            fields: [ {
                rule: "required",
                options: {},
                type: "ErrorType",
                name: "error_type",
                id: 1
            } ],
            enums: [ {
                name: "ErrorType",
                values: [ {
                    name: "INTERNAL_ERROR",
                    id: 0
                }, {
                    name: "NO_TLS",
                    id: 1
                } ],
                options: {}
            } ],
            messages: [],
            options: {},
            oneofs: {}
        }, {
            name: "DeviceAuthMessage",
            fields: [ {
                rule: "optional",
                options: {},
                type: "AuthChallenge",
                name: "challenge",
                id: 1
            }, {
                rule: "optional",
                options: {},
                type: "AuthResponse",
                name: "response",
                id: 2
            }, {
                rule: "optional",
                options: {},
                type: "AuthError",
                name: "error",
                id: 3
            } ],
            enums: [],
            messages: [],
            options: {},
            oneofs: {}
        } ],
        enums: [],
        imports: [],
        options: {
            optimize_for: "LITE_RUNTIME"
        },
        services: []
    };
}
