import { app, BrowserWindow, dialog, ipcMain } from "electron";
import * as path from "path";
import * as fs from "fs";
import * as CryptoJS from "crypto-js";
import axios from "axios";
import * as NodeRSA from "node-rsa";
import * as crypto from "crypto";

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
    ipcMain.on("rsa1", (event, args) => {
      const key = new NodeRSA({ b: 512 }).generateKeyPair();
      const publicKey = key.exportKey("pkcs1-public-pem");
      const privateKey = key.exportKey("pkcs8-private-pem");

      console.log(publicKey);
      console.log(privateKey);

      axios
        .post("http://localhost:8000/rsa1", {
          publicKey,
        })
        .then((res) => {
          const data: { encrypted: string } = res.data;
          const encrypted = data.encrypted;
          const decrypted = crypto
            .privateDecrypt(
              {
                key: privateKey,
              },
              Buffer.from(encrypted, "base64")
            )
            .toString("utf8");
          console.log(encrypted);
          console.log(decrypted);
        })
        .catch((err) => {
          console.error(err);
        });
    });
    ipcMain.on("rsa2", (event, args) => {
      const symmetricKey = "mySymmetricKey";
      axios
        .get("http://localhost:8000/rsa2")
        .then((res) => {
          const data: { publicKey: string } = res.data;
          const encryptedKey = crypto
            .publicEncrypt({ key: data.publicKey }, Buffer.from(symmetricKey))
            .toString("base64");
          axios
            .post("http://localhost:8000/rsa2", {
              encryptedKey,
            })
            .then((res) => {
              const data: { encrypted: string } = res.data;
              const decrypted = CryptoJS.AES.decrypt(data.encrypted, symmetricKey, {
                mode: CryptoJS.mode.CBC,
              }).toString(CryptoJS.enc.Utf8);
              console.log(decrypted);
            })
            .catch((err) => console.error(err));
        })
        .catch((err) => {
          console.error(err);
        });
    });
  });

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
