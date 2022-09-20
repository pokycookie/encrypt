"use strict";
const readBtn = document.querySelector("button#read");
const electron = window.require("electron");
electron.ipcRenderer.on("read", (event, args) => {
    console.log(args);
});
const readHandler = () => {
    console.log("read");
    electron.ipcRenderer.send("read", "I want to read file");
};
readBtn === null || readBtn === void 0 ? void 0 : readBtn.addEventListener("click", readHandler);
