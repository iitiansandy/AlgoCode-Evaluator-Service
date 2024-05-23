import bodyParser from "body-parser";
import express, { Express } from "express";

import bullBoardAdapter from "./config/bullBoardConfig";
import serverConfig from "./config/serverConfig";
import runJava from "./containers/runJavaDocker";
import apiRouter from "./routes";
import SampleWorker from "./workers/sampleWorker";

const app: Express = express();

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(bodyParser.text());

app.use("/api", apiRouter);
app.use("/ui", bullBoardAdapter.getRouter());

app.listen(serverConfig.port, () => {
    console.log("Server is running on port", serverConfig.port);

    console.log(`BullBoard dashboard running on: http://localhost:${serverConfig.port}/ui`);

    SampleWorker("SampleQueue");

    const code = `
    import java.util.*;
    public class Main {
        public static void main(String[] args) {
            Scanner scn = new Scanner(System.in);
            int input = scn.nextInt();
            System.out.println("Input value given by user: " + input);
            for(int i = 0; i <= input; i++) {
                System.out.println(i);
            };
        };
    };
    `;

    const inputCase = `10`;

    runJava(code, inputCase);
});
