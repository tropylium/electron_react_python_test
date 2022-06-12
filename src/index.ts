import {app, BrowserWindow, dialog, ipcMain} from 'electron';
import * as path from "path";
import {ChildProcess, spawn} from "child_process"

// This allows TypeScript to pick up the magic constant that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

let mainWindow: BrowserWindow;
const getExtraResourcePath = (fileName: string): string => {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'extraResources', fileName)
  } else {
    return `./extraResources/${fileName}`
  }
}

const consoleLog = (message: unknown): void => {
  mainWindow.webContents.send('log', message);
}

const createWindow = (): void => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY).then();

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

const selectFile = async () => {
  const {canceled, filePaths} = await dialog.showOpenDialog({
  })
  if (canceled) {
    throw Error()
  }
  const absolute_file_path = filePaths[0]
  return {
    file_path: absolute_file_path,
    file_name: path.basename(absolute_file_path)
  }
}

let currentlyRunning = false;
let startTime = 0;
let currentProcess: ChildProcess = undefined;
const startExec = (event: Electron.IpcMainEvent, input: string) => {
  if (!currentlyRunning) {
    currentlyRunning = true;
    startTime = Date.now();
    currentProcess = spawn(getExtraResourcePath('tester'), input.length > 0 ? [input] : []);
    mainWindow.webContents.send('start', new Date());

    currentProcess.on('error', (err) => {
      consoleLog(err);
    });

    currentProcess.stdout.on('data', data => {
      mainWindow.webContents.send('output', {
        type: 'normal',
        time: (Date.now() - startTime)/1000,
        output: {
          type: undefined,
          message: data.toString()
        }
      } as Output);
    });

    currentProcess.stderr.on('data', data => {
      const output: Output = {
        type: 'error',
        time: (Date.now() - startTime)/1000,
        output: undefined
      }
      try {
        output.output = JSON.parse(data.toString());
      } catch (e) {
        output.output = {
          type: null,
          message: data.toString()
        };
      }
      mainWindow.webContents.send('output', output);
    });

    currentProcess.on('close', (code) => {
      currentlyRunning = false;
      mainWindow.webContents.send('end', code);
      currentProcess = undefined;
    });
    currentProcess.stdin.setDefaultEncoding('utf-8');

    return currentProcess.pid;
  }
  return -1;
}

const inputExec = (event: Electron.IpcMainInvokeEvent, input: string) => {
  currentProcess.stdin.write(input + '\n');
  // currentProcess.stdin.end();
}

const killExec = () => {
  if (currentlyRunning) {
    mainWindow.webContents.send('output', {
      type: "debug",
      time: (Date.now() - startTime)/1000,
      output: {
        type: undefined,
        // Technically this message should be handled by renderer, but oh well
        message: "Attempted to kill process."
      }
    } as Output);
    const kill_success = currentProcess.kill()
    mainWindow.webContents.send('output', {
      type: "debug",
      time: (Date.now() - startTime)/1000,
      output: {
        type: undefined,
        message: `Kill success : ${kill_success}`
      }
    } as Output);
    return kill_success;
  } else {
    return false;
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  ipcMain.handle('selectFile', selectFile)
  // ipcMain.handle('processFile', processFile)
  ipcMain.handle('startExec', startExec)
  ipcMain.handle('inputExec', inputExec)
  ipcMain.handle('killExec', killExec)
  createWindow()
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});