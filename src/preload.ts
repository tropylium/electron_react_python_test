import {contextBridge, ipcRenderer} from 'electron';

declare global {
    type FileOutput = {
        num_lines: number,
        num_chars: number,
        num_letters: number,
    }

    type Output = {
        error: boolean,
        time: number,
        message: {
            type: string,
            message: string,
        },
    }

    interface Window {
        electronAPI: {
            selectFile: () => Promise<{file_path: string, file_name: string}>,
            // processFile: (filePath: string) => Promise<FileOutput>,
            platform: string,
            onConsoleLog: (callback: (event: Electron.IpcRendererEvent, message: unknown) => void) => void,
            startExec: (input: string) => Promise<number>,
            killExec: () => Promise<boolean>,
            onExecStart: (callback: (event: Electron.IpcRendererEvent, time: Date) => void) => void,
            onExecOutput: (callback: (event: Electron.IpcRendererEvent, output: Output) => void) => void,
            onExecEnd: (callback: (event: Electron.IpcRendererEvent, error: boolean) => void) => void,
        }
    }
}

contextBridge.exposeInMainWorld('electronAPI', {
    //openFile: () => ipcRenderer.invoke('dialog:openFile'),
    selectFile: () => ipcRenderer.invoke('selectFile'),
    processFile: (filePath: string) => ipcRenderer.invoke('processFile', filePath),
    platform: process.platform,
    onConsoleLog: (callback: (event: Electron.IpcRendererEvent, message: string) => void) => ipcRenderer.on('log', callback),
    startExec: (input: string) => ipcRenderer.invoke('startExec', input),
    killExec: () => ipcRenderer.invoke('killExec'),
    onExecStart: (callback: (event: Electron.IpcRendererEvent, time: Date) => void) => ipcRenderer.on('start', callback),
    onExecOutput: (callback: (event: Electron.IpcRendererEvent, output: Output) => void) => ipcRenderer.on('output', callback),
    onExecEnd: (callback: (event: Electron.IpcRendererEvent, code: number) => void) => ipcRenderer.on('end', callback),
})