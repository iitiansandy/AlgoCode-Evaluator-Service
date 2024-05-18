import Docker from 'dockerode';

async function createContainer(imageName: string, cmdExecutable: string[]) {
    const docker = new Docker();

    const container = await docker.createContainer({
        Image: imageName,
        Cmd: cmdExecutable,
        AttachStdin: true, // To enable inp stream
        AttachStdout: true, // to enable output stream
        AttachStderr: true, // to enable error stream
        Tty: false,
        OpenStdin: true, // keep the open stream open even no interaction is there
    });

    return container;
};

export default createContainer;