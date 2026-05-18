import { app, BrowserWindow, ipcMain } from "electron";
import { initialize, enable } from "@electron/remote/main/index.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs"; // ← was missing

const __dirname = path.dirname(fileURLToPath(import.meta.url));

initialize();

app.whenReady().then(() => {
  // ← only registered once, inside whenReady
  ipcMain.handle("save-file", async (_event, buffer, companyName, fileName) => {
    const folderName = (companyName || "Unknown Company")
      .replace(/[<>:"/\\|?*]/g, "_")
      .trim();

    const downloadsPath = app.getPath("downloads");
    const companyFolder = path.join(downloadsPath, folderName);
    fs.mkdirSync(companyFolder, { recursive: true });
    fs.writeFileSync(path.join(companyFolder, fileName), Buffer.from(buffer));
  });

  // ← createWindow called inside the same .then()
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  enable(win.webContents);
  win.loadURL("http://localhost:5173");
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
