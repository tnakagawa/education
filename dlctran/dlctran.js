"use strict";

/// <reference path="./lib/knockout.d.ts" />
/// <reference path="./lib/jquery.d.ts" />

const DEBUG = false;
const SECP256K1 = KJUR.crypto.ECParameterDB.getByName("secp256k1");

function init() {
    let tabs = new Tabs();
    ko.applyBindings(tabs, document.getElementById("header"));

    let dlctran = new DlcTran();
    ko.applyBindings(dlctran, document.getElementById("dlctran"));
}

// Tabs
class Tabs {
    constructor() {
        this.tabs = ko.observableArray();
        this.tabs.push(new Tab("dlctran", "DLC Transaction"));
        //this.tabs.push(new Tab("etc", "Etc"));
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

class DlcTran {
    constructor() {
        this.Olivia = new Oracle("Olivia");
        this.Alice = new User("Alice", true);
        this.Bob = new User("Bob", false);
        this.Alice.Px = this.Bob.P1;
        this.Bob.Px = this.Alice.P1;
        this.Alice.Oracle = this.Olivia;
        this.Bob.Oracle = this.Olivia;
        this.viewflg = ko.observable(false);
        this.view2flg = ko.observable(false);
        this.User = ko.observable("");
    }
    view() {
        if (KJUR.lang.String.isHex(this.Alice.txid())
            && this.Alice.txid().length == 64
            && KJUR.lang.String.isHex(this.Bob.txid())
            && this.Bob.txid().length == 64) {
            this.viewflg(true);
            return true;
        }
        this.viewflg(false);
        return false;
    }
    view2() {
        let user = this.User();
        let msg = this.Olivia.Msgs[this.Olivia.Msg()];
        if (user && msg) {
            this.view2flg(true);
            return true;
        }
        this.view2flg(false);
        return false;
    }
    precmd() {
        let cmd = "";
        cmd += "# Send 2.0 BTC to Alice's wallet.\n"
        cmd += "bitcoin-cli -regtest sendtoaddress " + Util.addr(this.Alice.P0) + " 2.0\n";
        cmd += "# Send 2.0 BTC to Bob's wallet.\n"
        cmd += "bitcoin-cli -regtest sendtoaddress " + Util.addr(this.Bob.P0) + " 2.0\n";
        cmd += "bitcoin-cli -regtest generate 1\n";
        cmd += "\n";
        if (DEBUG) {
            cmd += "./bitcoin-cli -regtest sendmany \"\" \"{\\\"" + Util.addr(this.Alice.P0)
                + "\\\":2,\\\"" + Util.addr(this.Bob.P0) + "\\\":2}\"\n";
            cmd += "bitcoin-cli -regtest generate 1\n";
            cmd += "\n";
        }
        return cmd;
    }
    fundtx() {
        let tx = new Tx();
        if (!this.viewflg()) {
            return tx;
        }
        let txin0 = new TxIn(this.Alice.txid(), this.Alice.vout());
        tx.txin.push(txin0);
        let txin1 = new TxIn(this.Bob.txid(), this.Bob.vout());
        tx.txin.push(txin1);
        let txout0 = new TxOut(200001000, Script.p2wsh(Script.fund(this.Alice.P1, this.Bob.P1)));
        tx.txout.push(txout0);
        let txout1 = new TxOut(99999000, Script.p2wpkh(this.Alice.P0));
        tx.txout.push(txout1);
        let txout2 = new TxOut(99999000, Script.p2wpkh(this.Bob.P0));
        tx.txout.push(txout2);
        return tx;
    }
    exchangeSigs() {
        let fundScript = Script.fund(this.Alice.P1, this.Bob.P1);
        for (let msg in this.Olivia.Msgs) {
            let tx1 = this.cet(this.Bob, msg, !this.Bob.isA);
            this.Alice.Sigs[msg] = this.Bob.cetsig(tx1, fundScript);
            let tx2 = this.cet(this.Alice, msg, !this.Alice.isA);
            this.Bob.Sigs[msg] = this.Alice.cetsig(tx2, fundScript);
        }
        return true;
    }
    fundtxwithsig() {
        let tx = this.fundtx();
        if (!this.viewflg()) {
            return tx;
        }
        tx.txin[0].witnesses.push(this.Alice.fundsig(tx));
        tx.txin[0].witnesses.push(Util.p2s(this.Alice.P0));
        tx.txin[1].witnesses.push(this.Bob.fundsig(tx));
        tx.txin[1].witnesses.push(Util.p2s(this.Bob.P0));
        return tx;
    }
    cet(user, msg, isA) {
        let tx = new Tx();
        let txin0 = new TxIn(this.fundtx().id(), 0);
        tx.txin.push(txin0);
        let rate = user.rate(msg, isA);
        let txout0 = new TxOut(rate.amt, Script.p2wsh(rate.script));
        let txout1 = new TxOut(200000000 - rate.amt, Script.p2wpkh(rate.P));
        tx.txout.push(txout0);
        tx.txout.push(txout1);
        return tx;
    }
    sendcet() {
        if (!this.view2flg()) {
            return new Tx();
        }
        let user = this.Alice;
        if (this.User() == 'Bob') {
            user = this.Bob;
        }
        let tx = this.cet(user, this.Olivia.Msg(), user.isA);
        let fundScript = Script.fund(this.Alice.P1, this.Bob.P1);
        let sig = user.cetsig(tx, fundScript);
        tx.txin[0].witnesses.push("");
        if (user.isA) {
            tx.txin[0].witnesses.push(sig);
            tx.txin[0].witnesses.push(user.Sigs[this.Olivia.Msg()]);
        } else {
            tx.txin[0].witnesses.push(user.Sigs[this.Olivia.Msg()]);
            tx.txin[0].witnesses.push(sig);
        }
        tx.txin[0].witnesses.push(fundScript);
        return tx;
    }
    towallet() {
        let tx = new Tx();
        if (!this.view2flg()) {
            return tx;
        }
        let user = this.Alice;
        if (this.User() == 'Bob') {
            user = this.Bob;
        }
        let rate = user.rate(this.Olivia.Msg(), user.isA);
        let txin0 = new TxIn(this.sendcet().id(), 0);
        tx.txin.push(txin0);
        let txout0 = new TxOut(rate.amt - 1000, Script.p2wpkh(user.P1));
        tx.txout.push(txout0);
        let sigo = this.Olivia.Signature();
        let sig = user.towalletsig(tx, rate.script, rate.amt, sigo);
        tx.txin[0].witnesses.push(sig);
        tx.txin[0].witnesses.push("01");
        tx.txin[0].witnesses.push(rate.script);
        return tx;
    }
    toggle(target) {
        let tag = $("[data-toggle='" + target + "']");
        if (tag) {
            tag.toggle();
        }
    }
}

// actor

class Oracle {
    constructor(name) {
        this.name = name;
        this.xo = Util.rnd();
        if (DEBUG) {
            this.xo = new BigInteger(Crypto.sha256s(this.name + "0"), 16);
        }
        this.Po = SECP256K1['G'].multiply(this.xo);
        this.kn = Util.rnd();
        if (DEBUG) {
            this.kn = new BigInteger(Crypto.sha256s(this.name + "1"), 16);
        }
        this.Rn = SECP256K1['G'].multiply(this.kn);
        this.Msgs = { Fine: "01", Rain: "02" };
        this.Msg = ko.observable("");
    }
    static CR(Po, Rn, msg) {
        let h = new BigInteger(Crypto.sha256(Util.p2s(Rn) + msg));
        h = SECP256K1['n'].subtract(h.mod(SECP256K1['n']));
        return Rn.add(Po.multiply(h));
    }
    Signature() {
        if (!this.Msg()) {
            return null;
        }
        let msg = this.Msgs[this.Msg()];
        if (!msg) {
            return null;
        }
        let h = new BigInteger(Crypto.sha256(Util.p2s(this.Rn) + msg));
        h = SECP256K1['n'].subtract(h.mod(SECP256K1['n']));
        return this.kn.add(this.xo.multiply(h)).mod(SECP256K1['n']);
    }
}

class User {
    constructor(name, isA) {
        this.name = name;
        this.isA = isA;
        this.x0 = Util.rnd();
        if (DEBUG) {
            this.x0 = new BigInteger(Crypto.sha256s(this.name + "0"), 16);
        }
        this.P0 = SECP256K1['G'].multiply(this.x0);
        this.x1 = Util.rnd();
        if (DEBUG) {
            this.x1 = new BigInteger(Crypto.sha256s(this.name + "1"), 16);
        }
        this.P1 = SECP256K1['G'].multiply(this.x1);
        this.Px = null;
        this.Oracle = null;
        this.Sigs = { Fine: null, Rain: null };
        this.txid = ko.observable("");
        this.vout = ko.observable(0);
    }
    rate(msg, isA) {
        let amt = 150000000;
        if ((isA && msg == 'Rain') || (!isA && msg == 'Fine')) {
            amt = 50000000;
        }
        let P1 = this.P1;
        let P2 = this.Px;
        if (this.isA != isA) {
            P1 = this.Px;
            P2 = this.P1;
        }
        let Rn = Oracle.CR(this.Oracle.Po, this.Oracle.Rn, this.Oracle.Msgs[msg]);
        let script = Script.cet(P1, P2, Rn);
        return { amt: amt, script: script, P: P2 };
    }
    fundsig(tx) {
        let idx = 1;
        if (this.isA) {
            idx = 0;
        }
        let sighash = tx.sighash(idx, Script.p2pkh(this.P0), 200000000);
        return Crypto.sign(this.x0.toString(16), sighash) + "01";
    }
    cetsig(tx, script) {
        let sighash = tx.sighash(0, script, 200001000);
        return Crypto.sign(this.x1.toString(16), sighash) + "01";
    }
    towalletsig(tx, script, amt, sigo) {
        let sighash = tx.sighash(0, script, amt);
        let x = this.x1.add(sigo);
        return Crypto.sign(x.toString(16), sighash) + "01";
    }
}

// script

class Script {
    static p2pkh(p) {
        // OP_DUP OP_HASH160 <pubkey hash> OP_EQUALVERIFY OP_CHECKSIG 
        return "76a914" + Crypto.hash160(Util.p2s(p)) + "88ac";
    }
    static p2wpkh(p) {
        return "0014" + Crypto.hash160(Util.p2s(p));
    }
    static p2wsh(script) {
        return "0020" + Crypto.sha256(script);
    }
    static fund(Pa, Pb) {
        let script = "52"              // OP_2
        script += "21" + Util.p2s(Pa); // Public Key 1
        script += "21" + Util.p2s(Pb); // Public Key 2
        script += "52ae";              // OP_2 OP_CHECKMULTISIG
        return script;
    }
    static cet(P1, P2, Rn) {
        let script = "518763";                 // OP_1 OP_EQUAL OP_IF
        script += "21" + Util.p2s(P1.add(Rn)); // Public Key
        script += "67029000b275";              // OP_ELSE 144 OP_CHECKSEQUENCEVERIFY OP_DROP
        script += "21" + Util.p2s(P2);         // Public Key
        script += "68ac";                      // OP_ENDIF OP_CHECKSIG
        return script;
    }
}

// transaction

class Tx {
    constructor() {
        this.version = new Int32(2);
        this.txin = [];
        this.txout = [];
        this.segwit = true;
        this.locktime = new Int32(0);
    }
    serialize() {
        let hex = this.version.serialize();
        if (this.segwit) {
            hex += "00"; // marker
            hex += "01"; // flag
        }
        hex += (new VarInt(this.txin.length)).serialize();
        for (let i = 0; i < this.txin.length; i++) {
            hex += this.txin[i].serialize();
        }
        hex += (new VarInt(this.txout.length)).serialize();
        for (let i = 0; i < this.txout.length; i++) {
            hex += this.txout[i].serialize();
        }
        if (this.segwit) {
            for (let i = 0; i < this.txin.length; i++) {
                let ws = this.txin[i].witnesses;
                hex += (new VarInt(ws.length)).serialize();
                for (let j = 0; j < ws.length; j++) {
                    let w = Hex.hex(ws[j]);
                    hex += (new VarInt(w.length / 2)).serialize();;
                    hex += w;
                }
            }
        }
        hex += this.locktime.serialize();
        return hex;
    }
    sighash(idx, script, amount) {
        let hex = this.version.serialize(); // nVersion
        let prev = "";
        let seq = "";
        for (let i = 0; i < this.txin.length; i++) {
            prev += this.txin[i].outpoint();
            seq += this.txin[i].sequence.serialize();
        }
        hex += Crypto.hash256(prev); // hashPrevouts
        hex += Crypto.hash256(seq); // hashSequence
        let txin = this.txin[idx];
        hex += txin.outpoint(); // outpoint
        let scriptCode = Hex.hex(script);
        hex += (new VarInt(scriptCode.length / 2)).serialize();
        hex += scriptCode; // scriptCode
        hex += (new Int64(amount)).serialize(); // amount
        hex += txin.sequence.serialize(); // nSequence
        let outs = "";
        for (let i = 0; i < this.txout.length; i++) {
            outs += this.txout[i].serialize();
        }
        hex += Crypto.hash256(outs); // hashOutputs
        hex += this.locktime.serialize(); // nLocktime
        hex += (new Int32(1)).serialize(); // nHashType
        let hash = Crypto.hash256(hex);
        return hash;
    }
    id() {
        this.segwit = false;
        let txid = Hex.swap(Crypto.hash256(this.serialize()));
        this.segwit = true;
        return txid;
    }
}

class TxIn {
    constructor(hash, index) {
        this.hash = Hex.hex(hash);
        this.index = new Int32(index);
        this.script = "";
        this.sequence = new Int32(4294967295);
        this.witnesses = [];
    }
    serialize() {
        let hex = this.hash;
        while (hex.length < 64) {
            hex = "0" + hex;
        }
        hex = Hex.swap(hex);
        hex += this.index.serialize();
        hex += (new VarInt(this.script.length / 2)).serialize();
        hex += this.script;
        hex += this.sequence.serialize();
        return hex;
    }
    outpoint() {
        let hex = this.hash;
        while (hex.length < 64) {
            hex = "0" + hex;
        }
        hex = Hex.swap(hex);
        hex += this.index.serialize();
        return hex;
    }
}

class TxOut {
    constructor(value, script) {
        this.value = new Int64(value);
        this.script = Hex.hex(script);
    }
    serialize() {
        let hex = this.value.serialize();
        hex += (new VarInt(this.script.length / 2)).serialize();
        hex += this.script;
        return hex;
    }
}

class Int32 {
    constructor(i) {
        this.value = i;
    }
    serialize() {
        return Hex.n2h(this.value, 4);
    }
}

class Int64 {
    constructor(i) {
        this.value = i;
    }
    serialize() {
        return Hex.n2h(this.value, 8);
    }
}

class VarInt {
    constructor(i) {
        this.value = i;
    }
    serialize() {
        let hex = "";
        if (this.value < 0xFD) {
            hex = Hex.n2h(this.value, 1);
        } else if (this.value < 0xFFFF) {
            hex = "fd" + Hex.n2h(this.value, 2);
        } else if (this.value < 0xFFFFFFFF) {
            hex = "fe" + Hex.n2h(this.value, 4);
        } else {
            hex = "ff" + Hex.n2h(this.value, 8);
        }
        return hex;
    }
}

class Hex {
    static n2h(n, size) {
        let h = (new BigInteger("" + n, 10)).toString(16);
        if (h.length > size * 2) {
            h = h.substr(h.length - size * 2);
        } else {
            while (h.length != size * 2) {
                h = "0" + h;
            }
        }
        h = Hex.swap(h);
        return h;
    }
    static swap(h) {
        let hex = Hex.hex(h);
        let rhex = "";
        for (let i = hex.length; i > 0; i -= 2) {
            rhex += hex.substring(i - 2, i);
        }
        return rhex;
    }
    static hex(s) {
        let h = "";
        if (s != null && s.length > 0) {
            let tmp = s.replace(/\s+/g, "");
            if (tmp.match(/^[0-9a-fA-F]+$/g) && tmp.length % 2 == 0) {
                h = tmp.toLowerCase();
            }
        }
        return h;
    }
}

class Crypto {
    static sha256s(str) {
        let md = new KJUR.crypto.MessageDigest({ alg: "sha256", prov: "sjcl" }); // sjcl supports sha256 only
        let sha256 = md.digestString(str);
        return sha256;
    }
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
    static sign(prvkey, hash) {
        let sig = "";
        while (sig.length != 140) {
            let ec = new KJUR.crypto.ECDSA({ 'curve': 'secp256k1' });
            sig = ec.signHex(hash, prvkey);
        }
        return sig;
    }
}


class Util {
    static rnd() {
        let bs = new Array(32);
        new SecureRandom().nextBytes(bs);
        let x = new BigInteger(bs);
        x = x.mod(SECP256K1['n']);
        return x;
    }
    static p2s(p) {
        let x = p.getX().toBigInteger();
        let y = p.getY().toBigInteger();
        let hex = x.toString(16);
        while (hex.length < 64) {
            hex = "0" + hex;
        }
        let head = "03";
        if (y.isEven()) {
            head = "02";
        }
        return head + hex;
    }
    static addr(p) {
        let bech32 = new Bech32();
        return bech32.encode("bcrt", "00", Crypto.hash160(Util.p2s(p)));
    }
}

$(init);