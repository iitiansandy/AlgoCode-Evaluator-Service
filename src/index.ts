import bodyParser from "body-parser";
import express, { Express } from "express";

import bullBoardAdapter from "./config/bullBoardConfig";
import serverConfig from "./config/serverConfig";
import runPython from "./containers/runPythonDocker";
import apiRouter from "./routes";
import SampleWorker from "./workers/sampleWorker";

const app: Express = express();

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(bodyParser.text());

app.use('/api', apiRouter);
app.use('/ui', bullBoardAdapter.getRouter());

app.listen(serverConfig.port, () => {
    console.log("Server is running on port", serverConfig.port);

    console.log(`BullBoard dashboard running on: http://localhost:${serverConfig.port}/ui`);

    SampleWorker('SampleQueue');

    const code = `x = input()
y = input()
print("value of x is", x)
print("value of y is", y)
`;

    const inputCase = `100 
    200`;

    runPython(code, inputCase);
});