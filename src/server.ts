import express from "express";
import fileUpload from "express-fileupload";
import * as CryptoJS from "crypto-js";

const app = express();

app.use(express.json());
app.use(fileUpload());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.json("server");
});

type TFun = "DES" | "3DES" | "AES" | "nocrypt";
type TMode = "ECB" | "CBC";

interface ICryptoReq {
  contents: string;
  key: string;
  fun: TFun;
  mode: TMode;
}

const modeSwitch = (mode: TMode) => {
  switch (mode) {
    case "ECB":
      return CryptoJS.mode.ECB;
    case "CBC":
      return CryptoJS.mode.CBC;
  }
};

const funSwitch = (fun: TFun, cipher: string, key: string, mode: TMode) => {
  switch (fun) {
    case "nocrypt":
      return cipher;
    case "DES":
      return CryptoJS.DES.decrypt(cipher, key, { mode: modeSwitch(mode) }).toString(
        CryptoJS.enc.Utf8
      );
    case "3DES":
      return CryptoJS.TripleDES.decrypt(cipher, key, { mode: modeSwitch(mode) }).toString(
        CryptoJS.enc.Utf8
      );
    case "AES":
      return CryptoJS.AES.decrypt(cipher, key, { mode: modeSwitch(mode) }).toString(
        CryptoJS.enc.Utf8
      );
  }
};

app.post("/upload", (req, res) => {
  const data: ICryptoReq = req.body;
  const decrypted = funSwitch(data.fun, data.contents, data.key, data.mode);
  console.log(decrypted);
  res.status(200).json(`${data.fun} - ${data.mode}`);
});

app.listen(8000, () => {
  console.log(`Listening on: http://localhost:8000`);
});
