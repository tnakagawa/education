"use strict";

function df(date) {
    return "" + ('0' + date.getHours()).slice(-2) +
        ":" + ('0' + date.getMinutes()).slice(-2) +
        ":" + ('0' + date.getSeconds()).slice(-2) +
        "";
}

class Test {
    constructor() {
        this.logs = [];
    }
    log(text) {
        let now = new Date();
        let msg = "" + ('0' + now.getHours()).slice(-2) +
            ":" + ('0' + now.getMinutes()).slice(-2) +
            ":" + ('0' + now.getSeconds()).slice(-2) +
            " " + text;
        this.logs.push(msg);
    }
}

function TestA1() {
    let begin = new Date();
    let t = new Test();
    t.log("+++++ TestA1 +++++")
    for (let i = 0; i < TestVectorsA1.length; i++) {
        let test = TestVectorsA1[i];
        let block = chacha20_block(str2bs(test.key), test.counter, str2bs(test.nonce));
        console.log("A1", i, bs2str(block) == test.keystream);
        if (bs2str(block) == test.keystream) {
            t.log("chacha20_block case" + i + " Success.");
        } else {
            t.log("chacha20_block case" + i + " Fail.");
        }
    }
    let end = new Date();
    t.log("time " + (end - begin) + " ms.")
    return t;
}

function TestA2() {
    let begin = new Date();
    let t = new Test();
    t.log("+++++ TestA2 +++++")
    for (let i = 0; i < TestVectorsA2.length; i++) {
        let test = TestVectorsA2[i];
        let ctext = chacha20_encrypt(str2bs(test.key), test.counter, str2bs(test.nonce), str2bs(test.plaintext));
        console.log("A2(plain->chiper)", i, bs2str(ctext) == test.ciphertext);
        if (bs2str(ctext) == test.ciphertext) {
            t.log("chacha20_encrypt case" + i + " Success.");
        } else {
            t.log("chacha20_encrypt case" + i + " Fail.");
        }
        let ptext = chacha20_encrypt(str2bs(test.key), test.counter, str2bs(test.nonce), ctext);
        console.log("A2(chiper->plain)", i, bs2str(ptext) == test.plaintext);
        if (bs2str(ptext) == test.plaintext) {
            t.log("chacha20_encrypt case" + i + " Success.");
        } else {
            t.log("chacha20_encrypt case" + i + " Fail.");
        }
    }
    let end = new Date();
    t.log("time " + (end - begin) + " ms.")
    return t;
}

function TestA3() {
    let begin = new Date();
    let t = new Test();
    t.log("+++++ TestA3 +++++")
    for (let i = 0; i < TestVectorsA3.length; i++) {
        let test = TestVectorsA3[i];
        let tag = poly1305_mac(str2bs(test.msg), str2bs(test.key));
        console.log("A3", i, bs2str(tag) == test.tag);
        if (bs2str(tag) == test.tag) {
            t.log("poly1305_mac case " + i + " Success.");
        } else {
            t.log("poly1305_mac case " + i + " Fail.");
        }
    }
    let end = new Date();
    t.log("time " + (end - begin) + " ms.")
    return t;
}

function TestA4() {
    let begin = new Date();
    let t = new Test();
    t.log("+++++ TestA4 +++++")
    for (let i = 0; i < TestVectorsA4.length; i++) {
        let test = TestVectorsA4[i];
        let otk = poly1305_key_gen(str2bs(test.key), str2bs(test.nonce));
        console.log("A4", i, bs2str(otk) == test.otk);
        if (bs2str(otk) == test.otk) {
            t.log("poly1305_key_gen case" + i + " Success.");
        } else {
            t.log("poly1305_key_gen case" + i + " fail.");
        }
    }
    let end = new Date();
    t.log("time " + (end - begin) + " ms.")
    return t;
}

function TestA5() {
    let begin = new Date();
    let t = new Test();
    t.log("+++++ TestA5 +++++")
    TestA5_1(t);
    TestA5_2(t);
    let end = new Date();
    t.log("time " + (end - begin) + " ms.")
    return t;
}

function TestA5_1(t) {
    let plaintext = str2bs(
        "4c616469657320616e642047656e746c" +
        "656d656e206f662074686520636c6173" +
        "73206f66202739393a20496620492063" +
        "6f756c64206f6666657220796f75206f" +
        "6e6c79206f6e652074697020666f7220" +
        "746865206675747572652c2073756e73" +
        "637265656e20776f756c642062652069" +
        "742e");
    let add = str2bs("50515253c0c1c2c3c4c5c6c7");
    let key = str2bs(
        "808182838485868788898a8b8c8d8e8f" +
        "909192939495969798999a9b9c9d9e9f");
    let iv = str2bs("4041424344454647");
    let constant = str2bs("07000000");
    let nonce = constant.concat(iv);
    let enc = chacha20_aead_encrypt(key, nonce, plaintext, add);
    let chipertext = "d31a8d34648e60db7b86afbc53ef7ec2" +
        "a4aded51296e08fea9e2b5a736ee62d6" +
        "3dbea45e8ca9671282fafb69da92728b" +
        "1a71de0a9e060b2905d6a5b67ecd3b36" +
        "92ddbd7f2d778b8c9803aee328091b58" +
        "fab324e4fad675945585808b4831d7bc" +
        "3ff4def08e4b7a9de576d26586cec64b" +
        "6116";
    let tag = "1ae10b594f09e26a7e902ecbd0600691";
    console.log("A5_1 enc", (chipertext + tag) == bs2str(enc));
    if ((chipertext + tag) == bs2str(enc)) {
        t.log("chacha20_aead_encrypt case0 Success.");
    } else {
        t.log("chacha20_aead_encrypt case0 Fail.");
    }
    try {
        let dec = chacha20_aead_decrypt(key, nonce, add, enc);
        console.log("A5_1 dec", bs2str(dec) == bs2str(plaintext));
        if (bs2str(dec) == bs2str(plaintext)) {
            t.log("chacha20_aead_decrypt case0 Success.");
        } else {
            t.log("chacha20_aead_decrypt case0 Fail.");
        }
    } catch (e) {
        t.log("chacha20_aead_decrypt case0 Fail. " + e.message);
    }
}

function TestA5_2(t) {
    let plaintext = str2bs(
        "496e7465726e65742d44726166747320" +
        "61726520647261667420646f63756d65" +
        "6e74732076616c696420666f72206120" +
        "6d6178696d756d206f6620736978206d" +
        "6f6e74687320616e64206d6179206265" +
        "20757064617465642c207265706c6163" +
        "65642c206f72206f62736f6c65746564" +
        "206279206f7468657220646f63756d65" +
        "6e747320617420616e792074696d652e" +
        "20497420697320696e617070726f7072" +
        "6961746520746f2075736520496e7465" +
        "726e65742d4472616674732061732072" +
        "65666572656e6365206d617465726961" +
        "6c206f7220746f206369746520746865" +
        "6d206f74686572207468616e20617320" +
        "2fe2809c776f726b20696e2070726f67" +
        "726573732e2fe2809d");
    let add = str2bs("f33388860000000000004e91");
    let key = str2bs(
        "1c9240a5eb55d38af333888604f6b5f0" +
        "473917c1402b80099dca5cbc207075c0");
    let nonce = str2bs("000000000102030405060708");
    let enc = chacha20_aead_encrypt(key, nonce, plaintext, add);
    let chipertext = "64a0861575861af460f062c79be643bd" +
        "5e805cfd345cf389f108670ac76c8cb2" +
        "4c6cfc18755d43eea09ee94e382d26b0" +
        "bdb7b73c321b0100d4f03b7f355894cf" +
        "332f830e710b97ce98c8a84abd0b9481" +
        "14ad176e008d33bd60f982b1ff37c855" +
        "9797a06ef4f0ef61c186324e2b350638" +
        "3606907b6a7c02b0f9f6157b53c867e4" +
        "b9166c767b804d46a59b5216cde7a4e9" +
        "9040c5a40433225ee282a1b0a06c523e" +
        "af4534d7f83fa1155b0047718cbc546a" +
        "0d072b04b3564eea1b422273f548271a" +
        "0bb2316053fa76991955ebd63159434e" +
        "cebb4e466dae5a1073a6727627097a10" +
        "49e617d91d361094fa68f0ff77987130" +
        "305beaba2eda04df997b714d6c6f2c29" +
        "a6ad5cb4022b02709b";
    let tag = "eead9d67890cbb22392336fea1851f38";
    console.log("A5_2 enc", (chipertext + tag) == bs2str(enc));
    if ((chipertext + tag) == bs2str(enc)) {
        t.log("chacha20_aead_encrypt case1 Success.");
    } else {
        t.log("chacha20_aead_encrypt case1 Fail.");
    }
    try {
        let dec = chacha20_aead_decrypt(key, nonce, add, enc);
        console.log("A5_2 dec", bs2str(dec) == bs2str(plaintext));
        if (bs2str(dec) == bs2str(plaintext)) {
            t.log("chacha20_aead_decrypt case1 Success.");
        } else {
            t.log("chacha20_aead_decrypt case1 Fail.");
        }
    } catch (e) {
        t.log("chacha20_aead_decrypt case1 Fail. " + e.message);
    }
}

function bs2str(bs) {
    let s = "";
    for (let i = 0; i < bs.length; i++) {
        if (bs[i] > 0xf) {
            s += bs[i].toString(16);
        } else {
            s += "0" + bs[i].toString(16);
        }
    }
    return s;
}

function str2bs(str) {
    let s = str.split(' ').join('');
    let bs = [];
    for (let i = 0; i < s.length; i += 2) {
        bs.push(parseInt(s.substring(i, i + 2), 16));
    }
    return bs;
}

const TestVectorsA1 = [
    {
        key: "0000000000000000000000000000000000000000000000000000000000000000",
        nonce: "000000000000000000000000",
        counter: 0,
        keystream: "76b8e0ada0f13d90405d6ae55386bd28bdd219b8a08ded1aa836efcc8b770dc7da41597c5157488d7724e03fb8d84a376a43b8f41518a11cc387b669b2ee6586",
    },
    {
        key: "0000000000000000000000000000000000000000000000000000000000000000",
        nonce: "000000000000000000000000",
        counter: 1,
        keystream: "9f07e7be5551387a98ba977c732d080dcb0f29a048e3656912c6533e32ee7aed29b721769ce64e43d57133b074d839d531ed1f28510afb45ace10a1f4b794d6f",
    },
    {
        key: "0000000000000000000000000000000000000000000000000000000000000001",
        nonce: "000000000000000000000000",
        counter: 1,
        keystream: "3aeb5224ecf849929b9d828db1ced4dd832025e8018b8160b82284f3c949aa5a8eca00bbb4a73bdad192b5c42f73f2fd4e273644c8b36125a64addeb006c13a0",
    },
    {
        key: "00ff000000000000000000000000000000000000000000000000000000000000",
        nonce: "000000000000000000000000",
        counter: 2,
        keystream: "72d54dfbf12ec44b362692df94137f328fea8da73990265ec1bbbea1ae9af0ca13b25aa26cb4a648cb9b9d1be65b2c0924a66c54d545ec1b7374f4872e99f096",
    },
    {
        key: "0000000000000000000000000000000000000000000000000000000000000000",
        nonce: "000000000000000000000002",
        counter: 0,
        keystream: "c2c64d378cd536374ae204b9ef933fcd1a8b2288b3dfa49672ab765b54ee27c78a970e0e955c14f3a88e741b97c286f75f8fc299e8148362fa198a39531bed6d",
    },
];

const TestVectorsA2 = [
    {
        key: "0000000000000000000000000000000000000000000000000000000000000000",
        nonce: "000000000000000000000000",
        counter: 0,
        plaintext: "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        ciphertext: "76b8e0ada0f13d90405d6ae55386bd28bdd219b8a08ded1aa836efcc8b770dc7da41597c5157488d7724e03fb8d84a376a43b8f41518a11cc387b669b2ee6586",
    },
    {
        key: "0000000000000000000000000000000000000000000000000000000000000001",
        nonce: "000000000000000000000002",
        counter: 1,
        plaintext: "416e79207375626d697373696f6e20746f20746865204945544620696e74656e6465642062792074686520436f6e7472696275746f7220666f72207075626c69636174696f6e20617320616c6c206f722070617274206f6620616e204945544620496e7465726e65742d4472616674206f722052464320616e6420616e792073746174656d656e74206d6164652077697468696e2074686520636f6e74657874206f6620616e204945544620616374697669747920697320636f6e7369646572656420616e20224945544620436f6e747269627574696f6e222e20537563682073746174656d656e747320696e636c756465206f72616c2073746174656d656e747320696e20494554462073657373696f6e732c2061732077656c6c206173207772697474656e20616e6420656c656374726f6e696320636f6d6d756e69636174696f6e73206d61646520617420616e792074696d65206f7220706c6163652c207768696368206172652061646472657373656420746f",
        ciphertext: "a3fbf07df3fa2fde4f376ca23e82737041605d9f4f4f57bd8cff2c1d4b7955ec2a97948bd3722915c8f3d337f7d370050e9e96d647b7c39f56e031ca5eb6250d4042e02785ececfa4b4bb5e8ead0440e20b6e8db09d881a7c6132f420e52795042bdfa7773d8a9051447b3291ce1411c680465552aa6c405b7764d5e87bea85ad00f8449ed8f72d0d662ab052691ca66424bc86d2df80ea41f43abf937d3259dc4b2d0dfb48a6c9139ddd7f76966e928e635553ba76c5c879d7b35d49eb2e62b0871cdac638939e25e8a1e0ef9d5280fa8ca328b351c3c765989cbcf3daa8b6ccc3aaf9f3979c92b3720fc88dc95ed84a1be059c6499b9fda236e7e818b04b0bc39c1e876b193bfe5569753f88128cc08aaa9b63d1a16f80ef2554d7189c411f5869ca52c5b83fa36ff216b9c1d30062bebcfd2dc5bce0911934fda79a86f6e698ced759c3ff9b6477338f3da4f9cd8514ea9982ccafb341b2384dd902f3d1ab7ac61dd29c6f21ba5b862f3730e37cfdc4fd806c22f221",
    },
    {
        key: "1c9240a5eb55d38af333888604f6b5f0473917c1402b80099dca5cbc207075c0",
        nonce: "000000000000000000000002",
        counter: 42,
        plaintext: "2754776173206272696c6c69672c20616e642074686520736c6974687920746f7665730a446964206779726520616e642067696d626c6520696e2074686520776162653a0a416c6c206d696d737920776572652074686520626f726f676f7665732c0a416e6420746865206d6f6d65207261746873206f757467726162652e",
        ciphertext: "62e6347f95ed87a45ffae7426f27a1df5fb69110044c0d73118effa95b01e5cf166d3df2d721caf9b21e5fb14c616871fd84c54f9d65b283196c7fe4f60553ebf39c6402c42234e32a356b3e764312a61a5532055716ead6962568f87d3f3f7704c6a8d1bcd1bf4d50d6154b6da731b187b58dfd728afa36757a797ac188d1",
    },
];

const TestVectorsA3 = [
    {
        key: "0000000000000000000000000000000000000000000000000000000000000000",
        msg: "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        tag: "00000000000000000000000000000000",
    },
    {
        key: "0000000000000000000000000000000036e5f6b5c5e06070f0efca96227a863e",
        msg: "416e79207375626d697373696f6e20746f20746865204945544620696e74656e6465642062792074686520436f6e7472696275746f7220666f72207075626c69636174696f6e20617320616c6c206f722070617274206f6620616e204945544620496e7465726e65742d4472616674206f722052464320616e6420616e792073746174656d656e74206d6164652077697468696e2074686520636f6e74657874206f6620616e204945544620616374697669747920697320636f6e7369646572656420616e20224945544620436f6e747269627574696f6e222e20537563682073746174656d656e747320696e636c756465206f72616c2073746174656d656e747320696e20494554462073657373696f6e732c2061732077656c6c206173207772697474656e20616e6420656c656374726f6e696320636f6d6d756e69636174696f6e73206d61646520617420616e792074696d65206f7220706c6163652c207768696368206172652061646472657373656420746f",
        tag: "36e5f6b5c5e06070f0efca96227a863e",
    },
    {
        key: "36e5f6b5c5e06070f0efca96227a863e00000000000000000000000000000000",
        msg: "416e79207375626d697373696f6e20746f20746865204945544620696e74656e6465642062792074686520436f6e7472696275746f7220666f72207075626c69636174696f6e20617320616c6c206f722070617274206f6620616e204945544620496e7465726e65742d4472616674206f722052464320616e6420616e792073746174656d656e74206d6164652077697468696e2074686520636f6e74657874206f6620616e204945544620616374697669747920697320636f6e7369646572656420616e20224945544620436f6e747269627574696f6e222e20537563682073746174656d656e747320696e636c756465206f72616c2073746174656d656e747320696e20494554462073657373696f6e732c2061732077656c6c206173207772697474656e20616e6420656c656374726f6e696320636f6d6d756e69636174696f6e73206d61646520617420616e792074696d65206f7220706c6163652c207768696368206172652061646472657373656420746f",
        tag: "f3477e7cd95417af89a6b8794c310cf0",
    },
    {
        key: "1c9240a5eb55d38af333888604f6b5f0473917c1402b80099dca5cbc207075c0",
        msg: "2754776173206272696c6c69672c20616e642074686520736c6974687920746f7665730a446964206779726520616e642067696d626c6520696e2074686520776162653a0a416c6c206d696d737920776572652074686520626f726f676f7665732c0a416e6420746865206d6f6d65207261746873206f757467726162652e",
        tag: "4541669a7eaaee61e708dc7cbcc5eb62",
    },
    {
        key: "0200000000000000000000000000000000000000000000000000000000000000",
        msg: "ffffffffffffffffffffffffffffffff",
        tag: "03000000000000000000000000000000",
    },
    {
        key: "02000000000000000000000000000000ffffffffffffffffffffffffffffffff",
        msg: "02000000000000000000000000000000",
        tag: "03000000000000000000000000000000",
    },
    {
        key: "0100000000000000000000000000000000000000000000000000000000000000",
        msg: "fffffffffffffffffffffffffffffffff0ffffffffffffffffffffffffffffff11000000000000000000000000000000",
        tag: "05000000000000000000000000000000",
    },
    {
        key: "0100000000000000000000000000000000000000000000000000000000000000",
        msg: "fffffffffffffffffffffffffffffffffbfefefefefefefefefefefefefefefe01010101010101010101010101010101",
        tag: "00000000000000000000000000000000",
    },
    {
        key: "0200000000000000000000000000000000000000000000000000000000000000",
        msg: "fdffffffffffffffffffffffffffffff",
        tag: "faffffffffffffffffffffffffffffff",
    },
    {
        key: "0100000000000000040000000000000000000000000000000000000000000000",
        msg: "e33594d7505e43b900000000000000003394d7505e4379cd01000000000000000000000000000000000000000000000001000000000000000000000000000000",
        tag: "14000000000000005500000000000000",
    },
    {
        key: "0100000000000000040000000000000000000000000000000000000000000000",
        msg: "e33594d7505e43b900000000000000003394d7505e4379cd010000000000000000000000000000000000000000000000",
        tag: "13000000000000000000000000000000",
    },
];

const TestVectorsA4 = [
    {
        key: "0000000000000000000000000000000000000000000000000000000000000000",
        nonce: "000000000000000000000000",
        otk: "76b8e0ada0f13d90405d6ae55386bd28bdd219b8a08ded1aa836efcc8b770dc7",
    },
    {
        key: "0000000000000000000000000000000000000000000000000000000000000001",
        nonce: "000000000000000000000002",
        otk: "ecfa254f845f647473d3cb140da9e87606cb33066c447b87bc2666dde3fbb739",
    },
    {
        key: "1c9240a5eb55d38af333888604f6b5f0473917c1402b80099dca5cbc207075c0",
        nonce: "000000000000000000000002",
        otk: "965e3bc6f9ec7ed9560808f4d229f94b137ff275ca9b3fcbdd59deaad23310ae",
    },
];
