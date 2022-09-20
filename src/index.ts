const readBtn = document.querySelector<HTMLButtonElement>("button#read");
const electron = window.require("electron");

electron.ipcRenderer.on("read", (event: any, args: string) => {
  console.log(args);
});

const readHandler = () => {
  console.log("read");
  electron.ipcRenderer.send("read", "I want to read file");
};

readBtn?.addEventListener("click", readHandler);
