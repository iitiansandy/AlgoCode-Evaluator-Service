import DockerStreamOutput from "../types/dockerStreamOutput";
import { DOCKER_STREAM_HEADER_SIZE } from "../utils/constants";

export default function decodeDockerStream(buffer: Buffer) : DockerStreamOutput {
    let offset = 0; // this variable will keep track of the current position in the buffer while parsing
    
    // the output that will store the accumulated stdout and stderr output as strings
    const output: DockerStreamOutput = { stdout: '', stderr: ''};

    // Loop until offset reaches the end of the buffer
    while (offset < buffer.length) {
        const channel = buffer[offset];

        // this length variable hold the length of the value
        // we'll read this variable on an offset of 4 bytes from the start of the chunk
        const length = buffer.readUint32BE(offset + 4);

        // as we read the header, we can move forward to the value of the chunk
        offset += DOCKER_STREAM_HEADER_SIZE;

        if (channel === 1) {
            // stdout stream
            output.stdout += buffer.toString('utf-8', offset, offset + length);
        } else if (channel === 2) {
            // stderr stream
            output.stderr += buffer.toString('utf-8', offset, offset + length);

        }

        offset += length; // move offset to the next chunk
    };
    return output;
}