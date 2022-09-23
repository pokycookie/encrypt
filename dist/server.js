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
app.listen(8000, () => {
    console.log(`Listening on: http://localhost:8000`);
});
