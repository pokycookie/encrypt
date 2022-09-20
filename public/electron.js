"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var path = require("path");
var fs = require("fs");
var CryptoJS = require("crypto-js");
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
                var encrypted = CryptoJS.DES.encrypt(plane, key, {
                    mode: CryptoJS.mode.ECB
                }).toString();
                event.reply("read", encrypted);
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
