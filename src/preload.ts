import {contextBridge, ipcRenderer} from 'electron';

declare global {
    type FileOutput = {
        num_lines: number,
        num_chars: number,
        num_letters: number,
    }

    type Output = {
        type: 'normal' | 'error' | 'debug',
        time: number,
        output: {
            type: string,
            message: string,
        },
    }

    type ExecStatus = 'initial' | 'running' | 'finished'

    interface Window {
        electronAPI: {
            selectFile: () => Promise<{file_path: string, file_name: string}>,
            platform: string,
            onConsoleLog: (callback: (event: Electron.IpcRendererEvent, message: unknown) => void) => void,
            getExecStatus: () => Promise<ExecStatus>,
            startExec: (input: string) => Promise<number>,
            inputExec: (input: string) => void,
            endInput: () => void,
            killExec: () => Promise<boolean>,
            onExecStart: (callback: (event: Electron.IpcRendererEvent, time: Date) => void) => void,
            onExecOutput: (callback: (event: Electron.IpcRendererEvent, output: Output) => void) => void,
            onExecEnd: (callback: (event: Electron.IpcRendererEvent, code: number) => void) => void,
        }
    }
}

contextBridge.exposeInMainWorld('electronAPI', {
    selectFile: () => ipcRenderer.invoke('selectFile'),
    platform: process.platform,
    onConsoleLog: (callback: (event: Electron.IpcRendererEvent, message: string) => void) => ipcRenderer.on('log', callback),
    getExecStatus: () => ipcRenderer.invoke('getExec'),
    startExec: (input: string) => ipcRenderer.invoke('startExec', input),
    inputExec: (input: string) => ipcRenderer.invoke('inputExec', input),
    endInput: () => ipcRenderer.invoke('endInput'),
    killExec: () => ipcRenderer.invoke('killExec'),
    onExecStart: (callback: (event: Electron.IpcRendererEvent, time: Date) => void) => ipcRenderer.on('start', callback),
    onExecOutput: (callback: (event: Electron.IpcRendererEvent, output: Output) => void) => ipcRenderer.on('output', callback),
    onExecEnd: (callback: (event: Electron.IpcRendererEvent, code: number) => void) => ipcRenderer.on('end', callback),
})