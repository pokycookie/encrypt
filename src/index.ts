const readBtn = document.querySelector<HTMLButtonElement>("button#read");
const funOpt = document.querySelector<HTMLSelectElement>("select#fun");
const modeOpt = document.querySelector<HTMLSelectElement>("select#mode");

const electron = window.require("electron");

electron.ipcRenderer.on("read", (event: any, args: string) => {
  console.log(args);
});

type TFun = "DES" | "3DES" | "AES" | "nocrypt";
type TMode = "ECB" | "CBC";

let fun: TFun = "DES";
let mode: TMode = "ECB";

const readHandler = () => {
  electron.ipcRenderer.send("read", { fun, mode });
};
const funHandler = (e: Event) => {
  const value = (e.target as HTMLSelectElement).value;
  fun = value as TFun;
};
const modeHandler = (e: Event) => {
  const value = (e.target as HTMLSelectElement).value;
  mode = value as TMode;
};

readBtn?.addEventListener("click", readHandler);
funOpt?.addEventListener("change", funHandler);
modeOpt?.addEventListener("change", modeHandler);
