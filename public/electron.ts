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

type TMode = "ECB" | "CBC";
type TFun = "DES" | "3DES" | "AES" | "nocrypt";

const modeSwitch = (mode: TMode) => {
  switch (mode) {
    case "ECB":
      return CryptoJS.mode.ECB;
    case "CBC":
      return CryptoJS.mode.CBC;
  }
};

const funSwitch = (fun: TFun, plane: string, key: string, mode: TMode) => {
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

app
  .whenReady()
  .then(createWindow)
  .then(() => {
    ipcMain.on("read", (event, args: { fun: TFun; mode: TMode }) => {
      dialog.showOpenDialog({ defaultPath: rootPath }).then((res) => {
        const filePath = res.filePaths[0];
        fs.readFile(filePath, (err, data) => {
          if (err) console.error(err);
          const plane = data.toString();
          const key = "cookie";

          const encrypted = funSwitch(args.fun, plane, key, args.mode);
          event.reply("read", encrypted);
          axios
            .post("http://localhost:8000/upload", {
              contents: encrypted,
              key,
              fun: args.fun,
              mode: args.mode,
            })
            .then((res) => {
              console.log(res.data);
            })
            .catch((err) => {
              console.error(err);
            });
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
