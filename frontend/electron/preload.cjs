// const { contextBridge, ipcRenderer } = require("electron");

// contextBridge.exposeInMainWorld("electronAPI", {
//   saveFile: (buffer, companyName, fileName) =>
//     ipcRenderer.invoke("save-file", buffer, companyName, fileName),
// });
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  saveFile: (buffer, company, file) =>
    ipcRenderer.invoke("save-file", buffer, company, file),

  sMin: () => ipcRenderer.invoke("toggle-sMin"),

  compact: () => ipcRenderer.invoke("toggle-compact"),
  minimize: () => ipcRenderer.invoke("minimize-window"),

  maximize: () => ipcRenderer.invoke("maximize-window"),

  close: () => ipcRenderer.invoke("close-window"),

  drag: () => ipcRenderer.send("drag"),
});
