function init() {
    doProblem();
}

function doProblem() {
    console.log("--- Five Programming Problems 1 ---")
    let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    console.log(problem1for(nums));
    console.log(problem1while(nums));
    console.log(problem1Recursion(nums));
    console.log("--- Five Programming Problems 2 ---")
    const a = [1, 2, 3];
    const b = ['a', 'b', 'c'];
    console.log(problem2(a, b));
    console.log("--- Five Programming Problems 3 ---")
    console.log(problem3());
    console.log("--- Five Programming Problems 4 ---")
    nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1000, 98];
    let d1 = new Date();
    console.log(problem4(nums));
    let d2 = new Date();
    console.log(problem4_2(nums));
    let d3 = new Date();
    console.log("Problem4-1", d2.getTime() - d1.getTime());
    console.log("Problem4-2", d3.getTime() - d2.getTime());
    console.log("--- Five Programming Problems 5 ---")
    problem5([]);
}

const NUMS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const KIGO = ['', ' +', ' -'];
const GOAL = 100;

function problem5(strs) {
    if (strs.length + 1 == NUMS.length) {
        let str = "";
        for (let i = 0; i < NUMS.length; i++) {
            str += NUMS[i];
            if (i < strs.length) {
                str += strs[i];
            }
        }
        // let ret = 0;
        // let items = str.split(' ');
        // for (let item of items) {
        //     ret += parseInt(item);
        // }
        let ret = str.split(' ').reduce(function (sum, item) {
            return sum + parseInt(item);
        }, 0);
        if (ret == GOAL) {
            console.log(str);
        }
    } else {
        for (let i = 0; i < KIGO.length; i++) {
            let newStrs = strs.slice();
            newStrs.push(KIGO[i]);
            problem5(newStrs);
        }
    }
}

var max = 0;

function problem4(nums) {
    let left = [];
    // let right = [50, 2, 1, 9];
    let right = nums.slice();
    max = 0;
    problem4_(left, right);
    return max;
}

function problem4_(left, right) {
    if (right.length == 0) {
        let tmp = parseInt(left.join(''));
        if (max < tmp) {
            max = tmp;
        }
    } else {
        for (let i = 0; i < right.length; i++) {
            let newLeft = left.slice();
            newLeft.push(right[i]);
            let newRight = right.slice();
            newRight.splice(i, 1);
            problem4_(newLeft, newRight)
        }
    }
}

function problem4_2(nums) {
    let list = [];
    let len = 0;
    for (let num of nums) {
        let item = {
            n: num.toString(),
            s: num.toString(),
        }
        if (len < item.n.length) {
            len = item.n.length;
        }
        list.push(item);
    }
    for (let item of list) {
        let c = item.s.charAt(item.s.length - 1);
        while (item.s.length < len) {
            item.s += c;
        }
    }
    list.sort(comp);
    let ns = '';
    for (let item of list) {
        ns += item.n;
    }
    return parseInt(ns);
}

function comp(a, b) {
    if (a.s < b.s) {
        return 1;
    } else if (a.s > b.s) {
        return -1;
    }
    return 0;
}

function problem3() {
    let fnums = [0n, 1n];
    for (let i = 0; i < 99; i++) {
        fnums.push(fnums[i] + fnums[i + 1]);
    }
    return fnums;
}

function problem2(a, b) {
    let c = [];
    let len = a.length > b.length ? a.length : b.length;
    for (let i = 0; i < len; i++) {
        if (a.length > 0) {
            c.push(a.shift());
        }
        if (b.length > 0) {
            c.push(b.shift());
        }
    }
    return c;
}

function problem1for(nums) {
    let sum = 0;
    for (n of nums) {
        sum += n;
    }
    return sum;
}

function problem1while(nums) {
    let sum = 0;
    let tmp = nums.slice();
    while (tmp.length > 0) {
        sum += tmp.shift();
    }
    return sum;
}

function problem1Recursion(nums) {
    if (nums.length == 0) {
        return 0;
    }
    return nums.shift() + problem1Recursion(nums);
}

window.addEventListener('load', init);