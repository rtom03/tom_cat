import { app, BrowserWindow, ipcMain, screen } from "electron";
import { initialize, enable } from "@electron/remote/main/index.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

initialize();

let win;

// Current window mode
// "sMin" = 350x70
// "compact" = 350x320
let windowMode = "compact";
function moveToBottomRight() {
  const { workArea } = screen.getPrimaryDisplay();

  const [width, height] = win.getSize();

  win.setPosition(
    workArea.x + workArea.width - width,
    workArea.y + workArea.height - height,
    true,
  );
}

function ensureRestored() {
  if (win.isMinimized()) win.restore();
  if (win.isMaximized()) win.restore();
}

function applyWindowState() {
  ensureRestored();

  switch (windowMode) {
    case "sMin":
      win.setMinimumSize(350, 70);
      win.setSize(350, 70);
      break;

    case "compact":
      win.setMinimumSize(350, 320);
      win.setSize(350, 320);
      break;
  }

  win.setAlwaysOnTop(true);
  moveToBottomRight();
}

function createWindow() {
  // win = new BrowserWindow({
  //   width: 350,
  //   height: 300,

  //   minWidth: 350,
  //   minHeight: 300,

  //   autoHideMenuBar: true,
  //   resizable: true,
  //   // maximizable: false,

  //   webPreferences: {
  //     nodeIntegration: false,
  //     contextIsolation: true,
  //     preload: path.join(__dirname, "preload.cjs"),
  //   },
  // });
  win = new BrowserWindow({
    width: 350,
    height: 300,

    frame: false,
    titleBarStyle: "hidden",

    resizable: true,
    autoHideMenuBar: true,

    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  enable(win.webContents);

  applyWindowState();

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  } else {
    win.loadURL("http://localhost:5173");
  }
}

app.whenReady().then(() => {
  createWindow();

  // ---------------- SAVE PDF ----------------

  ipcMain.handle("save-file", async (_, buffer, companyName, fileName) => {
    const folder = path.join(
      app.getPath("downloads"),
      (companyName || "Unknown Company").replace(/[<>:"/\\|?*]/g, "_").trim(),
    );

    fs.mkdirSync(folder, { recursive: true });

    fs.writeFileSync(path.join(folder, fileName), Buffer.from(buffer));
  });

  // ---------------- SMALL STRIP ----------------

  ipcMain.handle("toggle-sMin", () => {
    windowMode = "sMin";
    applyWindowState();
    return true;
  });

  // ---------------- COMPACT ----------------

  ipcMain.handle("toggle-compact", () => {
    windowMode = "compact";
    applyWindowState();
    return true;
  });

  ipcMain.handle("minimize-window", () => {
    win.minimize();
  });

  ipcMain.handle("maximize-window", () => {
    if (win.isMaximized()) {
      win.restore();
    } else {
      win.maximize();
    }
  });

  ipcMain.handle("close-window", () => {
    win.close();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
