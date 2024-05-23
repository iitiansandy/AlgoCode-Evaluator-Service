// import Docker from 'dockerode';

// import { TestCases } from '../types/testCases';

import { JAVA_IMAGE } from "../utils/constants";
import createContainer from "./containerFactory";
import decodeDockerStream from "./dockerHelper";
import pullImage from './pullImage';

async function runJava(code: string, inputTestCase: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rowLogBuffer: Buffer[] = [];

    console.log("Initializing a new Java Docker Container");

    await pullImage(JAVA_IMAGE);

    // const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > test.py && echo ${inputTestCase} | python3 test.py`;

    const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > Main.java && javac Main.java && echo '${inputTestCase.replace(/'/g, `'\\"`)}' | java Main`;

    console.log(runCommand);

    // const pythonDockerContainer = await createContainer(PYTHON_IMAGE, ['python3', '-c', code, 'stty -echo']);

    const javaDockerContainer = await createContainer(JAVA_IMAGE, [
        '/bin/sh', 
        '-c', 
        runCommand
    ]);

    // starting / booting the corresponding container
    await javaDockerContainer.start();

    console.log("Docker container started");

    const loggerStream = await javaDockerContainer.logs({
        stdout: true,
        stderr: true,
        timestamps: false,
        follow: true,
    });

    // Attach events on the stream objects to start and stop reading
    loggerStream.on("data", (chunk) => {
        rowLogBuffer.push(chunk);
    });

    // loggerStream.on("end", () => {
    //     console.log(rowLogBuffer);
    //     const completeBuffer = Buffer.concat(rowLogBuffer);
    //     const decodedStream = decodeDockerStream(completeBuffer);
    //     console.log(decodedStream);
    //     console.log(decodedStream.stdout);
    //     // res(decodedStream);
    // });

    // return pythonDockerContainer;

    await new Promise((res) => {
        loggerStream.on('end', () => {
            console.log(rowLogBuffer);
            const completeBuffer = Buffer.concat(rowLogBuffer);
            const decodedStream = decodeDockerStream(completeBuffer);
            console.log(decodedStream);
            console.log(decodedStream.stdout);
            res(decodeDockerStream);
        });
    });
    
    // remove the container when done with it
    await javaDockerContainer.remove();
}

export default runJava;
