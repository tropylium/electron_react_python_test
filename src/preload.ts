import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    //openFile: () => ipcRenderer.invoke('dialog:openFile'),
    selectFile: () => ipcRenderer.invoke('selectFile'),
    processFile: (filePath: string) => ipcRenderer.invoke('processFile', filePath),
})