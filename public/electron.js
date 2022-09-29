"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var path = require("path");
var fs = require("fs");
var CryptoJS = require("crypto-js");
var axios_1 = require("axios");
var NodeRSA = require("node-rsa");
var crypto = require("crypto");
var moment = require("moment");
var rootPath = "".concat(electron_1.app.getPath("documents"));
var createWindow = function () {
    var window = new electron_1.BrowserWindow({
        width: 400,
        height: 300,
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
    // Symmetric
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
                axios_1["default"]
                    .post("http://localhost:8000/upload", {
                    contents: encrypted,
                    key: key,
                    fun: args.fun,
                    mode: args.mode
                })
                    .then(function (res) {
                    console.log(res.data);
                })["catch"](function (err) {
                    console.error(err);
                });
            });
        });
    });
    // RSA1
    electron_1.ipcMain.on("rsa1", function (event, args) {
        var key = new NodeRSA({ b: 512 }).generateKeyPair();
        var publicKey = key.exportKey("pkcs1-public-pem");
        var privateKey = key.exportKey("pkcs8-private-pem");
        console.log(publicKey);
        console.log(privateKey);
        var startTime = moment(new Date());
        axios_1["default"]
            .post("http://localhost:8000/rsa1", {
            publicKey: publicKey
        })
            .then(function (res) {
            var data = res.data;
            var encrypted = data.encrypted;
            var decrypted = crypto
                .privateDecrypt({
                key: privateKey
            }, Buffer.from(encrypted, "base64"))
                .toString("utf8");
            console.log(decrypted);
            event.reply("rsa1", decrypted);
            var endTime = moment(new Date());
            var timeDiff = endTime.diff(startTime, "milliseconds");
            console.log(timeDiff);
        })["catch"](function (err) {
            console.error(err);
        });
    });
    // RSA2
    electron_1.ipcMain.on("rsa2", function (event, args) {
        var symmetricKey = "mySymmetricKey";
        var startTime = moment(new Date());
        axios_1["default"]
            .get("http://localhost:8000/rsa2")
            .then(function (res) {
            var data = res.data;
            var encryptedKey = crypto
                .publicEncrypt({ key: data.publicKey }, Buffer.from(symmetricKey))
                .toString("base64");
            axios_1["default"]
                .post("http://localhost:8000/rsa2", {
                encryptedKey: encryptedKey
            })
                .then(function (res) {
                var data = res.data;
                var decrypted = CryptoJS.AES.decrypt(data.encrypted, symmetricKey, {
                    mode: CryptoJS.mode.CBC
                }).toString(CryptoJS.enc.Utf8);
                console.log(decrypted);
                event.reply("rsa2", decrypted);
                var endTime = moment(new Date());
                var timeDiff = endTime.diff(startTime, "milliseconds");
                console.log(timeDiff);
            })["catch"](function (err) { return console.error(err); });
        })["catch"](function (err) {
            console.error(err);
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
