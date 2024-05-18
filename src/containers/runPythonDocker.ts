// import Docker from 'dockerode';

// import { TestCases } from '../types/testCases';

import { PYTHON_IMAGE } from '../utils/constants';
import createContainer from './containerFactory';
import decodeDockerStream from './dockerHelper';

async function runPython(code:string, inputTestCase: string) {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rowLogBuffer: Buffer[] = [];

    console.log("Initializing a new Python Docker Container");

    // const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > test.py && echo ${inputTestCase} | python3 test.py`;

    const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > test.py && echo '${inputTestCase.replace(/'/g, `'\\"`)}' | python3 test.py`;

    console.log(runCommand);
    
    // const pythonDockerContainer = await createContainer(PYTHON_IMAGE, ['python3', '-c', code, 'stty -echo']);

    const pythonDockerContainer = await createContainer(PYTHON_IMAGE, [
        '/bin/sh',
        '-c',
        runCommand
    ]);


    // starting / booting the corresponding container
    await pythonDockerContainer.start();

    console.log("Docker container started");

    const loggerStream = await pythonDockerContainer.logs({
        stdout: true,
        stderr: true,
        timestamps: false,
        follow: true,
    });

    // Attach events on the stream objects to start and stop reading
    loggerStream.on('data', (chunk) => {
        rowLogBuffer.push(chunk);
    });

    loggerStream.on('end', () => {
        console.log(rowLogBuffer);
        const completeBuffer = Buffer.concat(rowLogBuffer);
        const decodedStream = decodeDockerStream(completeBuffer);

        console.log(decodedStream);

        console.log(decodedStream.stdout);
    });
    

    return pythonDockerContainer;
};

export default runPython;