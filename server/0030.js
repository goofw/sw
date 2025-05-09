function(module, exports, __webpack_require__) {
    var Buffer = __webpack_require__(14).Buffer, algInfo = {
        dsa: {
            parts: [ "p", "q", "g", "y" ],
            sizePart: "p"
        },
        rsa: {
            parts: [ "e", "n" ],
            sizePart: "n"
        },
        ecdsa: {
            parts: [ "curve", "Q" ],
            sizePart: "Q"
        },
        ed25519: {
            parts: [ "A" ],
            sizePart: "A"
        }
    };
    algInfo.curve25519 = algInfo.ed25519;
    var algPrivInfo = {
        dsa: {
            parts: [ "p", "q", "g", "y", "x" ]
        },
        rsa: {
            parts: [ "n", "e", "d", "iqmp", "p", "q" ]
        },
        ecdsa: {
            parts: [ "curve", "Q", "d" ]
        },
        ed25519: {
            parts: [ "A", "k" ]
        }
    };
    algPrivInfo.curve25519 = algPrivInfo.ed25519;
    var curves = {
        nistp256: {
            size: 256,
            pkcs8oid: "1.2.840.10045.3.1.7",
            p: Buffer.from("00ffffffff 00000001 00000000 0000000000000000 ffffffff ffffffff ffffffff".replace(/ /g, ""), "hex"),
            a: Buffer.from("00FFFFFFFF 00000001 00000000 0000000000000000 FFFFFFFF FFFFFFFF FFFFFFFC".replace(/ /g, ""), "hex"),
            b: Buffer.from("5ac635d8 aa3a93e7 b3ebbd55 769886bc651d06b0 cc53b0f6 3bce3c3e 27d2604b".replace(/ /g, ""), "hex"),
            s: Buffer.from("00c49d3608 86e70493 6a6678e1 139d26b7819f7e90".replace(/ /g, ""), "hex"),
            n: Buffer.from("00ffffffff 00000000 ffffffff ffffffffbce6faad a7179e84 f3b9cac2 fc632551".replace(/ /g, ""), "hex"),
            G: Buffer.from("046b17d1f2 e12c4247 f8bce6e5 63a440f277037d81 2deb33a0 f4a13945 d898c2964fe342e2 fe1a7f9b 8ee7eb4a 7c0f9e162bce3357 6b315ece cbb64068 37bf51f5".replace(/ /g, ""), "hex")
        },
        nistp384: {
            size: 384,
            pkcs8oid: "1.3.132.0.34",
            p: Buffer.from("00ffffffff ffffffff ffffffff ffffffffffffffff ffffffff ffffffff fffffffeffffffff 00000000 00000000 ffffffff".replace(/ /g, ""), "hex"),
            a: Buffer.from("00FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFFFFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFEFFFFFFFF 00000000 00000000 FFFFFFFC".replace(/ /g, ""), "hex"),
            b: Buffer.from("b3312fa7 e23ee7e4 988e056b e3f82d19181d9c6e fe814112 0314088f 5013875ac656398d 8a2ed19d 2a85c8ed d3ec2aef".replace(/ /g, ""), "hex"),
            s: Buffer.from("00a335926a a319a27a 1d00896a 6773a4827acdac73".replace(/ /g, ""), "hex"),
            n: Buffer.from("00ffffffff ffffffff ffffffff ffffffffffffffff ffffffff c7634d81 f4372ddf581a0db2 48b0a77a ecec196a ccc52973".replace(/ /g, ""), "hex"),
            G: Buffer.from("04aa87ca22 be8b0537 8eb1c71e f320ad746e1d3b62 8ba79b98 59f741e0 82542a385502f25d bf55296c 3a545e38 72760ab73617de4a 96262c6f 5d9e98bf 9292dc29f8f41dbd 289a147c e9da3113 b5f0b8c00a60b1ce 1d7e819d 7a431d7c 90ea0e5f".replace(/ /g, ""), "hex")
        },
        nistp521: {
            size: 521,
            pkcs8oid: "1.3.132.0.35",
            p: Buffer.from("01ffffff ffffffff ffffffff ffffffffffffffff ffffffff ffffffff ffffffffffffffff ffffffff ffffffff ffffffffffffffff ffffffff ffffffff ffffffffffff".replace(/ /g, ""), "hex"),
            a: Buffer.from("01FFFFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFFFFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFFFFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFFFFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFC".replace(/ /g, ""), "hex"),
            b: Buffer.from("51953eb961 8e1c9a1f 929a21a0 b68540eea2da725b 99b315f3 b8b48991 8ef109e156193951 ec7e937b 1652c0bd 3bb1bf073573df88 3d2c34f1 ef451fd4 6b503f00".replace(/ /g, ""), "hex"),
            s: Buffer.from("00d09e8800 291cb853 96cc6717 393284aaa0da64ba".replace(/ /g, ""), "hex"),
            n: Buffer.from("01ffffffffff ffffffff ffffffff ffffffffffffffff ffffffff ffffffff fffffffa51868783 bf2f966b 7fcc0148 f709a5d03bb5c9b8 899c47ae bb6fb71e 91386409".replace(/ /g, ""), "hex"),
            G: Buffer.from("0400c6 858e06b7 0404e9cd 9e3ecb66 2395b4429c648139 053fb521 f828af60 6b4d3dbaa14b5e77 efe75928 fe1dc127 a2ffa8de3348b3c1 856a429b f97e7e31 c2e5bd660118 39296a78 9a3bc004 5c8a5fb4 2c7d1bd998f54449 579b4468 17afbd17 273e662c97ee7299 5ef42640 c550b901 3fad0761353c7086 a272c240 88be9476 9fd16650".replace(/ /g, ""), "hex")
        }
    };
    module.exports = {
        info: algInfo,
        privInfo: algPrivInfo,
        hashAlgs: {
            md5: !0,
            sha1: !0,
            sha256: !0,
            sha384: !0,
            sha512: !0
        },
        curves: curves
    };
}
