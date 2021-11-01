function init() {
    createSsd('ssda');
    let atog = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    for (let i = 0; i < atog.length; i++) {
        document.getElementById('ssda-' + i).innerText = atog[i];
    }
    for (let i = 0; i < 10; i++) {
        createSsd('ssd' + i);
        setSsd('ssd' + i, i);
    }
    createSsd('ssdfrom');
    createSsd('ssddiff');
    createSsd('ssdto');
    document.getElementById('from').addEventListener('change', diffnum);
    document.getElementById('to').addEventListener('change', diffnum);
    diffnum();
    createSsd('ssdall');
    setSsd('ssdall', 0);
    createSsd('ssddif');
    setSsd('ssddif', difn);
    document.getElementById('btn').addEventListener('click', start);
}

function start() {
    all.length = 0;
    dif.length = 0;
    for (let i = 0; i < 100; i++) {
        let r = Math.floor(Math.random() * 10);
        all.push(r);
        dif.push(r);
    }
    document.getElementById('ssdall-msg').innerHTML = '<br>Doing...<br>';
    document.getElementById('ssddif-msg').innerHTML = '<br>Doing...<br>';
    cntAll = 0;
    cntDif = 0;
    stime = (new Date()).getTime();
    setTimeout(execAll, 10);
    setTimeout(execDif, 10);
}

var all = [];
var dif = [];
var difn = 0;
var stime = 0;
var cntAll = 0;
var cntDif = 0;

function execAll() {
    if (all.length > 0) {
        let n = all.shift();
        setAll(n);
        setTimeout(execAll, 100);
    } else {
        document.getElementById('ssdall-msg').innerHTML = '<br>Complete!<br>'
            + ((new Date()).getTime() - stime) + ' ms<br>' + cntAll + ' 回';
    }
}

function execDif() {
    if (dif.length > 0) {
        let n = dif.shift();
        setDif(difn, n);
        difn = n;
        setTimeout(execDif, 100);
    } else {
        document.getElementById('ssddif-msg').innerHTML = '<br>Complete!<br>'
            + ((new Date()).getTime() - stime) + ' ms<br>' + cntDif + ' 回';
    }
}

function setAll(n) {
    let flg = SSD_FLGS[n];
    let mask = 1;
    for (let i = 0; i < 7; i++) {
        cntAll++;
        if (flg & mask) {
            document.getElementById('ssdall-' + i).style.backgroundColor = '#0000EE';
        } else {
            document.getElementById('ssdall-' + i).style.backgroundColor = '#202020';
        }
        mask <<= 1;
    }
}

function setDif(b, n) {
    let flg = SSD_FLGS[n];
    let dif = SSD_FLGS[b] ^ flg;
    let mask = 1;
    for (let i = 0; i < 7; i++) {
        if (dif & mask) {
            cntDif++;
            if (flg & mask) {
                document.getElementById('ssddif-' + i).style.backgroundColor = '#0000EE';
            } else {
                document.getElementById('ssddif-' + i).style.backgroundColor = '#202020';
            }
        }
        mask <<= 1;
    }
}


function diffnum() {
    let from = parseInt(document.getElementById('from').value);
    let to = parseInt(document.getElementById('to').value);
    setSsd('ssdfrom', from);
    let diff = SSD_FLGS[from] ^ SSD_FLGS[to];
    document.getElementById('ssdfrom2').innerHTML = 'GFEDCBA<br>' + SSD_FLGS[from].toString(2).padStart(7, '0');
    document.getElementById('ssdto2').innerHTML = 'GFEDCBA<br>' + SSD_FLGS[to].toString(2).padStart(7, '0');
    document.getElementById('ssddiff2').innerHTML = ' GFEDCBA<br>' + diff.toString(2).padStart(7, '0');
    let mask = 1;
    for (let i = 0; i < 7; i++) {
        if (diff & mask) {
            document.getElementById('ssddiff-' + i).style.backgroundColor = '#FFD900';
        } else {
            document.getElementById('ssddiff-' + i).style.backgroundColor = '#202020';
        }
        mask <<= 1;
    }
    setSsd('ssdto', to);
}

const SSD_FLGS = [0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F];

// const SSD_POS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

// function ssd(n) {
//     let flg = SSD_FLGS[n];
//     let mask = 1;
//     for (let p of SSD_POS) {
//         if (flg & mask) {
//             // pを点灯
//         } else {
//             // pを消灯
//         }
//         mask <<= 1;
//     }
// }

function setSsd(id, n) {
    let flg = SSD_FLGS[n];
    let mask = 1;
    for (let i = 0; i < 7; i++) {
        if (flg & mask) {
            document.getElementById(id + '-' + i).style.backgroundColor = '#0000EE';
        } else {
            document.getElementById(id + '-' + i).style.backgroundColor = '#202020';
        }
        mask <<= 1;
    }
}

const SSD_TABLE_ITEMS = [
    ['', '0', ''],
    ['5', '', '1'],
    ['', '6', ''],
    ['4', '', '2'],
    ['', '3', ''],
];

function createSsd(id) {
    let target = document.getElementById(id);
    if (target) {
        while (target.firstChild) {
            target.removeChild(target.firstChild);
        }
        let table = document.createElement('table');
        table.className = 'ssd-table';
        for (let trval of SSD_TABLE_ITEMS) {
            let tr = document.createElement('tr');
            for (let tdval of trval) {
                let td = document.createElement('td');
                if (tdval) {
                    td.id = '' + id + '-' + tdval;
                    td.className = 'ssd-td-' + tdval;
                }
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        target.appendChild(table);
    }
    return target;
}

window.addEventListener('load', init);