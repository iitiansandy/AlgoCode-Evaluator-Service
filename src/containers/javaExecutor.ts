// import Docker from 'dockerode';

// import { TestCases } from '../types/testCases';

import CodeExecutorStrategy, { ExecutionResponse } from "../types/codeExecutorStrategy";
import { JAVA_IMAGE } from "../utils/constants";
import createContainer from "./containerFactory";
import decodeDockerStream from "./dockerHelper";
import pullImage from "./pullImage";

class JavaExecutor implements CodeExecutorStrategy {
    async execute(code: string, inputTestCase: string, outputTestCase: string): Promise<ExecutionResponse> {
        const rowLogBuffer: Buffer[] = [];

        console.log(code, inputTestCase, outputTestCase);
        console.log("Initializing a new Java Docker Container");

        await pullImage(JAVA_IMAGE);

        // const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > test.py && echo ${inputTestCase} | python3 test.py`;

        const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > Main.java && javac Main.java && echo '${inputTestCase.replace(/'/g, `'\\"`)}' | java Main`;

        console.log(runCommand);

        // const pythonDockerContainer = await createContainer(PYTHON_IMAGE, ['python3', '-c', code, 'stty -echo']);

        const javaDockerContainer = await createContainer(JAVA_IMAGE, ["/bin/sh", "-c", runCommand]);

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

        try {
            const codeResponse: string = await this.fetchDecodedStream(loggerStream, rowLogBuffer);
            return { output: codeResponse, status: "COMPLETED" };
        } catch (error) {
            return { output: error as string, status: "ERROR!!!" };
        } finally {
            // remove the container when done with it
            await javaDockerContainer.remove();
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

export default JavaExecutor;
