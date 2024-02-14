import fastify, {FastifyInstance} from "fastify";
import cookie from "@fastify/cookie";
import websocket from "@fastify/websocket";
import { createPoll } from "./routes/create.polls";
import { listPolls } from "./routes/list.polls";
import { listPollsId } from "./routes/listPollsId";
import { voteOnPoll } from "./routes/vote.on.poll";
import { pollResults } from "./webS/poll.results";



export class App {
 
    private app: FastifyInstance
    constructor(){
        this.app = fastify();
    };

    listen(){
        this.app.listen({port:3333}).then(()=>console.log("Server running ..."))
    }

    register(){
        this.app.register(cookie, {
            secret: "a@AXXkC1Dhywek0",
            hook: "onRequest",
        });
        this.app.register(websocket)

        this.app.register(listPolls);
        this.app.register(createPoll);
        this.app.register(listPollsId);
        this.app.register(voteOnPoll);
        this.app.register(pollResults)
    }
}
