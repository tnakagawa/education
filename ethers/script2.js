"use strict";

import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";
import { ENGLISH_WORDS } from "./english.js";

async function init() {
    console.log("init", ethers.version);
    Vue.createApp(MainApp).mount("#main");
}

const MainApp = {
    data() {
        return {
            loading: true,
            toast: {
                toast: null,
                message: "",
            },
            modal: {
                modal: null,
                title: "",
                message: "",
            },
            ethereum: null,
            account: "",
            entropy: "",
            checksum: "",
            mnemonic: "",
            addrs: [],
        };
    },
    mounted() {
        this.init();
    },
    methods: {
        async init() {
            this.loading = false;
            this.modal.modal = new bootstrap.Modal('#modal', {});
            this.toast.toast = new bootstrap.Toast('#toast', { animation: true, autohide: true, delay: 3000 });
            this.ethereum = window.ethereum;
            if (this.ethereum) {
                let provider = new ethers.BrowserProvider(this.ethereum);
                let accounts = await provider.listAccounts();
                if (accounts && accounts.length > 0) {
                    this.account = accounts[0].address;
                }
            }
        },
        showToast(message) {
            this.toast.message = message;
            this.toast.toast.show();
        },
        showModal(title, message) {
            this.modal.title = title;
            this.modal.message = message;
            this.modal.modal.show();
        },
        generateEntropy() {
            let ENT = 128n;
            this.entropy = ethers.hexlify(ethers.randomBytes(Number(ENT / 8n)));
        },
        generateMnemonic() {
            let ENT = 128n;
            let CS = 4n;
            let MS = (ENT + CS) / 11n;
            this.checksum = ethers.sha256(this.entropy);
            let data = (BigInt(this.entropy) << CS) + (BigInt(this.checksum) >> (256n - CS));
            let words = [];
            for (let i = 1n; i <= MS; i++) {
                let idx = (data >> ((12n - i) * 11n)) & 0x7ffn;
                words.push(ENGLISH_WORDS[idx]);
            }
            this.mnemonic = words.join(" ");
        },
        checkMnemonic() {
            let result = false;
            let words = this.mnemonic.trim().split(" ");
            if (words.length == 12) {
                let exist = true;
                let data = 0n;
                for (let i = 0; i < words.length; i++) {
                    exist = false;
                    for (let j = 0; j < ENGLISH_WORDS.length; j++) {
                        if (ENGLISH_WORDS[j] == words[i]) {
                            exist = true;
                            data <<= 11n;
                            data += BigInt(j);
                        }
                    }
                    if (!exist) {
                        break;
                    }
                }
                if (exist) {
                    let checksum = data & 0xfn;
                    let entropy = data >> 4n;
                    let hash = BigInt(ethers.sha256("0x" + entropy.toString(16).padStart(128 / 8 * 2, "0")));
                    if (checksum == (hash >> (256n - 4n))) {
                        this.showToast("Mnemonic check OK!");
                        result = true;
                    } else {
                        this.showModal("Check Mnemonic Error", "Checksum is invalid.");
                    }
                } else {
                    this.showModal("Check Mnemonic Error", "Contains illegal words.");
                }
            } else {
                this.showModal("Check Mnemonic Error", "It's not 12 words.");
            }
            return result;
        },
        clearAddrs() {
            this.addrs.length = 0;
        },
        computeAddrs() {
            this.clearAddrs();
            if (this.checkMnemonic()) {
                let wallet = ethers.HDNodeWallet.fromPhrase(this.mnemonic.trim(), "", "m/44'/60'/0'/0");
                for (let i = 0; i < 5; i++) {
                    this.addrs.push(wallet.deriveChild(i).address);
                }
            }
        },
    }
}

window.addEventListener("load", init);
