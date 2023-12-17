"use strict";

import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";

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
            privateKey: "",
            publicKey: "",
            hashPubKey: "",
            address: "",
            hashAddress: "",
            formatedAddress: "",
            ethereum: null,
            account: null,
            message: "",
            signature: "",
            verifyAddress: "",
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
        createPrivateKey() {
            let wallet = ethers.Wallet.createRandom();
            this.privateKey = wallet.privateKey;
            this.publicKey = "";
        },
        createPublicKey() {
            this.publicKey = "";
            if (this.privateKey) {
                this.publicKey = "0x" + ethers.SigningKey.computePublicKey(this.privateKey, false).substring(4);
            }
        },
        hashPublicKey() {
            this.hashPubKey = "";
            if (this.publicKey) {
                this.hashPubKey = ethers.keccak256(this.publicKey);
            }
        },
        toAddress() {
            this.address = "";
            if (this.hashPubKey) {
                this.address = "0x" + this.hashPubKey.substring(26);
            }
        },
        formatAddress() {
            this.hashAddress = "";
            this.formatedAddress = "";
            if (this.address) {
                this.hashAddress = ethers.keccak256(ethers.toUtf8Bytes(this.address.substring(2).toLowerCase()));
                this.formatedAddress = "0x";
                for (let i = 2; i < this.address.length; i++) {
                    if (parseInt(this.hashAddress.charAt(i), 16) >= 8) {
                        this.formatedAddress += this.address.charAt(i).toUpperCase();
                    } else {
                        this.formatedAddress += this.address.charAt(i).toLowerCase();
                    }
                }
            }
        },
        async connectMetaMask() {
            this.loading = true;
            try {
                await window.ethereum.request({
                    "method": "eth_requestAccounts",
                    "params": []
                });
                let provider = new ethers.BrowserProvider(window.ethereum);
                let accounts = await provider.listAccounts();
                if (accounts && accounts.length > 0) {
                    this.account = accounts[0].address;
                }
            } catch (err) {
                if (err.code == 4001) {
                    this.showToast("MetaMaskでキャンセルされました。");
                } else {
                    this.showModal("Error", err.message);
                }
            }
            this.loading = false;
        },
        async signMessage() {
            this.loading = true;
            try {
                let provider = new ethers.BrowserProvider(window.ethereum);
                let accounts = await provider.listAccounts();
                if (accounts && accounts.length > 0) {
                    this.signature = await accounts[0].signMessage(ethers.toUtf8Bytes(this.message));
                }
            } catch (err) {
                if (err.code == "ACTION_REJECTED") {
                    this.showToast("MetaMaskでキャンセルされました。");
                } else {
                    this.showModal("Error", err.message);
                }
            }
            this.loading = false;
        },
        verifyMessage() {
            this.verifyAddress = ethers.verifyMessage(this.message, this.signature);
        },
    }
}

window.addEventListener("load", init);
