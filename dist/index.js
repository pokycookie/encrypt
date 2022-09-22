"use strict";
const readBtn = document.querySelector("button#read");
const funOpt = document.querySelector("select#fun");
const modeOpt = document.querySelector("select#mode");
const electron = window.require("electron");
electron.ipcRenderer.on("read", (event, args) => {
    console.log(args);
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
readBtn === null || readBtn === void 0 ? void 0 : readBtn.addEventListener("click", readHandler);
funOpt === null || funOpt === void 0 ? void 0 : funOpt.addEventListener("change", funHandler);
modeOpt === null || modeOpt === void 0 ? void 0 : modeOpt.addEventListener("change", modeHandler);
