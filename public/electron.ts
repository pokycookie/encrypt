import { app, BrowserWindow, dialog, ipcMain } from "electron";
import * as path from "path";
import * as fs from "fs";
import * as CryptoJS from "crypto-js";
import axios from "axios";

const rootPath = `${app.getPath("documents")}`;

const createWindow = () => {
  const window = new BrowserWindow({
    width: 1200,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  window.loadFile(path.join(__dirname, "/index.html"));
};

const modeSwitch = () => {};

const funSwitch = () => {};

app
  .whenReady()
  .then(createWindow)
  .then(() => {
    ipcMain.on("read", (event, args) => {
      dialog.showOpenDialog({ defaultPath: rootPath }).then((res) => {
        const filePath = res.filePaths[0];
        fs.readFile(filePath, (err, data) => {
          if (err) console.error(err);
          const plane = data.toString();
          const key = "cookie";
          let encrypted: string;
          switch (args.fun) {
            case "DES":
              encrypted = CryptoJS.DES.encrypt(plane, key, {
                mode: CryptoJS.mode.ECB,
              }).toString();
              const decrypted = CryptoJS.DES.decrypt(encrypted, key, {
                mode: CryptoJS.mode.ECB,
              }).toString(CryptoJS.enc.Utf8);
              console.log(decrypted);
              event.reply("read", encrypted);
              axios
                .post("http://localhost:8000/crypto", {
                  encrypt: encrypted,
                  key,
                })
                .then((res) => {
                  console.log(res.data);
                });
              break;
            case "3DES":
              encrypted = CryptoJS.TripleDES.encrypt(plane, key, {
                mode: CryptoJS.mode.ECB,
              }).toString();
              event.reply("read", encrypted);
              break;
            case "AES":
              encrypted = CryptoJS.AES.encrypt(plane, key, {
                mode: CryptoJS.mode.ECB,
              }).toString();
              event.reply("read", encrypted);
              break;
            case "nocrypt":
              console.log("nocrypt");
              axios
                .post("http://localhost:8000/nocrypt", {
                  data: plane,
                })
                .then((res) => {
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

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
