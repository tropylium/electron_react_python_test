import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import {createRoot} from "react-dom/client";
import "./app.css";

import EventItem from "./eventItem";

const container = document.getElementById('root')
const root = createRoot(container);

const App = () => {
    const [fileOutputs, setFileOutputs] = useState<Output[]>([]);
    const [startTime, setStartTime] = useState<Date>(undefined);
    const [pid, setPid] = useState(-1);
    const [exitStatus, setExitStatus] = useState(true);
    const [currentlyRunning, setCurrentlyRunning] = useState(false);
    const [exited, setExited] = useState(false);

    const input = useRef(null);

    useEffect(() => {
        window.electronAPI.onConsoleLog(((event, message) => {
            console.log('From main:\n' + message);
        }))
        window.electronAPI.onExecStart(((event, time) => {
            setStartTime(time);
        }))
        window.electronAPI.onExecOutput((event, output) => {
            setFileOutputs((prevState => [...prevState, output]));
        })
        window.electronAPI.onExecEnd((event, code) => {
            setCurrentlyRunning(false);
            setExitStatus(code === 0);
            setExited(true);
        })
    }, []);

    const startProgram = () => {
        if (!currentlyRunning) {
            setCurrentlyRunning(true);
            setExited(false);
            setFileOutputs([]);
            window.electronAPI.startExec(input.current.value).then((pid) => {
                setPid(pid);
            });
        }
    }

    const killProgram = () => {
        if (currentlyRunning) {
            window.electronAPI.killExec().then((result) => {
                console.log('attempt kill result: ' + result);
            });
        }
    }

    const onInput = (input: string) => {
        window.electronAPI.inputExec(input);
    }

    return (
        <div className="appContainer">
            <h1>Python Exe Tester</h1>
            <h4>OS: {window.electronAPI.platform}</h4>
            <div className="buttons">
                <button className={`startButton ${currentlyRunning ? "inActive" : ""}`} onClick={startProgram}>Start</button>
                <button className={`killButton ${!currentlyRunning ? "inActive" : ""}`} onClick={killProgram}>Kill</button>
                <input ref={input} placeholder="Input" onKeyPress={(e) => {if (e.key === 'Enter') onInput(e.currentTarget.value)}}/>
            </div>
            <p className="outputInfo" style={{display: (currentlyRunning || exited ? 'initial' : 'none')}}>
                {`Process (pid: ${pid}) began at ${(startTime) ? startTime.toLocaleTimeString() : ""}`}
            </p>
            <div className="outputContainer">
                {
                    fileOutputs.map((item, index) =>
                        <EventItem data={item} key={item.time + index.toString()}/>
                    )
                }
            </div>
            <p className="outputInfo" style={{display: (exited ? 'initial' : 'none')}}>
                {`Process exited ${exitStatus ? "successfully" : "with an error."}`}
            </p>
        </div>
        );
}

root.render(<App/>)