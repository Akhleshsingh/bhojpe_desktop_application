const path = require("path");
const { app, BrowserWindow, ipcMain, session, Menu } = require("electron");

// function createWindow() {
//   const win = new BrowserWindow({
//     width: 1100,
//     height: 700,
//     autoHideMenuBar: true,   // 👈 hides menu bar
//     webPreferences: {
//       preload: path.join(__dirname, "preload.cjs"),
//       contextIsolation: true,
//       nodeIntegration: false,
//     },
//   });
//   Menu.setApplicationMenu(null);

//   if (!app.isPackaged) {
//     win.loadURL("http://localhost:5173");
//   } else {
//     win.loadFile(path.join(__dirname, "dist", "index.html"));
//   }
// }
app.commandLine.appendSwitch("disable-crash-reporter");
function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 700,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  Menu.setApplicationMenu(null);

  // ✅ Enable DevTools shortcut manually
  win.webContents.on("before-input-event", (event, input) => {
    if (input.control && input.shift && input.key.toLowerCase() === "i") {
      win.webContents.openDevTools();
    }

    if (input.key === "F12") {
      win.webContents.openDevTools();
    }
  });

  if (!app.isPackaged) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "dist", "index.html"));
  }
}


app.whenReady().then(() => {
session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      "Content-Security-Policy": [
        `
        default-src 'self';
        connect-src 'self' http://bhojpe.in https://bhojpe.in;
        img-src 'self' data: blob:
          https://bhojpe.s3.ap-south-1.amazonaws.com
          http://bhojpe.in;
        script-src 'self' 'unsafe-inline';
        style-src 'self' 'unsafe-inline';
        `,
      ],
    },
  });
});


  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

ipcMain.on("open-devtools", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.webContents.openDevTools();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.disableHardwareAcceleration();
app.commandLine.appendSwitch("disable-gpu");
app.commandLine.appendSwitch("no-sandbox");