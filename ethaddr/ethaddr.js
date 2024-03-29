'use strict';

function init() {
    document.getElementById('test_btn').addEventListener('click', doTest);
    document.getElementById('example_btn').addEventListener('click', doExample);
    document.getElementById('eip55_btn').addEventListener('click', doTestForEIP55);
    document.getElementById('isaddr_btn').addEventListener('click', doIsAddr);
    // console.log('--- Example ---')
    // example();
    // console.log('--- Test For EIP-55 ---')
    // testForEIP55();
    console.log('--- Change the end from 2 to 3 ---');
    console.log('0xd817D23c981472d703bE36da777FFDb1ABEFd972', isAddress('0xd817D23c981472d703bE36da777FFDb1ABEFd972'));
    console.log('0xd817D23c981472d703bE36da777FFDb1ABEFd973', isAddress('0xd817D23c981472d703bE36da777FFDb1ABEFd973'));
}

/**
 * doIsAddr
 */
function doIsAddr() {
    this.disabled = true;
    document.getElementById('isaddr_tbody').innerHTML = '';
    setTimeout(isAddr, 10);
}

/**
 * isAddr
 */
function isAddr() {
    document.getElementById('isaddr_tbody').innerHTML = '';
    let tbody = document.getElementById('isaddr_tbody');
    let tr1 = document.createElement('tr');
    let td1 = document.createElement('td');
    td1.classList.add('font-monospace');
    td1.innerText = '0xd817D23c981472d703bE36da777FFDb1ABEFd972 ' + isAddress('0xd817D23c981472d703bE36da777FFDb1ABEFd972');
    tr1.appendChild(td1);
    tbody.append(tr1);
    let tr2 = document.createElement('tr');
    let td2 = document.createElement('td');
    td2.classList.add('font-monospace');
    td2.innerText = '0xd817D23c981472d703bE36da777FFDb1ABEFd973 ' + isAddress('0xd817D23c981472d703bE36da777FFDb1ABEFd973');
    tr2.appendChild(td2);
    tbody.append(tr2);
    document.getElementById('isaddr_btn').disabled = false;
}

/**
 * doExample
 */
function doExample() {
    this.disabled = true;
    document.getElementById('example_tbody').innerHTML = '';
    setTimeout(example, 10);
}

/**
 * 例
 */
function example() {
    let pr = 40n;
    let web3 = new Web3();
    let account = web3.eth.accounts.privateKeyToAccount('0x' + hex32(pr));
    let address = A(pr);
    console.log(account.address);
    console.log(address, address == account.address);
    let checksumAddress = toChecksumAddress(address);
    console.log(checksumAddress, checksumAddress == account.address);
    // HTML
    document.getElementById('example_tbody').innerHTML = '';
    let tbody = document.getElementById('example_tbody');
    let tr1 = document.createElement('tr');
    let td1 = document.createElement('td');
    td1.classList.add('font-monospace');
    td1.innerText = account.address;
    tr1.appendChild(td1);
    tbody.append(tr1);
    let tr2 = document.createElement('tr');
    let td2 = document.createElement('td');
    td2.classList.add('font-monospace');
    td2.innerText = address + " " + (address == account.address);
    tr2.appendChild(td2);
    tbody.append(tr2);
    let tr3 = document.createElement('tr');
    let td3 = document.createElement('td');
    td3.classList.add('font-monospace');
    td3.innerText = checksumAddress + " " + (checksumAddress == account.address);
    tr3.appendChild(td3);
    tbody.append(tr3);
    document.getElementById('example_btn').disabled = false;
}

/**
 * doTestForEIP55
 */
function doTestForEIP55() {
    this.disabled = true;
    document.getElementById('eip55_tbody').innerHTML = '';
    setTimeout(testForEIP55, 10);
}

/**
 * テスト（EIP55 Test Case）
 */
function testForEIP55() {
    document.getElementById('eip55_tbody').innerHTML = '';
    let tbody = document.getElementById('eip55_tbody');
    let addressList = [
        // # All caps
        '0x52908400098527886E0F7030069857D2E4169EE7',
        '0x8617E340B3D01FA5F11F306F4090FD50E238070D',
        // # All Lower
        '0xde709f2102306220921060314715629080e2fb77',
        '0x27b1fdb04752bbc536007a920d24acb045561c26',
        // # Normal
        '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
        '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
        '0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB',
        '0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb',
    ];
    for (let addr of addressList) {
        console.log(addr, isAddress(addr));
        // HTML
        let td1 = document.createElement('td');
        td1.classList.add('font-monospace');
        td1.innerText = addr;
        let td2 = document.createElement('td');
        td2.classList.add('font-monospace');
        td2.innerText = isAddress(addr);
        let tr = document.createElement('tr');
        tr.appendChild(td1);
        tr.appendChild(td2);
        tbody.appendChild(tr);
    }
    document.getElementById('eip55_btn').disabled = false;
}

/**
 * Ethereumアドレス判定
 * 
 * @param {string} address アドレス
 * @returns 結果
 */
function isAddress(address) {
    let result = false;
    if (address.match(/^0x[0-9a-fA-F]{40}$/)) {
        if (address == address.toUpperCase()) {
            result = true;
        } else {
            if (address == address.toLowerCase()) {
                result = true;
            } else {
                if (address == toChecksumAddress(address)) {
                    result = true;
                }
            }
        }
    }
    return result;
}

/**
 * チェックサムアドレス変換
 * 
 * @param {string} address アドレス
 * @returns  チェックサムアドレス
 */
function toChecksumAddress(address) {
    let addr = address.toLowerCase();
    let hash = KEC(addr.substring(2));
    let caddr = '0x';
    for (let i = 2; i < addr.length; i++) {
        if (parseInt(hash[i], 16) >= 8) {
            caddr += addr[i].toUpperCase();
        } else {
            caddr += addr[i];
        }
    }
    return caddr
}

/**
 * Keccak-256 hash function
 * 
 * @param {string} hex データ
 * @returns ハッシュ値
 */
function KEC(hex) {
    let web3 = new Web3();
    let hash = web3.utils.keccak256(hex);
    return hash;
}

/**
 * Ethereumアドレス取得
 * 
 * @param {bigint} pr 秘密鍵
 * @returns Ethereumアドレス
 */
function A(pr) {
    let pubKey = ECDSAPUBKEY(pr);
    let hash = KEC('0x' + hex32(pubKey.x) + hex32(pubKey.y));
    let address = '0x' + hash.substring(2 + (96 / 8) * 2);
    return address;
}

/**
 * テスト開始
 */
function doTest() {
    this.disabled = true;
    document.getElementById('test_tbody').innerHTML = '';
    setTimeout(test, 10);
}

/**
 * 楕円曲線演算テスト（Secp256k1）
 * @returns 結果（true/false）
 */
function test() {
    let tbody = document.getElementById('test_tbody');
    tbody.innerHTML = '';
    let result = true;
    for (let T of TEST_VECTOR) {
        let td1 = document.createElement('td');
        let td2 = document.createElement('td');
        let P = mulPoint(G, BigInt(T.k));
        if (hex32(P.x) == T.x && hex32(P.y) == T.y) {
            console.log('OK', T.k);
            td1.innerText = 'OK';
            td1.classList.add('font-monospace');
            td2.innerText = T.k;
            td2.classList.add('font-monospace');
        } else {
            console.error('NG', T.k);
            console.error('T.x', T.x);
            console.error('P.x', hex32(P.x));
            console.error('T.y', T.y);
            console.error('P.y', hex32(P.y));
            td1.innerText = 'NG';
            td1.classList.add('font-monospace');
            td2.innerHTML = T.k + '<br>T.x : ' + T.x + '<br>P.x : ' + P.x
                + '<br>T.y : ' + T.y + '<br>P.y : ' + P.y;
            td2.classList.add('font-monospace');
            result = false;
        }
        let tr = document.createElement('tr');
        tr.appendChild(td1);
        tr.appendChild(td2);
        tbody.appendChild(tr);
    }
    document.getElementById('test_btn').disabled = false;
    return result;
}

/**
 * 32バイト16進数文字列
 * @param {bigint} x 数値
 * @returns 32バイト16進数文字列
 */
function hex32(x) {
    if (x == null) {
        return 'null';
    }
    return x.toString(16).padStart(64, '0').toUpperCase();
}

/**
 * 乱数生成（32バイト）
 * @returns 乱数（32バイト）
 */
function rnd32() {
    let tmp = new Uint8Array(32);
    window.crypto.getRandomValues(tmp);
    let tmpArray = Array.from(new Uint8Array(tmp));
    let tmpHex = tmpArray.map(b => b.toString(16).padStart(2, '0')).join('');
    let r = BigInt('0x' + tmpHex);
    return r;
}

// ECDSA演算

/**
 * 公開鍵生成
 * @param {bigint} x 秘密鍵
 * @returns 公開鍵
 */
function ECDSAPUBKEY(x) {
    return mulPoint(G, x)
}

/**
 * 署名値生成
 * @param {bigint} e メッセージハッシュ
 * @param {bigint} x 秘密鍵
 * @returns 署名データ
 */
function ECDSASIGN(e, x) {
    let k = rnd32() % n;
    let R = mulPoint(G, k);
    let r = R.x;
    if (r >= n) {
        return ECDSASIGN(e, x);
    }
    // s = (e + xr) / k
    let s = mul(add(e, mul(x, r, n), n), inv(k, n), n);
    if (s == 0n) {
        return ECDSASIGN(e, x);
    }
    // 0 < s < n ÷ 2 + 1
    if (s > (n - 1n) / 2n) {
        s = n - s;
        R.y = p - R.y;
    }
    // v ∈ {27, 28} 
    // The value 27 represents an even y value and 28 represents an odd y value.
    let v = 27n + (R.y & 1n);
    return { v: v, r: R.x, s: s };
}

/**
 * 署名値から公開鍵取得
 * @param {bigint} e メッセージハッシュ
 * @param {bigint} v リカバリ識別子
 * @param {bigint} r x座標
 * @param {bigint} s 署名値
 * @returns 公開鍵
 */
function ECDSARECOVER(e, v, r, s) {
    let R = { x: r, y: null };
    // y = √(x^3 + 7)
    R.y = pow(add(pow(r, 3n, p), b, p), (p + 1n) / 4n, p);
    if ((v & 1n) == (R.y & 1n)) {
        R.y = p - R.y;
    }
    // Q = r^{−1}(sR − eG)
    let Q = mulPoint(addPoint(mulPoint(R, s), mulPoint(G, sub(n, e, n))), inv(r, n));
    return Q;
}

// 楕円曲線演算（secp256k1）

// 楕円曲線係数（ secp256k1 : y^2 = x^3 + 7　）
const b = 7n;
// 楕円曲線の位数
const p = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F');
// 生成元
const G = {
    x: BigInt('0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798'),
    y: BigInt('0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8'),
}
// 生成元の位数
const n = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');

/**
 * 点の加算
 * @param {point} P1 
 * @param {point} P2 
 * @returns 点
 */
function addPoint(P1, P2) {
    if (P1.x == null && P1.y == null) {
        return P2;
    }
    if (P2.x == null && P2.y == null) {
        return P1;
    }
    let s = null;
    if (P1.x != P2.x) {
        // 異なる点
        // s = (P2.y - P1.y) / (P2.x - P1.x)
        s = sub(P2.y, P1.y, p) * inv(sub(P2.x, P1.x, p), p);
    } else {
        // 同一点
        if (P1.y != P2.y) {
            // P1 = -P2
            return { x: null, y: null };
        } else if (P1.y == 0n) {
            // 接線が垂直
            return { x: null, y: null };
        }
        // s = (3*P1.x^2) / (2 * P1.y)
        s = mul(3n, pow(P1.x, 2n, p), p) * inv(mul(2n, P1.y, p), p);
    }
    // P3.x = s^2 - P1.x - P2.x
    let x3 = sub(sub(pow(s, 2n, p), P1.x, p), P2.x, p);
    // P3.y = s*(P1.x - P3.x) - P1.y
    let y3 = sub(mul(s, sub(P1.x, x3, p), p), P1.y, p);
    return { x: x3, y: y3 };
}

/**
 * 点のスカラー倍算
 * @param {point} P 
 * @param {bigint} k 
 * @returns kP
 */
function mulPoint(P, k) {
    let Q = { x: null, y: null };
    while (k > 0n) {
        if (k & 1n) {
            Q = addPoint(Q, P);
        }
        P = addPoint(P, P);
        k >>= 1n;
    }
    return Q;
}

// 剰余演算

/**
 * 加算（剰余演算）
 * @param {bigint} x 
 * @param {bigint} y 
 * @param {bigint} p 
 * @returns x + y mod p 
 */
function add(x, y, p) {
    return (x + y) % p;
}

/**
 * 減算（剰余演算）
 * 負値の場合、正値に変更
 * @param {bigint} x 
 * @param {bigint} y 
 * @param {bigint} p 
 * @returns x - y mod p
 */
function sub(x, y, p) {
    let z = (x - y) % p;
    if (z < 0n) {
        z += p;
    }
    return z;
}

/**
 * 乗算（剰余演算）
 * @param {bigint} x 
 * @param {bigint} y 
 * @param {bigint} p 
 * @returns x * y mod p
 */
function mul(x, y, p) {
    return (x * y) % p;
}


/**
 * 乗法逆元（剰余演算）
 * @param {bigint} x 
 * @param {bigint} p 素数
 * @returns x ^ -1 mod p
 */
function inv(x, p) {
    return pow(x, p - 2n, p);
}

/**
 * べき乗（剰余演算）
 * @param {bigint} x 
 * @param {bigint} y 
 * @param {bigint} p
 * @returns x ^ y mod p
 */
function pow(x, y, p) {
    let z = 1n;
    while (y > 0n) {
        if (y & 1n) {
            z = (z * x) % p;
        }
        x = (x * x) % p;
        y >>= 1n;
    }
    return z;
}

// secp256k1 Test Vectors
// https://chuckbatson.wordpress.com/2014/11/26/secp256k1-test-vectors/
const TEST_VECTOR = [
    {
        k: "1",
        x: "79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798",
        y: "483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8",
    }, {
        k: "2",
        x: "C6047F9441ED7D6D3045406E95C07CD85C778E4B8CEF3CA7ABAC09B95C709EE5",
        y: "1AE168FEA63DC339A3C58419466CEAEEF7F632653266D0E1236431A950CFE52A",
    }, {
        k: "3",
        x: "F9308A019258C31049344F85F89D5229B531C845836F99B08601F113BCE036F9",
        y: "388F7B0F632DE8140FE337E62A37F3566500A99934C2231B6CB9FD7584B8E672",
    }, {
        k: "4",
        x: "E493DBF1C10D80F3581E4904930B1404CC6C13900EE0758474FA94ABE8C4CD13",
        y: "51ED993EA0D455B75642E2098EA51448D967AE33BFBDFE40CFE97BDC47739922",
    }, {
        k: "5",
        x: "2F8BDE4D1A07209355B4A7250A5C5128E88B84BDDC619AB7CBA8D569B240EFE4",
        y: "D8AC222636E5E3D6D4DBA9DDA6C9C426F788271BAB0D6840DCA87D3AA6AC62D6",
    }, {
        k: "6",
        x: "FFF97BD5755EEEA420453A14355235D382F6472F8568A18B2F057A1460297556",
        y: "AE12777AACFBB620F3BE96017F45C560DE80F0F6518FE4A03C870C36B075F297",
    }, {
        k: "7",
        x: "5CBDF0646E5DB4EAA398F365F2EA7A0E3D419B7E0330E39CE92BDDEDCAC4F9BC",
        y: "6AEBCA40BA255960A3178D6D861A54DBA813D0B813FDE7B5A5082628087264DA",
    }, {
        k: "8",
        x: "2F01E5E15CCA351DAFF3843FB70F3C2F0A1BDD05E5AF888A67784EF3E10A2A01",
        y: "5C4DA8A741539949293D082A132D13B4C2E213D6BA5B7617B5DA2CB76CBDE904",
    }, {
        k: "9",
        x: "ACD484E2F0C7F65309AD178A9F559ABDE09796974C57E714C35F110DFC27CCBE",
        y: "CC338921B0A7D9FD64380971763B61E9ADD888A4375F8E0F05CC262AC64F9C37",
    }, {
        k: "10",
        x: "A0434D9E47F3C86235477C7B1AE6AE5D3442D49B1943C2B752A68E2A47E247C7",
        y: "893ABA425419BC27A3B6C7E693A24C696F794C2ED877A1593CBEE53B037368D7",
    }, {
        k: "11",
        x: "774AE7F858A9411E5EF4246B70C65AAC5649980BE5C17891BBEC17895DA008CB",
        y: "D984A032EB6B5E190243DD56D7B7B365372DB1E2DFF9D6A8301D74C9C953C61B",
    }, {
        k: "12",
        x: "D01115D548E7561B15C38F004D734633687CF4419620095BC5B0F47070AFE85A",
        y: "A9F34FFDC815E0D7A8B64537E17BD81579238C5DD9A86D526B051B13F4062327",
    }, {
        k: "13",
        x: "F28773C2D975288BC7D1D205C3748651B075FBC6610E58CDDEEDDF8F19405AA8",
        y: "0AB0902E8D880A89758212EB65CDAF473A1A06DA521FA91F29B5CB52DB03ED81",
    }, {
        k: "14",
        x: "499FDF9E895E719CFD64E67F07D38E3226AA7B63678949E6E49B241A60E823E4",
        y: "CAC2F6C4B54E855190F044E4A7B3D464464279C27A3F95BCC65F40D403A13F5B",
    }, {
        k: "15",
        x: "D7924D4F7D43EA965A465AE3095FF41131E5946F3C85F79E44ADBCF8E27E080E",
        y: "581E2872A86C72A683842EC228CC6DEFEA40AF2BD896D3A5C504DC9FF6A26B58",
    }, {
        k: "16",
        x: "E60FCE93B59E9EC53011AABC21C23E97B2A31369B87A5AE9C44EE89E2A6DEC0A",
        y: "F7E3507399E595929DB99F34F57937101296891E44D23F0BE1F32CCE69616821",
    }, {
        k: "17",
        x: "DEFDEA4CDB677750A420FEE807EACF21EB9898AE79B9768766E4FAA04A2D4A34",
        y: "4211AB0694635168E997B0EAD2A93DAECED1F4A04A95C0F6CFB199F69E56EB77",
    }, {
        k: "18",
        x: "5601570CB47F238D2B0286DB4A990FA0F3BA28D1A319F5E7CF55C2A2444DA7CC",
        y: "C136C1DC0CBEB930E9E298043589351D81D8E0BC736AE2A1F5192E5E8B061D58",
    }, {
        k: "19",
        x: "2B4EA0A797A443D293EF5CFF444F4979F06ACFEBD7E86D277475656138385B6C",
        y: "85E89BC037945D93B343083B5A1C86131A01F60C50269763B570C854E5C09B7A",
    }, {
        k: "20",
        x: "4CE119C96E2FA357200B559B2F7DD5A5F02D5290AFF74B03F3E471B273211C97",
        y: "12BA26DCB10EC1625DA61FA10A844C676162948271D96967450288EE9233DC3A",
    }, {
        k: "112233445566778899",
        x: "A90CC3D3F3E146DAADFC74CA1372207CB4B725AE708CEF713A98EDD73D99EF29",
        y: "5A79D6B289610C68BC3B47F3D72F9788A26A06868B4D8E433E1E2AD76FB7DC76",
    }, {
        k: "112233445566778899112233445566778899",
        x: "E5A2636BCFD412EBF36EC45B19BFB68A1BC5F8632E678132B885F7DF99C5E9B3",
        y: "736C1CE161AE27B405CAFD2A7520370153C2C861AC51D6C1D5985D9606B45F39",
    }, {
        k: "28948022309329048855892746252171976963209391069768726095651290785379540373584",
        x: "A6B594B38FB3E77C6EDF78161FADE2041F4E09FD8497DB776E546C41567FEB3C",
        y: "71444009192228730CD8237A490FEBA2AFE3D27D7CC1136BC97E439D13330D55",
    }, {
        k: "57896044618658097711785492504343953926418782139537452191302581570759080747168",
        x: "00000000000000000000003B78CE563F89A0ED9414F5AA28AD0D96D6795F9C63",
        y: "3F3979BF72AE8202983DC989AEC7F2FF2ED91BDD69CE02FC0700CA100E59DDF3",
    }, {
        k: "86844066927987146567678238756515930889628173209306178286953872356138621120752",
        x: "E24CE4BEEE294AA6350FAA67512B99D388693AE4E7F53D19882A6EA169FC1CE1",
        y: "8B71E83545FC2B5872589F99D948C03108D36797C4DE363EBD3FF6A9E1A95B10",
    }, {
        k: "115792089237316195423570985008687907852837564279074904382605163141518161494317",
        x: "4CE119C96E2FA357200B559B2F7DD5A5F02D5290AFF74B03F3E471B273211C97",
        y: "ED45D9234EF13E9DA259E05EF57BB3989E9D6B7D8E269698BAFD77106DCC1FF5",
    }, {
        k: "115792089237316195423570985008687907852837564279074904382605163141518161494318",
        x: "2B4EA0A797A443D293EF5CFF444F4979F06ACFEBD7E86D277475656138385B6C",
        y: "7A17643FC86BA26C4CBCF7C4A5E379ECE5FE09F3AFD9689C4A8F37AA1A3F60B5",
    }, {
        k: "115792089237316195423570985008687907852837564279074904382605163141518161494319",
        x: "5601570CB47F238D2B0286DB4A990FA0F3BA28D1A319F5E7CF55C2A2444DA7CC",
        y: "3EC93E23F34146CF161D67FBCA76CAE27E271F438C951D5E0AE6D1A074F9DED7",
    }, {
        k: "115792089237316195423570985008687907852837564279074904382605163141518161494320",
        x: "DEFDEA4CDB677750A420FEE807EACF21EB9898AE79B9768766E4FAA04A2D4A34",
        y: "BDEE54F96B9CAE9716684F152D56C251312E0B5FB56A3F09304E660861A910B8",
    }, {
        k: "115792089237316195423570985008687907852837564279074904382605163141518161494321",
        x: "E60FCE93B59E9EC53011AABC21C23E97B2A31369B87A5AE9C44EE89E2A6DEC0A",
        y: "081CAF8C661A6A6D624660CB0A86C8EFED6976E1BB2DC0F41E0CD330969E940E",
    }, {
        k: "115792089237316195423570985008687907852837564279074904382605163141518161494322",
        x: "D7924D4F7D43EA965A465AE3095FF41131E5946F3C85F79E44ADBCF8E27E080E",
        y: "A7E1D78D57938D597C7BD13DD733921015BF50D427692C5A3AFB235F095D90D7",
    }, {
        k: "115792089237316195423570985008687907852837564279074904382605163141518161494323",
        x: "499FDF9E895E719CFD64E67F07D38E3226AA7B63678949E6E49B241A60E823E4",
        y: "353D093B4AB17AAE6F0FBB1B584C2B9BB9BD863D85C06A4339A0BF2AFC5EBCD4",
    }, {
        k: "115792089237316195423570985008687907852837564279074904382605163141518161494324",
        x: "F28773C2D975288BC7D1D205C3748651B075FBC6610E58CDDEEDDF8F19405AA8",
        y: "F54F6FD17277F5768A7DED149A3250B8C5E5F925ADE056E0D64A34AC24FC0EAE",
    }, {
        k: "115792089237316195423570985008687907852837564279074904382605163141518161494325",
        x: "D01115D548E7561B15C38F004D734633687CF4419620095BC5B0F47070AFE85A",
        y: "560CB00237EA1F285749BAC81E8427EA86DC73A2265792AD94FAE4EB0BF9D908",
    }, {
        k: "115792089237316195423570985008687907852837564279074904382605163141518161494326",
        x: "774AE7F858A9411E5EF4246B70C65AAC5649980BE5C17891BBEC17895DA008CB",
        y: "267B5FCD1494A1E6FDBC22A928484C9AC8D24E1D20062957CFE28B3536AC3614",
    }, {
        k: "115792089237316195423570985008687907852837564279074904382605163141518161494327",
        x: "A0434D9E47F3C86235477C7B1AE6AE5D3442D49B1943C2B752A68E2A47E247C7",
        y: "76C545BDABE643D85C4938196C5DB3969086B3D127885EA6C3411AC3FC8C9358",
    }, {
        k: "115792089237316195423570985008687907852837564279074904382605163141518161494328",
        x: "ACD484E2F0C7F65309AD178A9F559ABDE09796974C57E714C35F110DFC27CCBE",
        y: "33CC76DE4F5826029BC7F68E89C49E165227775BC8A071F0FA33D9D439B05FF8",
    }, {
        k: "115792089237316195423570985008687907852837564279074904382605163141518161494329",
        x: "2F01E5E15CCA351DAFF3843FB70F3C2F0A1BDD05E5AF888A67784EF3E10A2A01",
        y: "A3B25758BEAC66B6D6C2F7D5ECD2EC4B3D1DEC2945A489E84A25D3479342132B",
    }, {
        k: "115792089237316195423570985008687907852837564279074904382605163141518161494330",
        x: "5CBDF0646E5DB4EAA398F365F2EA7A0E3D419B7E0330E39CE92BDDEDCAC4F9BC",
        y: "951435BF45DAA69F5CE8729279E5AB2457EC2F47EC02184A5AF7D9D6F78D9755",
    }, {
        k: "115792089237316195423570985008687907852837564279074904382605163141518161494331",
        x: "FFF97BD5755EEEA420453A14355235D382F6472F8568A18B2F057A1460297556",
        y: "51ED8885530449DF0C4169FE80BA3A9F217F0F09AE701B5FC378F3C84F8A0998",
    }, {
        k: "115792089237316195423570985008687907852837564279074904382605163141518161494332",
        x: "2F8BDE4D1A07209355B4A7250A5C5128E88B84BDDC619AB7CBA8D569B240EFE4",
        y: "2753DDD9C91A1C292B24562259363BD90877D8E454F297BF235782C459539959",
    }, {
        k: "115792089237316195423570985008687907852837564279074904382605163141518161494333",
        x: "E493DBF1C10D80F3581E4904930B1404CC6C13900EE0758474FA94ABE8C4CD13",
        y: "AE1266C15F2BAA48A9BD1DF6715AEBB7269851CC404201BF30168422B88C630D",
    }, {
        k: "115792089237316195423570985008687907852837564279074904382605163141518161494334",
        x: "F9308A019258C31049344F85F89D5229B531C845836F99B08601F113BCE036F9",
        y: "C77084F09CD217EBF01CC819D5C80CA99AFF5666CB3DDCE4934602897B4715BD",
    }, {
        k: "115792089237316195423570985008687907852837564279074904382605163141518161494335",
        x: "C6047F9441ED7D6D3045406E95C07CD85C778E4B8CEF3CA7ABAC09B95C709EE5",
        y: "E51E970159C23CC65C3A7BE6B99315110809CD9ACD992F1EDC9BCE55AF301705",
    }, {
        k: "115792089237316195423570985008687907852837564279074904382605163141518161494336",
        x: "79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798",
        y: "B7C52588D95C3B9AA25B0403F1EEF75702E84BB7597AABE663B82F6F04EF2777",
    }
];

window.addEventListener('load', init);