"use strict";
const readBtn = document.querySelector("button#read");
const funOpt = document.querySelector("select#fun");
const modeOpt = document.querySelector("select#mode");
const rsa1Btn = document.querySelector("button#rsa1");
const rsa2Btn = document.querySelector("button#rsa2");
const rsa1Result = document.querySelector("textarea#rsa1Result");
const rsa2Result = document.querySelector("textarea#rsa2Result");
const electron = window.require("electron");
electron.ipcRenderer.on("read", (event, args) => {
    console.log(args);
});
electron.ipcRenderer.on("rsa1", (event, args) => {
    if (rsa1Result) {
        rsa1Result.innerText = args;
    }
});
electron.ipcRenderer.on("rsa2", (event, args) => {
    if (rsa2Result) {
        rsa2Result.innerText = args;
    }
});
let fun = "DES";
let mode = "ECB";
const readHandler = () => {
    electron.ipcRenderer.send("read", { fun, mode });
};
const funHandler = (e) => {
    const value = e.target.value;
    fun = value;
};
const modeHandler = (e) => {
    const value = e.target.value;
    mode = value;
};
const rsa1Handler = (e) => {
    electron.ipcRenderer.send("rsa1");
};
const rsa2Handler = (e) => {
    electron.ipcRenderer.send("rsa2");
};
readBtn === null || readBtn === void 0 ? void 0 : readBtn.addEventListener("click", readHandler);
funOpt === null || funOpt === void 0 ? void 0 : funOpt.addEventListener("change", funHandler);
modeOpt === null || modeOpt === void 0 ? void 0 : modeOpt.addEventListener("change", modeHandler);
rsa1Btn === null || rsa1Btn === void 0 ? void 0 : rsa1Btn.addEventListener("click", rsa1Handler);
rsa2Btn === null || rsa2Btn === void 0 ? void 0 : rsa2Btn.addEventListener("click", rsa2Handler);
