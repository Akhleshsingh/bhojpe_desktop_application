const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  openDevTools: () => ipcRenderer.send("open-devtools"),
});
