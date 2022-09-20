import { app, BrowserWindow, dialog, ipcMain } from "electron";
import * as path from "path";
import * as fs from "fs";
import * as CryptoJS from "crypto-js";

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
          const encrypted = CryptoJS.DES.encrypt(plane, key, {
            mode: CryptoJS.mode.ECB,
          }).toString();
          event.reply("read", encrypted);
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
