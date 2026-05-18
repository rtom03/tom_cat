const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  saveFile: (buffer, companyName, fileName) =>
    ipcRenderer.invoke("save-file", buffer, companyName, fileName),
});
