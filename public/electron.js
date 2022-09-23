"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var path = require("path");
var fs = require("fs");
var CryptoJS = require("crypto-js");
var axios_1 = require("axios");
var rootPath = "".concat(electron_1.app.getPath("documents"));
var createWindow = function () {
    var window = new electron_1.BrowserWindow({
        width: 1200,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    window.loadFile(path.join(__dirname, "/index.html"));
};
var modeSwitch = function (mode) {
    switch (mode) {
        case "ECB":
            return CryptoJS.mode.ECB;
        case "CBC":
            return CryptoJS.mode.CBC;
    }
};
var funSwitch = function (fun, plane, key, mode) {
    switch (fun) {
        case "nocrypt":
            return plane;
        case "DES":
            return CryptoJS.DES.encrypt(plane, key, { mode: modeSwitch(mode) }).toString();
        case "3DES":
            return CryptoJS.TripleDES.encrypt(plane, key, { mode: modeSwitch(mode) }).toString();
        case "AES":
            return CryptoJS.AES.encrypt(plane, key, { mode: modeSwitch(mode) }).toString();
    }
};
electron_1.app
    .whenReady()
    .then(createWindow)
    .then(function () {
    electron_1.ipcMain.on("read", function (event, args) {
        electron_1.dialog.showOpenDialog({ defaultPath: rootPath }).then(function (res) {
            var filePath = res.filePaths[0];
            fs.readFile(filePath, function (err, data) {
                if (err)
                    console.error(err);
                var plane = data.toString();
                var key = "cookie";
                var encrypted = funSwitch(args.fun, plane, key, args.mode);
                event.reply("read", encrypted);
                axios_1["default"].post("http://localhost:8000/upload", {
                    contents: encrypted,
                    key: key,
                    fun: args.fun,
                    mode: args.mode
                });
            });
        });
    });
});
electron_1.app.on("window-all-closed", function () {
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
electron_1.app.on("activate", function () {
    if (electron_1.BrowserWindow.getAllWindows().length === 0)
        createWindow();
});
