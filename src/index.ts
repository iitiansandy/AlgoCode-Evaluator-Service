import express, { Express } from "express";

import serverConfig from "./config/serverConfig";
import sampleQueueProducer from "./producers/sampleQueueProducer";
import apiRouter from "./routes";
import SampleWorker from "./workers/sampleWorker";

const app: Express = express();

app.use('/api', apiRouter);

app.listen(serverConfig.port, () => {
    console.log("Server is running on port", serverConfig.port);

    SampleWorker('SampleQueue');

    sampleQueueProducer('SampleJob', {
        name: "Sandeep",
        company: 'IBM',
        position: 'SDE-1',
        location: "Noida"
    });
});