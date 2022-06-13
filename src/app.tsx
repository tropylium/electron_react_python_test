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
    const [pid, setPid] = useState(undefined);
    const [exitStatus, setExitStatus] = useState(true);
    const [execStatus, setExecStatus] = useState<ExecStatus>(undefined);

    const arg_input = useRef<HTMLInputElement>(undefined)
    const stdin_input = useRef<HTMLInputElement>(undefined);
    const output_scroll_container = useRef<HTMLDivElement>(undefined);

    useEffect(() => {
        window.electronAPI.getExecStatus().then((status) => {
            setExecStatus(status);
        });
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
            setExitStatus(code === 0);
            setExecStatus('finished');
        })
    }, []);

    useEffect(() => {
        output_scroll_container.current.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
            inline: 'end',
        });
    }, [fileOutputs]);

    const startProgram = () => {
        if (execStatus !== undefined && execStatus !== 'running') {
            setExecStatus('running');
            setFileOutputs([]);
            window.electronAPI.startExec(arg_input.current.value).then((new_pid) => {
                setPid(new_pid);
                if (new_pid === -1) {
                    setExecStatus('finished');
                }
            });
        }
    }

    const killProgram = () => {
        if (execStatus === 'running') {
            window.electronAPI.killExec().then((result) => {
                console.log('attempt kill result: ' + result);
            });
        }
    }

    const onInput = (input: string) => {
        if (execStatus === 'running') {
            window.electronAPI.inputExec(input);
        }
    }

    const endInput = () => {
        if (execStatus === 'running') {
            window.electronAPI.endInput();
        }
    }

    return (
        <div className="appContainer">
            <h1>Python Exe Tester</h1>
            <h4>OS: {window.electronAPI.platform}</h4>
            <div className="buttons">
                <button
                    className={`startButton ${execStatus === undefined || execStatus === 'running'
                        ? "inActive" 
                        : ""
                    }`}
                    onClick={startProgram}>Start</button>
                <button
                    className={`endStdinButton ${execStatus === undefined || execStatus !== 'running' 
                        ? "inActive" 
                        : ""
                    }`}
                    onClick={endInput}>End stdin</button>
                <button
                    className={`killButton ${execStatus === undefined || execStatus !== 'running'
                        ? "inActive" 
                        : ""}`}
                    onClick={killProgram}>Kill</button>
            </div>
            <div className="buttons">
                <input ref={arg_input} placeholder="args"
                       onKeyPress={(e) => {
                           if (e.key === 'Enter') startProgram()}}/>
                <input ref={stdin_input} placeholder="stdin"
                       onKeyPress={(e) => {
                           if (e.key === 'Enter') onInput(e.currentTarget.value)}}/>
            </div>
            <p className="outputInfo" style={
                {display: ((execStatus === 'running' || execStatus === 'finished') && pid !== undefined
                    ? 'initial'
                    : 'none')}}>
                {pid >= 0
                    ? `Process (pid: ${pid}) began at ${(startTime) ? startTime.toLocaleTimeString() : ""}`
                    : 'Unable to start process.'}
            </p>
            <div className="outputScrollContainer">
                <div className="outputContainer" ref={output_scroll_container}>
                    {
                        fileOutputs.map((item, index) =>
                            <EventItem data={item} key={item.time + index.toString()}/>
                        )
                    }
                </div>
            </div>
            <p className="outputInfo" style={{display: (execStatus === 'finished' ? 'initial' : 'none')}}>
                {`Process exited ${exitStatus ? "successfully" : "with an error."}`}
            </p>
        </div>
        );
}

root.render(<App/>)