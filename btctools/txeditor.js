"use strict";

function init() {
    let tabs = new Tabs();
    ko.applyBindings(tabs, document.getElementById("header"));

    let wtx = new Wtx();
    ko.applyBindings(wtx, document.getElementById("tx"));

    let signature = new Signature(wtx);
    ko.applyBindings(signature, document.getElementById("signature"));

    let script = new Script();
    ko.applyBindings(script, document.getElementById("script"));
    let tags = [];
    for (let key in OP_CODE_TYPE) {
        tags.push(key);
    }

    let hdwallets = new HDWallets();
    ko.applyBindings(hdwallets, document.getElementById("hdwallets"));

    new Suggest.LocalMulti(
        "scriptcode",      // 入力のエレメントID
        "suggest",         // 補完候補を表示するエリアのID
        tags,              // 補完候補の検索対象となる配列
        { dispMax: 10 });  // オプション

    let memos = new Memos();
    ko.applyBindings(memos, document.getElementById("memo"));

    let etc = new Etc(wtx);
    ko.applyBindings(etc, document.getElementById("etc"));
}

// Tabs
class Tabs {
    constructor() {
        this.tabs = ko.observableArray();
        this.tabs.push(new Tab("tx", "Transaction"));
        this.tabs.push(new Tab("signature", "Signature(HASHTYPE_ALL)"));
        this.tabs.push(new Tab("script", "Script"));
        this.tabs.push(new Tab("hdwallets", "HD Wallets"));
        this.tabs.push(new Tab("memo", "Memo"));
        this.tabs.push(new Tab("etc", "Etc"));
        // this.tabs.push(new Tab("debug", "Debug"));
        this.show(this.tabs()[0]);
    }
    show(data) {
        for (let i = 0; i < this.tabs().length; i++) {
            let item = this.tabs()[i];
            if (item.id === data.id) {
                item.css("menu clickable select");
                $("#" + item.id).delay(100).fadeIn(100);
            } else {
                item.css("menu clickable");
                $("#" + item.id).fadeOut(100);
            }
        }
        window.scrollTo(0, 0);
    }
}

class Tab {
    constructor(id, title) {
        this.id = id;
        this.title = title;
        this.css = ko.observable("menu clickable");
    }
}

// Transaction
class Wtx {
    constructor() {
        this.version = ko.observable("02000000");
        this.marker = ko.observable("00");
        this.flag = ko.observable("01");
        this.txins = ko.observableArray();
        this.txouts = ko.observableArray();
        this.lockTime = ko.observable("00000000");
        this.segwit = ko.observable(true);
    }
    set nVersion(value) {
        this.version(Util.n2h(value, 8));
    }
    get nVersion() {
        return Util.h2n(this.version());
    }
    set nMarker(value) {
        this.marker(Util.n2h(value, 2));
    }
    get nMarker() {
        return Util.h2n(this.marker());
    }
    set nFlag(value) {
        this.flag(Util.n2h(value, 2));
    }
    get nFlag() {
        return Util.h2n(this.flag());
    }
    set nLockTime(value) {
        this.lockTime(Util.n2h(value, 8));
    }
    get nLockTime() {
        return Util.h2n(this.lockTime());
    }
    get hex() {
        return this.serialize(this.segwit());
    }
    get txid() {
        return Util.swap(Crypto.hash256(this.serialize(false)));
    }
    addTxin() {
        if (this.txins().length < 5) {
            this.txins.push(new Txin(this));
        }
    }
    addTxout() {
        if (this.txouts().length < 5) {
            this.txouts.push(new Txout(this));
        }
    }
    serialize(segwit) {
        let seri = this.version();
        if (segwit) {
            seri += this.marker();
            seri += this.flag();
        }
        seri += Util.vi2h(this.txins().length);
        for (let i = 0; i < this.txins().length; i++) {
            let txin = this.txins()[i];
            seri += txin.serialize();
        }
        seri += Util.vi2h(this.txouts().length);
        for (let i = 0; i < this.txouts().length; i++) {
            let txout = this.txouts()[i];
            seri += txout.serialize();
        }
        if (segwit) {
            for (let i = 0; i < this.txins().length; i++) {
                let txin = this.txins()[i];
                seri += Util.vi2h(txin.witness().length);
                for (let j = 0; j < txin.witness().length; j++) {
                    let witness = txin.witness()[j];
                    seri += Util.vi2h(witness.script().length / 2);
                    seri += witness.script();
                }
            }
        }
        seri += this.lockTime();
        return seri;
    }
    toggleSegwit() {
        this.segwit(!this.segwit());
    }
    reset() {
        this.version("02000000");
        this.marker("00");
        this.flag("01");
        this.txins.removeAll();
        this.txouts.removeAll();
        this.lockTime("00000000");
    }
}

class Txin {
    constructor(wtx) {
        this.wtx = wtx;
        this.hash = ko.observable("");
        this.index = ko.observable("00000000");
        this.script = ko.observable("");
        this.sequence = ko.observable("ffffffff");
        this.witness = ko.observableArray();
        this.rhash = ko.observable("");
    }
    set txid(value) {
        this.hash(Util.swap(value));
        this.rhash(value);
    }
    get txid() {
        return this.rhash();
    }
    set nIndex(value) {
        this.index(Util.n2h(value, 8));
    }
    get nIndex() {
        return Util.h2n(this.index());
    }
    set tScript(value) {
        this.script(Util.hex(value));
    }
    set nSequence(value) {
        this.sequence(Util.n2h(value, 8));
    }
    get nSequence() {
        return Util.h2n(this.sequence());
    }
    addWitness() {
        this.witness.push(new Witness(this));
    }
    serialize() {
        let seri = this.hash();
        seri += this.index();
        seri += Util.vi2h(this.script().length / 2);
        seri += this.script();
        seri += this.sequence();
        return seri;
    }
    clearScript(txin) {
        $("[data-txins='" + this + "']").val("");
        txin.tScript = "";
    }
    clear() {
        this.txid = "";
    }
    reverse(txin) {
        let names = ("" + this).split(",");
        for (let i = 0; i < names.length; i++) {
            let hex = txin[names[i]]();
            hex = Util.swap(hex);
            if (hex) {
                txin[names[i]](hex);
            }
        }
    }
    remove() {
        this.wtx.txins.remove(this);
    }
}

class Witness {
    constructor(txin) {
        this.txin = txin;
        this.script = ko.observable("");
    }
    set tScript(value) {
        this.script(Util.hex(value));
    }
    clearScript(witness) {
        $("[data-witness='" + this + "']").val("");
        witness.tScript = "";
    }
    remove() {
        this.txin.witness.remove(this);
    }
    clear() {

    }
}

class Txout {
    constructor(wtx) {
        this.wtx = wtx;
        this.value = ko.observable("0000000000000000");
        this.script = ko.observable("");
    }
    set nValue(value) {
        this.value(Util.n2h(value, 16));
    }
    get nValue() {
        return Util.h2n(this.value());
    }
    get btc() {
        return Txout.s2b(Util.h2n(this.value()));
    }
    set tScript(value) {
        this.script(Util.hex(value));
    }
    clearScript(txin) {
        $("[data-txouts='" + this + "']").val("");
        txin.tScript = "";
    }
    remove() {
        this.wtx.txouts.remove(this);
    }
    serialize() {
        let seri = this.value();
        seri += Util.vi2h(this.script().length / 2);
        seri += this.script();
        return seri;
    }
    static s2b(satoshi) {
        let btc = satoshi;
        while (btc.length <= 8) {
            btc = "0" + btc;
        }
        btc = btc.slice(0, btc.length - 8) + "." + btc.substr(btc.length - 8);
        return btc;
    }
}

// Signature
class Signature {
    constructor(wtx) {
        this.wtx = wtx;
        // Signature
        this.prvkey = ko.observable("");
        this.sigdata = ko.observable("");
        this.hash256 = ko.observable("");
        this.sign = ko.observable("");
        this.signall = ko.observable("");
        // Swgwit Signature Data
        this.nVersion = ko.observable("");
        this.hashPrevouts = ko.observable("");
        this.hashSequence = ko.observable("");
        this.outpoint = ko.observable("");
        this.scriptCode = ko.observable("");
        this.amount = ko.observable("0000000000000000");
        this.nSequence = ko.observable("");
        this.hashOutputs = ko.observable("");
        this.nLocktime = ko.observable("");
        this.nHashType = ko.observable("");
        this.listtxin = ko.observableArray([]);
        this.selecttxin = ko.observable(null);
        // Segwit Signature
        this.wprvkey = ko.observable("");
        this.wsigdata = ko.observable("");
        this.whash256 = ko.observable("");
        this.wsign = ko.observable("");
        this.wsignall = ko.observable("");
    }
    set nAmount(value) {
        this.amount(Util.n2h(value, 16));
    }
    get nAmount() {
        return Util.h2n(this.amount());
    }
    get btc() {
        return Txout.s2b(Util.h2n(this.amount()));
    }
    txsign() {
        let prvkey = this.getPrvkey(this.prvkey());
        if (prvkey) {
            let sigdata = this.wtx.serialize(false) + "01000000";
            this.sigdata(sigdata);
            let hash256 = Crypto.hash256(sigdata);
            this.hash256(hash256);
            let sign = Crypto.sign(prvkey, sigdata);
            this.sign(sign);
            this.signall(sign + "01");
        }
    }
    importtx() {
        this.clearimport();
        this.nVersion(this.wtx.version());
        let hashPrevouts = "";
        let hashSequence = "";
        for (let i = 0; i < this.wtx.txins().length; i++) {
            let txin = this.wtx.txins()[i];
            this.listtxin.push(new Item(i, txin));
            hashPrevouts += txin.hash() + txin.index();
            hashSequence += txin.sequence();
        }
        hashPrevouts = Crypto.hash256(hashPrevouts);
        hashSequence = Crypto.hash256(hashSequence);
        this.hashPrevouts(hashPrevouts);
        this.hashSequence(hashSequence);
        let hashOutputs = "";
        for (let i = 0; i < this.wtx.txouts().length; i++) {
            let txout = this.wtx.txouts()[i];
            hashOutputs += txout.serialize();
        }
        hashOutputs = Crypto.hash256(hashOutputs);
        this.hashOutputs(hashOutputs);
        this.nLocktime(this.wtx.lockTime());
        this.nHashType("01000000");
    }
    clearimport() {
        this.setEmpty("nVersion,hashPrevouts,hashSequence,outpoint,scriptCode,nSequence,hashOutputs,nLocktime,nHashType");
        this.amount("0000000000000000");
        this.listtxin.removeAll();
        this.selecttxin(null);
    }
    chgop() {
        let item = this.selecttxin();
        if (item) {
            this.outpoint(item.hash + item.index);
            this.nSequence(item.sequence);
        } else {
            this.outpoint("");
            this.nSequence("");
        }
    }
    wtxsign() {
        let prvkey = this.getPrvkey(this.wprvkey());
        if (prvkey) {
            let hex = this.nVersion();
            hex += this.hashPrevouts();
            hex += this.hashSequence();
            hex += this.outpoint();
            hex += Util.vi2h(this.scriptCode().length / 2);
            hex += this.scriptCode();
            hex += this.amount();
            hex += this.nSequence();
            hex += this.hashOutputs();
            hex += this.nLocktime();
            hex += this.nHashType();
            this.wsigdata(hex);
            let hash256 = Crypto.hash256(hex);
            this.whash256(hash256);
            let sign = Crypto.sign(prvkey, hex);
            this.wsign(sign);
            this.wsignall(sign + "01");
        }
    }
    getPrvkey(data) {
        let prvkey = null;
        let wif = Base58.checkDecode(data);
        if (wif) {
            prvkey = wif[0];
            if (prvkey.length == 66 && prvkey.substr(64) == "01") {
                prvkey = prvkey.substring(0, 64);
            } else if (prvkey.length == 64) {
                prvkey = prvkey.substring(0, 64);
            } else {
                prvkey = null;
            }
        } else {
            prvkey = Util.hex(data);
            if (!prvkey || prvkey.length != 64) {
                prvkey = null;
            }
        }
        return prvkey;
    }
    clear(signature) {
        signature.setEmpty(this);
    }
    setEmpty(targets, target) {
        let names = ("" + targets).split(",");
        for (let i = 0; i < names.length; i++) {
            if (this[names[i]]) {
                this[names[i]]("");
            }
        }
    }
    toggleType() {
        let target = "#" + this;
        let t = $(target).attr("type");
        if (t == "text") {
            $(target).attr("type", "password");
        } else {
            $(target).attr("type", "text");
        }
    }
}

class Item {
    constructor(index, txin) {
        this.hash = txin.hash();
        this.index = txin.index();
        this.sequence = txin.sequence();
        this.text = "txin[" + index + "]:" + this.hash + this.index + this.sequence;
    }
}

// Script
const OP_CODE_TYPE = {
    // push value
    OP_0: 0x00, OP_FALSE: 0x00, // OP_0,
    OP_PUSHDATA1: 0x4c, OP_PUSHDATA2: 0x4d, OP_PUSHDATA4: 0x4e, OP_1NEGATE: 0x4f, OP_RESERVED: 0x50,
    OP_1: 0x51, OP_TRUE: 0x51, //OP_1,
    OP_2: 0x52, OP_3: 0x53, OP_4: 0x54, OP_5: 0x55, OP_6: 0x56, OP_7: 0x57, OP_8: 0x58, OP_9: 0x59, OP_10: 0x5a, OP_11: 0x5b, OP_12: 0x5c, OP_13: 0x5d, OP_14: 0x5e, OP_15: 0x5f, OP_16: 0x60,
    // control
    OP_NOP: 0x61, OP_VER: 0x62, OP_IF: 0x63, OP_NOTIF: 0x64, OP_VERIF: 0x65, OP_VERNOTIF: 0x66, OP_ELSE: 0x67, OP_ENDIF: 0x68, OP_VERIFY: 0x69, OP_RETURN: 0x6a,
    // stack ops
    OP_TOALTSTACK: 0x6b, OP_FROMALTSTACK: 0x6c, OP_2DROP: 0x6d, OP_2DUP: 0x6e, OP_3DUP: 0x6f, OP_2OVER: 0x70, OP_2ROT: 0x71, OP_2SWAP: 0x72, OP_IFDUP: 0x73,
    OP_DEPTH: 0x74, OP_DROP: 0x75, OP_DUP: 0x76, OP_NIP: 0x77, OP_OVER: 0x78, OP_PICK: 0x79, OP_ROLL: 0x7a, OP_ROT: 0x7b, OP_SWAP: 0x7c, OP_TUCK: 0x7d,
    // splice ops
    OP_CAT: 0x7e, OP_SUBSTR: 0x7f, OP_LEFT: 0x80, OP_RIGHT: 0x81, OP_SIZE: 0x82,
    // bit logic
    OP_INVERT: 0x83, OP_AND: 0x84, OP_OR: 0x85, OP_XOR: 0x86, OP_EQUAL: 0x87, OP_EQUALVERIFY: 0x88, OP_RESERVED1: 0x89, OP_RESERVED2: 0x8a,
    // numeric
    OP_1ADD: 0x8b, OP_1SUB: 0x8c, OP_2MUL: 0x8d, OP_2DIV: 0x8e, OP_NEGATE: 0x8f, OP_ABS: 0x90, OP_NOT: 0x91, OP_0NOTEQUAL: 0x92,

    OP_ADD: 0x93, OP_SUB: 0x94, OP_MUL: 0x95, OP_DIV: 0x96, OP_MOD: 0x97, OP_LSHIFT: 0x98, OP_RSHIFT: 0x99,

    OP_BOOLAND: 0x9a, OP_BOOLOR: 0x9b, OP_NUMEQUAL: 0x9c, OP_NUMEQUALVERIFY: 0x9d, OP_NUMNOTEQUAL: 0x9e, OP_LESSTHAN: 0x9f, OP_GREATERTHAN: 0xa0, OP_LESSTHANOREQUAL: 0xa1, OP_GREATERTHANOREQUAL: 0xa2, OP_MIN: 0xa3, OP_MAX: 0xa4,

    OP_WITHIN: 0xa5,
    // crypto
    OP_RIPEMD160: 0xa6, OP_SHA1: 0xa7, OP_SHA256: 0xa8, OP_HASH160: 0xa9, OP_HASH256: 0xaa, OP_CODESEPARATOR: 0xab, OP_CHECKSIG: 0xac, OP_CHECKSIGVERIFY: 0xad, OP_CHECKMULTISIG: 0xae, OP_CHECKMULTISIGVERIFY: 0xaf,
    // expansion
    OP_NOP1: 0xb0, OP_CHECKLOCKTIMEVERIFY: 0xb1, OP_NOP2: 0xb1, // OP_CHECKLOCKTIMEVERIFY,
    OP_CHECKSEQUENCEVERIFY: 0xb2, OP_NOP3: 0xb2, // OP_CHECKSEQUENCEVERIFY,
    OP_NOP4: 0xb3, OP_NOP5: 0xb4, OP_NOP6: 0xb5, OP_NOP7: 0xb6, OP_NOP8: 0xb7, OP_NOP9: 0xb8, OP_NOP10: 0xb9,
    // template matching params
    OP_SMALLINTEGER: 0xfa, OP_PUBKEYS: 0xfb, OP_PUBKEYHASH: 0xfd, OP_PUBKEY: 0xfe,

    OP_INVALIDOPCODE: 0xff
};

class Script {
    constructor() {
        this.code = ko.observable("");
        this.hex = ko.observable("");
        this.errors = ko.observableArray();
        this.addr = ko.observable("");
        this.bech32 = ko.observable("");
        this.p2sh = ko.observable("");
        this.p2wsh = ko.observable("");
        this.test = ko.observable(true);
        $("[data-toggle='scriptaddress']").hide();
    }
    edit() {
        this.errors.removeAll();
        let text = $("#scriptcode").val();
        if (text) {
            let scripts = text.split(/\s+/);
            let hex = "";
            for (let i = 0; i < scripts.length; i++) {
                let code = ("" + scripts[i]).replace(/^[\s\u200d]+|[\s\u200d]+$/g, "");
                if (code) {
                    if (code.match(/^(OP_)/)) {
                        if (code in OP_CODE_TYPE) {
                            let value = OP_CODE_TYPE[code];
                            hex += Util.n2h(value, 2);
                        } else {
                            this.errors.push("Unknown OP CODE. " + code);
                        }
                    } else {
                        let data = Util.hex(code);
                        if (data) {
                            let len = data.length / 2;
                            if (len < 0x00fd) {
                                hex += Util.n2h(len, 2) + data;
                            } else {
                                this.errors.push("Sorry too long Hex Length. " + data);
                            }
                        } else {
                            this.errors.push("No Hex. " + code);
                        }
                    }
                }
            }
            this.hex(hex);
        }
    }
    clear() {
        this.errors.removeAll();
        this.code("");
        this.hex("");
    }
    errmsg() {
        let msg = "";
        for (let i = 0; i < this.errors().length; i++) {
            msg += this.errors()[i] + "\n";
        }
        return msg;
    }
    generate() {
        this.addr("");
        this.bech32("");
        this.p2sh("");
        this.p2wsh("");
        if (this.hex()) {
            let scripthash = Crypto.hash160(this.hex());
            let scriptbech32hash = Crypto.sha256(this.hex());
            console.log(scriptbech32hash);
            let addrver = "05";
            let hrp = "bc";
            if (this.test()) {
                addrver = "c4";
                hrp = "tb";
            }
            this.addr(Base58.checkEncode(scripthash, addrver));
            let bech32 = new Bech32();
            this.bech32(bech32.encode(hrp, 0, scriptbech32hash));
            this.p2sh("a914" + scripthash + "87");
            let md = new KJUR.crypto.MessageDigest({ alg: "sha256", prov: "sjcl" }); // sjcl supports sha256 only
            let sha256 = md.digestHex(this.hex());
            this.p2wsh("0020" + sha256);
        }
    }
}

const SECP256K1 = KJUR.crypto.ECParameterDB.getByName("secp256k1");

// HDWallets
class HDWallets {
    constructor() {
        this.seed = ko.observable("");
        this.path = ko.observable("");
        this.test = ko.observable(true);
        this.prv = ko.observable("");
        this.pub = ko.observable("");
        this.addr = ko.observable("");
        this.bech32 = ko.observable("");
        this.p2pkh = ko.observable("");
        this.p2wpkh = ko.observable("");
        this.hdwprvcp = ko.observable(false);
        this.size = ko.observable(24);
        this.mnemonic = ko.observable("");
        this.passphase = ko.observable("");
        this.mseed = ko.observable("");
        this.ecprv = ko.observable("");
        this.ecprva = ko.observable("");
        this.ecpub = ko.observable("");
        this.ecaddr = ko.observable("");
        this.ecbech32 = ko.observable("");
        this.ecp2pkh = ko.observable("");
        this.ecp2wpkh = ko.observable("");
        this.ectest = ko.observable(true);
        this.ecprv1 = ko.observable("");
        this.ecprv2 = ko.observable("");
        this.ecprv3 = ko.observable("");
        this.ecpub1 = ko.observable("");
        this.ecpub2 = ko.observable("");
        this.ecpub3 = ko.observable("");
        $("[data-toggle='mnemonic']").hide();
        $("[data-toggle='ecdsa']").hide();
    }
    str2seed() {
        let str = window.prompt("Set sha256 of string to Seed");
        if (str) {
            let md = new KJUR.crypto.MessageDigest({ alg: "sha256", prov: "sjcl" }); // sjcl supports sha256 only
            let sha256 = md.digestString(str);
            this.seed(sha256);
            this.prv("");
            this.pub("");
            this.addr("");
            this.p2pkh("");
            this.p2wpkh("");
        }
    }
    generate() {
        this.prv("");
        this.pub("");
        this.addr("");
        this.bech32("");
        this.p2pkh("");
        this.p2wpkh("");
        let priver = "0488ade4";
        let pubver = "0488b21e";
        if (this.test()) {
            priver = "043587cf";
            pubver = "04358394";
        }
        let hdw = new HDW(priver, pubver);
        let format = hdw.derive(this.path(), this.seed());
        if (format) {
            let prvver = "80";
            let addrver = "00";
            let hrp = "bc";
            if (this.test()) {
                prvver = "ef";
                addrver = "6f";
                hrp = "tb";
            }
            this.prv(Base58.checkEncode(format.prv + "01", prvver));
            this.pub(format.pub);
            let pubhash = Crypto.hash160(format.pub);
            this.addr(Base58.checkEncode(pubhash, addrver));
            let bech32 = new Bech32();
            this.bech32(bech32.encode(hrp, 0, pubhash));
            this.p2pkh("76a914" + pubhash + "88ac");
            this.p2wpkh("0014" + pubhash);
        }
    }
    mgenerate() {
        let mnemonic = new Mnemonic();
        let mstr = mnemonic.generate(parseInt(this.size(), 10));
        this.mnemonic(mstr);
    }
    mnemonic2seed() {
        let mnemonic = new Mnemonic();
        if (mnemonic.check(this.mnemonic())) {
            let seed = mnemonic.seed(this.mnemonic(), this.passphase());
            if (seed) {
                this.mseed(seed);
            }
        }
    }
    toggleType(hdwallets) {
        let target = "#" + this;
        let t = $(target).attr("type");
        if (t == "text") {
            $(target).attr("type", "password");
        } else {
            $(target).attr("type", "text");
        }
        if (target == "#hdwprv") {
            hdwallets.hdwprvcp(t != "text");
        }
    }
    clear(hdwallets) {
        let names = ("" + this).split(",");
        for (let i = 0; i < names.length; i++) {
            if (hdwallets[names[i]]) {
                hdwallets[names[i]]("");
            }
        }
    }
    nextpath() {
        this.addpath(1);
    }
    prevpath() {
        this.addpath(-1);
    }
    addpath(num) {
        let path = this.path();
        if (path.match(/^m(\/[0-9]+[H']?)*$/)) {
            let items = path.split("/");
            let item = items[items.length - 1];
            let tail = "";
            let childNumber = 0;
            if (item.charAt(item.length - 1) == 'H' || item.charAt(item.length - 1) == '\'') {
                tail = "" + item.charAt(item.length - 1);
                childNumber = parseInt(item.substring(0, item.length - 1));
            } else {
                childNumber = parseInt(item);
            }
            childNumber += num;
            if (childNumber >= 0 && childNumber <= 1000) {
                this.path(path.substring(0, path.length - item.length) + childNumber + tail);
                this.generate();
            }
        }
    }
    multiply() {
        this.ecprva("");
        this.ecpub("");
        this.ecaddr("");
        this.ecbech32("");
        this.ecp2pkh("");
        this.ecp2wpkh("");
        let hex = Util.hex(this.ecprv());
        if (hex) {
            let prv = new BigInteger(hex, 16);
            prv = prv.mod(SECP256K1['n']);
            let p = SECP256K1['G'].multiply(prv);
            let pub = this.serP(p);
            this.ecpub(pub);
            let prvver = "80";
            let addrver = "00";
            let hrp = "bc";
            if (this.ectest()) {
                prvver = "ef";
                addrver = "6f";
                hrp = "tb";
            }
            let pubhash = Crypto.hash160(pub);
            this.ecprv(this.toHex(prv.toString(16), 32));
            this.ecprva(Base58.checkEncode(this.ecprv() + "01", prvver));
            this.ecaddr(Base58.checkEncode(pubhash, addrver));
            let bech32 = new Bech32();
            this.ecbech32(bech32.encode(hrp, 0, pubhash));
            this.ecp2pkh("76a914" + pubhash + "88ac");
            this.ecp2wpkh("0014" + pubhash);
        }
    }
    addprv() {
        this.ecprv3("");
        let prv1 = Util.hex(this.ecprv1());
        let prv2 = Util.hex(this.ecprv2());
        if (prv1 && prv2) {
            let prv1n = new BigInteger(prv1, 16);
            let prv2n = new BigInteger(prv2, 16);
            let prv3n = prv1n.add(prv2n).mod(SECP256K1['n']);
            this.ecprv1(this.toHex(prv1n.toString(16), 32));
            this.ecprv2(this.toHex(prv2n.toString(16), 32));
            this.ecprv3(this.toHex(prv3n.toString(16), 32));
        }
    }
    addpub() {
        this.ecpub3("");
        let pub1 = this.decompressPoint(this.ecpub1());
        let pub2 = this.decompressPoint(this.ecpub2());
        if (pub1 && pub2) {
            let pub3 = pub1.add(pub2);
            this.ecpub3(this.serP(pub3));
        }
    }
    toHex(hex, byteSize) {
        let ret = hex;
        while (ret.length < (byteSize * 2)) {
            ret = "0" + ret;
        }
        return ret;
    }
    decompressPoint(pub) {
        if (!Util.hex(pub)) {
            return null;
        }
        // ec.CurveFp.prototype.decompressPoint = function (yOdd, X) {
        //     if (this.q.mod(BigInteger.valueOf(4)).equals(BigInteger.valueOf(3))) {
        // secp256k1 is match condition.
        let curve = SECP256K1['curve'];
        let head = pub.substring(0, 2);
        if (head != "03" && head != "02") {
            return null;
        }
        let yOdd = (head == "03") ? true : false;
        let X = new BigInteger(pub.substr(2), 16);
        //         // y^2 = x^3 + ax^2 + b, so we need to perform sqrt to recover y
        //         var ySquared = X.multiply(X.square().add(this.a)).add(this.b);
        let b = curve.getB().toBigInteger();
        let ySquared = X.multiply(X.square()).add(b); // secp256k1 is a = 0;
        //         // sqrt(a) = a^((q+1)/4) if q = 3 mod 4
        //         var Y = ySquared.x.modPow(this.q.add(BigInteger.ONE).divide(BigInteger.valueOf(4)), this.q);
        let q = curve.getQ();
        let Y = ySquared.modPow(q.add(BigInteger.ONE).divide(new BigInteger("4")), q);
        //         if (Y.testBit(0) !== yOdd) {
        //             Y = this.q.subtract(Y);
        //         }
        if (Y.testBit(0) !== yOdd) {
            Y = q.subtract(Y);
        }
        //         return new ec.PointFp(this, X, this.fromBigInteger(Y));
        return new ECPointFp(curve, curve.fromBigInteger(X), curve.fromBigInteger(Y));
        //     }
        //     else {
        //         // only implement sqrt for q = 3 mod 4
        //         return null;
        //     }
        // };
    }
    serP(P) {
        let x = P.getX().toBigInteger();
        let y = P.getY().toBigInteger();
        let hex = this.toHex(x.toString(16), 32);
        let head = "03";
        if (y.isEven()) {
            head = "02";
        }
        return head + hex;
    }
}

// Memo
class Memos {
    constructor() {
        this.memos = ko.observableArray();
        this.title = ko.observable("");
        this.row = ko.observable(10);
        this.view = ko.observable(true);
        this.add(); this.add();
    }
    add() {
        if (this.memos().length < 10) {
            let title = this.title();
            if (!title) {
                let cnt = 1;
                if (this.memos().length > 0) {
                    let flg = false;
                    while (!flg) {
                        title = "memo" + cnt++;
                        flg = true;
                        for (let i = 0; i < this.memos().length; i++) {
                            let memo = this.memos()[i];
                            if (title == memo.title) {
                                flg = false;
                                break;
                            }
                        }
                    }
                } else {
                    title = "memo" + cnt;
                }
            }
            this.memos.push(new Memo(this, title, this.row(), this.view()));
        }
    }
}

class Memo {
    constructor(memos, title, row, view) {
        this.memos = memos;
        this.title = title;
        this.row = row;
        this.view = ko.observable(view);
        this.text = ko.observable("");
    }
    toggle() {
        this.view(!this.view());
    }
    remove() {
        this.memos.memos.remove(this);
    }
    clear() {
        this.text("");
    }
}

// Etc
class Etc {
    constructor(wtx) {
        this.wtx = wtx;
        this.hash160hex = ko.observable("");
        this.hash160hash = ko.observable("");
        this.base58cver = ko.observable("");
        this.base58chex = ko.observable("");
        this.base58c = ko.observable("");
        this.hash256hex = ko.observable("");
        this.hash256hash = ko.observable("");
        this.sha256hex = ko.observable("");
        this.sha256hash = ko.observable("");
        this.base58hex = ko.observable("");
        this.base58 = ko.observable("");
        this.hex = ko.observable("");
        this.int = ko.observable("");
        this.le = ko.observable(true);
        this.bech32hrp = ko.observable("");
        this.bech32ver = ko.observable(0);
        this.bech32hex = ko.observable("");
        this.bech32 = ko.observable("");
        let hides = ["hash256", "sha256", "hex2int", "base58", "bech32"];
        for (let i = 0; i < hides.length; i++) {
            $("[data-toggle='" + hides[i] + "']").hide();
        }
    }
    get segwit() {
        return this.wtx.segwit();
    }
    hash160() {
        let hex = Util.hex(this.hash160hex());
        this.hash160hash("");
        if (hex) {
            this.hash160hash(Crypto.hash160(hex));
        }
    }
    hash256() {
        let hex = Util.hex(this.hash256hex());
        this.hash256hash("");
        if (hex) {
            this.hash256hash(Crypto.hash256(hex));
        }
    }
    sha256() {
        let hex = Util.hex(this.sha256hex());
        this.sha256hash("");
        if (hex) {
            this.sha256hash(Crypto.sha256(hex));
        }
    }
    checkEncode() {
        let ver = Util.hex(this.base58cver());
        let hex = Util.hex(this.base58chex());
        this.base58c("");
        if (ver && hex) {
            this.base58c(Base58.checkEncode(hex, ver));
        }
    }
    checkDecode() {
        let base58c = this.base58c();
        let base58d = Base58.checkDecode(base58c);
        this.base58cver("");
        this.base58chex("");
        if (base58d) {
            this.base58cver(base58d[1]);
            this.base58chex(base58d[0]);
        }
    }
    base58enc() {
        let base58hex = Util.hex(this.base58hex());
        this.base58("");
        if (base58hex) {
            this.base58(Base58.encode(base58hex));
        }
    }
    base58dec() {
        let base58 = this.base58();
        this.base58hex("");
        if (base58) {
            this.base58hex(Base58.decode(base58));
        }
    }
    toInt() {
        let hex = null;
        this.int("");
        if (this.le()) {
            hex = Util.swap(this.hex());
        } else {
            hex = Util.hex(this.hex());
        }
        if (hex) {
            this.int((new BigInteger(hex, 16)).toString());
        }
    }
    bech32Encode() {
        this.bech32("");
        let hrp = this.bech32hrp();
        let ver = parseInt(this.bech32ver(), 10);
        let hex = Util.hex(this.bech32hex());
        console.log(hrp, ver, hex);
        if (hrp && ver != null && hex) {
            this.bech32ver(ver);
            let bech32 = new Bech32();
            this.bech32(bech32.encode(hrp, ver, hex));
        }
    }
    bech32Decode() {
        this.bech32hrp("");
        this.bech32ver(0);
        this.bech32hex("");
        let bech32addr = this.bech32();
        if (bech32addr) {
            let bech32 = new Bech32();
            let hrp = bech32addr.substring(0, bech32addr.indexOf("1")).toLowerCase();
            let bech32d = bech32.decode(hrp, bech32addr);
            if (bech32d) {
                this.bech32hrp(hrp);
                this.bech32ver(bech32d.version);
                this.bech32hex(bech32d.hex);
            }
        }
    }
    toggleSegwit() {
        this.wtx.segwit(!this.wtx.segwit());
    }
    clear(etc) {
        let names = ("" + this).split(",");
        for (let i = 0; i < names.length; i++) {
            if (names[i] == "bech32ver") {
                etc[names[i]](0);
                continue;
            }
            if (etc[names[i]]) {
                etc[names[i]]("");
            }
        }
    }
}

// Util
class Util {
    static n2h(num, len) {
        let hex = (new BigInteger("" + num, 10)).toString(16);
        hex = Util.fixSize(hex, len, "0");
        hex = Util.swap(hex);
        return hex;
    }
    static h2n(hex) {
        return (new BigInteger("00" + Util.swap(hex), 16)).toString(10);
    }
    static vi2h(num) {
        let head = "";
        let hex = null;
        if (num < 0xFD) {
            hex = Util.n2h(num, 2);
        } else if (num < 0xFFFF) {
            hex = "fd" + Util.n2h(num, 4);
        } else if (num < 0xFFFFFFFF) {
            hex = "fe" + Util.n2h(num, 8);
        } else {
            hex = "ff" + Util.n2h(num, 16);
        }
        return hex;
    }
    static fixSize(str, len, pad) {
        let fix = "";
        if (str.length > len) {
            fix = str.substr(str.length - len);
        } else {
            fix = str;
            while (fix.length < len) {
                fix = pad + fix;
            }
        }
        return fix;
    }
    static hex(str) {
        let hex = "";
        if (str != null && str.length > 0) {
            let tmp = str.replace(/\s+/g, "");
            if (tmp.match(/^[0-9a-fA-F]+$/g) && tmp.length % 2 == 0) {
                hex = tmp.toLowerCase();
            }
        }
        return hex;
    }
    static swap(hex) {
        let rhex = "";
        let tmp = Util.hex(hex);
        for (let i = 0; i < tmp.length; i += 2) {
            rhex += tmp.substr(tmp.length - (i + 2), 2);
        }
        return rhex;
    }
    static copy() {
        document.getElementById(this).select();
        document.execCommand("copy");
    }
    static toggle() {
        $("[data-toggle='" + this + "']").fadeToggle(100);
    }
}

class Crypto {
    static sha256(hex) {
        let md = new KJUR.crypto.MessageDigest({ alg: "sha256", prov: "sjcl" }); // sjcl supports sha256 only
        let sha256 = md.digestHex(hex);
        return sha256;
    }
    static ripemd160(hex) {
        let md = new KJUR.crypto.MessageDigest({ alg: "ripemd160", prov: "cryptojs" });
        let ripemd160 = md.digestHex(hex);
        return ripemd160;
    }
    static hash256(hex) {
        return Crypto.sha256(Crypto.sha256(hex));
    }
    static hash160(hex) {
        return Crypto.ripemd160(Crypto.sha256(hex));
    }
    static sign(prvkey, data) {
        let sig = "";
        while (sig.length != 140) {
            let ec = new KJUR.crypto.ECDSA({ 'curve': 'secp256k1' });
            sig = ec.signHex(Crypto.hash256(data), prvkey);
        }
        return sig;
    }
}

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

const BASE58_RADIX = new BigInteger("" + BASE58.length);

class Base58 {
    static encode(hex) {
        let x = new BigInteger(hex, 16);
        let base58 = "";
        while (x.compareTo(BigInteger.ZERO) > 0) {
            let dr = x.divideAndRemainder(BASE58_RADIX);
            base58 = BASE58[dr[1].intValue()] + base58;
            x = dr[0];
        }
        for (let i = 0; i < hex.length; i += 2) {
            if (hex.substr(i, 2) == "00") {
                base58 = BASE58[0] + base58;
            } else {
                break;
            }
        }
        return base58;
    }
    static checkEncode(hex, vhex) {
        let base58 = "";
        let tmp = vhex + hex;
        let checksum = Crypto.hash256(tmp);
        if (checksum) {
            base58 = this.encode(tmp + checksum.substring(0, 8));
        }
        return base58;
    }
    static decode(base58) {
        let answer = new BigInteger("0");
        let j = new BigInteger("1");
        let scratch = null;
        for (let i = base58.length - 1; i >= 0; i--) {
            let tmp = BASE58.indexOf(base58.charAt(i));
            if (tmp < 0) {
                return "";
            }
            scratch = new BigInteger("" + tmp);
            scratch = j.multiply(scratch);
            answer = answer.add(scratch);
            j = j.multiply(BASE58_RADIX);
        }
        let hex = "";
        if (answer.compareTo(BigInteger.ZERO) > 0) {
            hex = answer.toString(16);
            if (hex.length % 2 == 1) {
                hex = "0" + hex;
            }
        }
        let numZeros = null;
        for (numZeros = 0; numZeros < base58.length; numZeros++) {
            if (base58.charAt(numZeros) != "1") {
                break;
            } else {
                hex = "00" + hex;
            }
        }
        return hex;
    }
    static checkDecode(base58) {
        let ret = null;
        let tmp = this.decode(base58);
        if (tmp && tmp.length >= 10) {
            let ver = tmp.substring(0, 2);
            let hex = tmp.substring(2, tmp.length - 8);
            let cksum = tmp.substr(tmp.length - 8);
            if (Crypto.hash256(ver + hex).substring(0, 8) == cksum) {
                ret = [hex, ver];
            }
        }
        return ret;
    }
}

// load
$(init);
