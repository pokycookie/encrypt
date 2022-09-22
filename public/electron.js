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
var modeSwitch = function () { };
var funSwitch = function () { };
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
                var encrypted;
                switch (args.fun) {
                    case "DES":
                        encrypted = CryptoJS.DES.encrypt(plane, key, {
                            mode: CryptoJS.mode.ECB
                        }).toString();
                        var decrypted = CryptoJS.DES.decrypt(encrypted, key, {
                            mode: CryptoJS.mode.ECB
                        }).toString(CryptoJS.enc.Utf8);
                        console.log(decrypted);
                        event.reply("read", encrypted);
                        axios_1["default"]
                            .post("http://localhost:8000/crypto", {
                            encrypt: encrypted,
                            key: key
                        })
                            .then(function (res) {
                            console.log(res.data);
                        });
                        break;
                    case "3DES":
                        encrypted = CryptoJS.TripleDES.encrypt(plane, key, {
                            mode: CryptoJS.mode.ECB
                        }).toString();
                        event.reply("read", encrypted);
                        break;
                    case "AES":
                        encrypted = CryptoJS.AES.encrypt(plane, key, {
                            mode: CryptoJS.mode.ECB
                        }).toString();
                        event.reply("read", encrypted);
                        break;
                    case "nocrypt":
                        console.log("nocrypt");
                        axios_1["default"]
                            .post("http://localhost:8000/nocrypt", {
                            data: plane
                        })
                            .then(function (res) {
                            console.log(res.data);
                        });
                        break;
                    default:
                        break;
                }
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
