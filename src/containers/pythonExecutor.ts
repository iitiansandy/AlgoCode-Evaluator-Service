// import Docker from 'dockerode';

// import { TestCases } from '../types/testCases';

import CodeExecutorStrategy, { ExecutionResponse } from "../types/codeExecutorStrategy";
import { PYTHON_IMAGE } from "../utils/constants";
import createContainer from "./containerFactory";
import decodeDockerStream from "./dockerHelper";
// import pullImage from "./pullImage";

class PythonExecutor implements CodeExecutorStrategy {
    async execute(code: string, inputTestCase: string): Promise<ExecutionResponse> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rowLogBuffer: Buffer[] = [];

        console.log("Initializing a new Python Docker Container");

        // const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > test.py && echo ${inputTestCase} | python3 test.py`;

        const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > test.py && echo '${inputTestCase.replace(/'/g, `'\\"`)}' | python3 test.py`;

        console.log(runCommand);

        // const pythonDockerContainer = await createContainer(PYTHON_IMAGE, ['python3', '-c', code, 'stty -echo']);

        const pythonDockerContainer = await createContainer(PYTHON_IMAGE, ["/bin/sh", "-c", runCommand]);

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
        try {
            const codeResponse: string = await this.fetchDecodedStream(loggerStream, rowLogBuffer);
            return { output: codeResponse, status: "COMPLETED" };
        } catch (error) {
            return { output: error as string, status: "ERROR!!!" };
        } finally {
            // remove the container when done with it
            await pythonDockerContainer.remove();
        }
    }

    fetchDecodedStream(loggerStream: NodeJS.ReadableStream, rowLogBuffer: Buffer[]): Promise<string> {
        return new Promise((res, rej) => {
            loggerStream.on("end", () => {
                console.log(rowLogBuffer);
                const completeBuffer = Buffer.concat(rowLogBuffer);
                const decodedStream = decodeDockerStream(completeBuffer);
                console.log(decodedStream);
                console.log(decodedStream.stdout);
                if (decodedStream.stderr) {
                    rej(decodedStream.stderr);
                } else {
                    res(decodedStream.stdout);
                }
            });
        });
    }
}

export default PythonExecutor;
