import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    //openFile: () => ipcRenderer.invoke('dialog:openFile'),
    selectFile: () => ipcRenderer.invoke('selectFile'),
    processFile: (filePath: string) => ipcRenderer.invoke('processFile', filePath),
    startExec: (input: string) => ipcRenderer.invoke('startExec', input),
    onExecStart: (callback: (event: Electron.IpcRendererEvent, time: Date) => void) => ipcRenderer.on('start', callback),
    onExecOutput: (callback: (event: Electron.IpcRendererEvent, output: Output) => void) => ipcRenderer.on('output', callback),
    onExecEnd: (callback: (event: Electron.IpcRendererEvent, code: number) => void) => ipcRenderer.on('end', callback),
})