"use strict";

/// <reference path="./lib/knockout.d.ts" />
/// <reference path="./lib/jquery.d.ts" />

function init() {
    let tabs = new Tabs();
    ko.applyBindings(tabs, document.getElementById("header"));

    let shamir = new Shamir(3, 5);
    ko.applyBindings(shamir, document.getElementById("Shamir"));
}

// Tabs
class Tabs {
    constructor() {
        this.tabs = ko.observableArray();
        this.tabs.push(new Tab("Shamir", "Shamir's Secret Sharing"));
        this.tabs.push(new Tab("VSS", "Verifiable Secret Sharing"));
        this.tabs.push(new Tab("Schnorr", "Schnorr's Signature"));
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

// Shamir
class Shamir {
    constructor(m, n) {
        this.m = ko.observable(m);
        this.n = ko.observable(n);
        this.p = ko.observable("97");
        this.s = ko.observable("");
        this.rs = ko.observableArray([]);
        for (let i = 1; i < this.m(); i++) {
            this.rs.push(new ShamirRandom(this, ""));
        }
        this.ps = ko.observableArray([]);
        for (let i = 0; i < this.n(); i++) {
            this.ps.push(new ShamirPlayer(this, i + 1));
        }
    }
    set ns(value) {
        this.s("");
        this.s(mod(value, this.p()));
    }
    get ns() {
        return this.s();
    }
    setSecret() {
        this.s(rnd(this.p()).toString());
    }
    setRandom() {
        for (let i = 0; i < this.rs().length; i++) {
            let item = this.rs()[i];
            item.r = rnd(this.p()).toString();
        }
    }
    viewPlayer() {
        if (!this.s()) {
            return false;
        }
        for (let i = 0; i < this.rs().length; i++) {
            let item = this.rs()[i].r;
            if (!item) {
                return false;
            }
        }
        return true;
    }
    selectPlayer() {
        let cnt = 0;
        for (let i = 0; i < this.ps().length; i++) {
            let player = this.ps()[i];
            player.e(true);
            if (player.c()) {
                cnt++;
            }
        }
        if (cnt >= this.m()) {
            for (let i = 0; i < this.ps().length; i++) {
                let player = this.ps()[i];
                if (!player.c()) {
                    player.e(false);
                }
            }
        }
    }
    polynomial(x) {
        let as = [new BigInteger(this.s())];
        for (let i = 0; i < this.rs().length; i++) {
            as.push(new BigInteger("" + this.rs()[i].r));
        }
        let fx = BigInteger.ZERO;
        for (let i = 0; i < as.length; i++) {
            fx = fx.add(as[i].multiply(x.pow(new BigInteger(i.toString()))));
        }
        return mod(fx.toString(), this.p());
    }
    viewSecret() {
        let cnt = 0;
        for (let i = 0; i < this.ps().length; i++) {
            let player = this.ps()[i];
            player.e(true);
            if (player.c()) {
                cnt++;
            }
        }
        if (cnt >= this.m()) {
            return true;
        }
        return false;
    }
    de() {
        if (!this.viewSecret()) {
            return [];
        }
        let htmls = [];
        for (let i = 1; i <= this.m(); i++) {
            let html = "";
            for (let j = 1; j <= this.m(); j++) {
                if (i == j) {
                    continue;
                }
                html += "(x<sub>" + j + "</sub>-x<sub>" + i + "</sub>)";
            }
            htmls.push(html);
        }
        return htmls;
    }
    nu() {
        if (!this.viewSecret()) {
            return [];
        }
        let htmls = [];
        for (let i = 1; i <= this.m(); i++) {
            let html = {};
            html["rowspan"] = "2";
            html["css"] = "";
            if (i == 1) {
                html["html"] = "<td rowspan=\"2\">s = y<sub>" + i + "</sub></td>";
            } else {
                html["html"] = "<td rowspan=\"2\"> + y<sub>" + i + "</sub></td>";
            }
            htmls.push(html);
            html = {};
            html["rowspan"] = "1";
            html["css"] = "bunsu";
            html["html"] = "";
            for (let j = 1; j <= this.m(); j++) {
                if (i == j) {
                    continue;
                }
                html["html"] += "x<sub>" + j + "</sub>";
            }
            htmls.push(html);
        }
        let html = {};
        html["rowspan"] = "2";
        html["css"] = "";
        html["html"] = "<td rowspan=\"2\">&nbsp;mod p</sub></td>";
        htmls.push(html);
        return htmls;
    }
    dep() {
        if (!this.viewSecret()) {
            return [];
        }
        let signer = [];
        for (let i = 0; i < this.ps().length; i++) {
            let player = this.ps()[i];
            if (player.c()) {
                signer.push(player);
            }
        }
        let htmls = [];
        for (let i = 0; i < signer.length; i++) {
            let html = "";
            for (let j = 0; j < signer.length; j++) {
                if (i == j) {
                    continue;
                }
                html += "(" + signer[j].idx + "-" + signer[i].idx + ")";
            }
            htmls.push(html);
        }
        return htmls;
    }
    nup() {
        if (!this.viewSecret()) {
            return [];
        }
        let signer = [];
        for (let i = 0; i < this.ps().length; i++) {
            let player = this.ps()[i];
            if (player.c()) {
                signer.push(player);
            }
        }
        let htmls = [];
        for (let i = 0; i < signer.length; i++) {
            let html = {};
            html["rowspan"] = "2";
            html["css"] = "";
            if (i == 0) {
                html["html"] = "<td rowspan=\"2\">s = " + signer[i].y() + "</td>";
            } else {
                html["html"] = "<td rowspan=\"2\"> + " + signer[i].y() + "</td>";
            }
            htmls.push(html);
            html = {};
            html["rowspan"] = "1";
            html["css"] = "bunsu";
            html["html"] = "";
            let flg = false;
            for (let j = 0; j < signer.length; j++) {
                if (i == j) {
                    continue;
                }
                if (flg) {
                    html["html"] += "&times;" + signer[j].idx;
                } else {
                    html["html"] += "" + signer[j].idx;
                    flg = true;
                }
            }
            htmls.push(html);
        }
        let html = {};
        html["rowspan"] = "2";
        html["css"] = "";
        html["html"] = "<td rowspan=\"2\">&nbsp;mod " + this.p() + "</sub> = " + this.secret(signer) + "</td>";
        htmls.push(html);
        return htmls;
    }
    secret(signer) {
        let s = BigInteger.ZERO;
        let p = new BigInteger(this.p());
        for (let i = 0; i < signer.length; i++) {
            let xi = new BigInteger("" + signer[i].idx);
            let yi = new BigInteger("" + signer[i].y());
            let item = yi;
            for (let j = 0; j < signer.length; j++) {
                if (i == j) {
                    continue;
                }
                let xj = new BigInteger("" + signer[j].idx);
                let yj = new BigInteger("" + signer[j].y());
                item = item.multiply(xj);
                item = item.multiply(xj.subtract(xi).mod(p).modInverse(p));
            }
            s = s.add(item).mod(p);
        }
        return s.toString();
    }
}

class ShamirRandom {
    constructor(parent, value) {
        this.parent = parent;
        this.value = ko.observable("");
    }
    set r(value) {
        this.value("");
        this.value(mod(value, this.parent.p()));
    }
    get r() {
        return this.value();
    }
}

class ShamirPlayer {
    constructor(parent, idx) {
        this.parent = parent;
        this.idx = idx;
        this.c = ko.observable(false);
        this.e = ko.observable(true);
    }
    selectPlayer() {
        this.c(!this.c());
        this.parent.selectPlayer();
        return true;
    }
    y() {
        let x = new BigInteger("" + this.idx);
        return this.parent.polynomial(x).toString();
    }
}

function supnum(num) {
    let n = "";
    if (num > 1) {
        n = num;
    }
    return n;
}

function mod(i, p) {
    let x = new BigInteger(i, 10);
    let y = new BigInteger(p, 10);
    return x.mod(y).toString();
}

function rnd(i) {
    let bs = new Array(32);
    new SecureRandom().nextBytes(bs);
    return (new BigInteger(bs)).mod(new BigInteger(i));
}

$(init);