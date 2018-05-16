
function init() {
    $("[data-type='eraser']").click(eraser);
    $("[data-type='copy']").click(copy);
    $("#hash160btn").click(hash160);
    $("#witnessscriptbtn").click(witnessscript);
    $("#sha256btn").click(sha256);
    $("#segwitaddrbtn").click(segwitaddr);
    $("#checktarget").keyup(checksegwitaddr);
    $("#qrdata").keyup(createQR);

    $(".tab").click(chgTab);
    $(".tab")[0].click();
};

function eraser() {
    let name = $(this).attr("data-name");
    if (name) {
        $("[data-eraser='" + name + "']").val("");
    }
};

function copy() {
    let id = $(this).attr("data-id");
    if (id) {
        var cp = document.getElementById(id);
        if (cp) {
            cp.select();
            cp.selectionStart = 0;
            cp.selectEnd = cp.value.length;
            document.execCommand("copy");
        }
    }
};

function chgTab() {
    let tabid = $(this).attr("data-name");
    if ("block" !== $("#" + tabid).css("display")) {
        $(".tab").css("background-color", "lightgray");
        $(this).css("background-color", "white");
        $(".page").hide();
        $("#" + tabid).fadeIn("fast");
    }
    window.scrollTo(0, 0);
};

function hash160() {
    let hex = $("#hash160hex").val();
    if (hex && KJUR.lang.String.isHex(hex)) {
        let sha256md = new KJUR.crypto.MessageDigest({ alg: "sha256", prov: "sjcl" }); // sjcl supports sha256 only
        let sha256 = sha256md.digestHex(hex);
        let ripemd160md = new KJUR.crypto.MessageDigest({ alg: "ripemd160", prov: "cryptojs" });
        let ripemd160 = ripemd160md.digestHex(sha256);
        $("#hash160hash").val(ripemd160);
    }
}

function witnessscript() {
    let pubkey = $("#witnessscriptpubkey").val();
    if (pubkey && KJUR.lang.String.isHex(pubkey)) {
        pubkey = pubkey.toLowerCase();
        let size = (pubkey.length / 2).toString(16);
        if (size.length % 2 == 1) {
            size = "0" + size;
        }
        $("#witnessscripthex").val(size + pubkey + "ac");
    }
}

function sha256() {
    let hex = $("#sha256hex").val();
    if (hex && KJUR.lang.String.isHex(hex)) {
        let sha256md = new KJUR.crypto.MessageDigest({ alg: "sha256", prov: "sjcl" }); // sjcl supports sha256 only
        let sha256 = sha256md.digestHex(hex);
        $("#sha256hash").val(sha256);
    }
}

function segwitaddr() {
    let hrp = $("#segwitaddrhrp").val();
    let ver = parseInt($("#segwitaddrver").val(), 10);
    let wp = $("#segwitaddrwp").val();
    if (hrp && !isNaN(ver) && wp && KJUR.lang.String.isHex(wp)) {
        let program = [];
        for (let i = 0; i < wp.length; i += 2) {
            program.push(parseInt(wp.substr(i, 2), 16));
        }
        let segwitaddr = segwit_addr_encode(hrp, ver, program);
        if (segwitaddr) {
            $("#segwitaddr").val(segwitaddr);
        }
    }
}

function checksegwitaddr() {
    $("#checkmessage").text("");
    $("#checkmessage").removeClass("green");
    $("#checkmessage").removeClass("red");
    $("#checkresult").html("");
    let segwitaddr = $("#checktarget").val();
    if (segwitaddr) {
        let pos = segwitaddr.lastIndexOf("1");
        if (pos >= 0) {
            let hrp = segwitaddr.substring(0, pos);
            let check = segwit_addr_ecc_check(segwitaddr, hrp);
            if (check.error == null) {
                $("#checkmessage").addClass("green");
                $("#checkmessage").text("OK");
                $("#checkresult").html(segwitaddr);
            } else {
                $("#checkmessage").addClass("red");
                $("#checkmessage").text(check.error);
                let pos = check.pos;
                console.log(pos);
                if (pos) {
                    for (let i = 0; i < segwitaddr.length; i++) {
                        let c = segwitaddr[i];
                        let red = false;
                        for (let p of pos) {
                            if (i == p) {
                                red = true;
                                break;
                            }
                        }
                        if (red) {
                            $("#checkresult").append($("<span>").addClass("red").text(c));
                        } else {
                            $("#checkresult").append(c);
                        }
                    }
                }
            }
        } else {
            $("#checkmessage").addClass("red");
            $("#checkmessage").text("none separator");
        }
    }
}

function createQR() {
    let qrdata = $("#qrdata").val();
    if (qrdata) {
        $("#qrdatasize").text(("" + qrdata).length);
        QR_main(document.getElementById("amode"), "" + qrdata, 1, 1, 0, 0, 10);
        QR_main(document.getElementById("bmode"), "" + qrdata, 2, 1, 0, 0, 10);
    } else {
        $("#qrdatasize").text("0");
    }
}

$(init);