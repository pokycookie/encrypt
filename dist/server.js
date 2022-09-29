"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const CryptoJS = __importStar(require("crypto-js"));
const crypto_1 = __importDefault(require("crypto"));
const node_rsa_1 = __importDefault(require("node-rsa"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, express_fileupload_1.default)());
app.use(express_1.default.urlencoded({ extended: false }));
app.get("/", (req, res) => {
    res.json("server");
});
const modeSwitch = (mode) => {
    switch (mode) {
        case "ECB":
            return CryptoJS.mode.ECB;
        case "CBC":
            return CryptoJS.mode.CBC;
    }
};
const funSwitch = (fun, cipher, key, mode) => {
    switch (fun) {
        case "nocrypt":
            return cipher;
        case "DES":
            return CryptoJS.DES.decrypt(cipher, key, { mode: modeSwitch(mode) }).toString(CryptoJS.enc.Utf8);
        case "3DES":
            return CryptoJS.TripleDES.decrypt(cipher, key, { mode: modeSwitch(mode) }).toString(CryptoJS.enc.Utf8);
        case "AES":
            return CryptoJS.AES.decrypt(cipher, key, { mode: modeSwitch(mode) }).toString(CryptoJS.enc.Utf8);
    }
};
app.post("/upload", (req, res) => {
    const data = req.body;
    const decrypted = funSwitch(data.fun, data.contents, data.key, data.mode);
    console.log(decrypted);
    res.status(200).json(`${data.fun} - ${data.mode}`);
});
app.post("/rsa1", (req, res) => {
    const data = req.body;
    const text = "Can you decrypt this text?";
    const encrypted = crypto_1.default
        .publicEncrypt({ key: data.publicKey }, Buffer.from(text))
        .toString("base64");
    res.status(200).json({ encrypted });
});
let privateKey;
app.get("/rsa2", (req, res) => {
    const key = new node_rsa_1.default({ b: 512 }).generateKeyPair();
    const publicKey = key.exportKey("pkcs1-public-pem");
    privateKey = key.exportKey("pkcs8-private-pem");
    res.status(200).json({ publicKey });
});
app.post("/rsa2", (req, res) => {
    const data = req.body;
    const symmetricKey = crypto_1.default
        .privateDecrypt({ key: privateKey }, Buffer.from(data.encryptedKey, "base64"))
        .toString("utf8");
    const filePath = path_1.default.join(__dirname, "../public", "example.txt");
    fs_1.default.readFile(filePath, (err, data) => {
        if (err) {
            console.error(err);
            res.status(400);
        }
        const fileData = data.toString();
        console.log(fileData);
        console.log(symmetricKey);
        const encrypted = CryptoJS.AES.encrypt(fileData, symmetricKey, {
            mode: CryptoJS.mode.CBC,
        }).toString();
        console.log(encrypted);
        res.status(200).json({ encrypted });
    });
});
app.listen(8000, () => {
    console.log(`Listening on: http://localhost:8000`);
});
