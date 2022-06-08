import * as React from 'react';
import {createRoot} from "react-dom/client";
import {useState, useRef, useEffect} from "react";

const container = document.getElementById('root')
const root = createRoot(container);



const App = () => {
    const [fileName, setFileName] = useState(null);
    const [fileProcessOutput, setFileProcessOutput] = useState<FileOutput>(null);
    const [processTime, setProcessTime] = useState(0);
    const timer = useRef<NodeJS.Timer>(null);
    const startTime = useRef(0);

    const updateProcessTime = () => {
        setProcessTime(Date.now() - startTime.current);
    };

    useEffect(() => {
        if (fileName)
            timer.current = setInterval(updateProcessTime, 50);
    }, [fileName]);

    const selectFile = () => {

        window.electronAPI.selectFile().then((result) => {
            setFileName(result.file_name);
            startTime.current = Date.now();
            setProcessTime(0);
            return result.file_path;
        }).then((file_path) => {
            window.electronAPI.processFile(file_path).then((fileOutput: FileOutput) => {
                setFileProcessOutput(fileOutput);
                setProcessTime(Date.now() - startTime.current);
                clearInterval(timer.current);
            })
        }).catch((err) => {
            console.log(err);
        })

        // const [fileNamePromise, fileOutputPromise] = result
        // fileNamePromise.then((fileName: React.SetStateAction<string>) => {
        //     setFileName(fileName);
        // })
        //console.log(filePath)
        //setFileName(filePath.fileName)
    }

    return (<div>
            <h2>Hello from React!</h2>
            <h3 onClick={selectFile}>{(fileName) ? fileName : "Select a file"}</h3>
            <p>
                {`Number of Lines: ${(fileProcessOutput) ? fileProcessOutput.num_lines : 'N/A'}`}
            </p>
            <p>
                {`Number of Characters: ${(fileProcessOutput) ? fileProcessOutput.num_chars : 'N/A'}`}
            </p>
            <p>
                {`Number of Letters: ${(fileProcessOutput) ? fileProcessOutput.num_letters : 'N/A'}`}
            </p>
            <h4>{`This took ${processTime/1000.0}s to process.`}</h4>
        </div>
        );
}

root.render(<App/>)