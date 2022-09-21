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

interface ICryptoReq {
  encrypt: string;
  key: string;
}

app.post("/crypto", (req, res) => {
  const data: ICryptoReq = req.body;
  const decrypted = CryptoJS.DES.decrypt(data.encrypt, data.key, {
    mode: CryptoJS.mode.ECB,
  }).toString(CryptoJS.enc.Utf8);
  console.log(decrypted);
  res.status(200);
});

app.listen(8000, () => {
  console.log(`Listening on: http://localhost:8000`);
});
