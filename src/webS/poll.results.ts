import { FastifyInstance } from "fastify";
import { voting } from "../utils/voting.pil.sub";
import z from "zod";

export async function pollResults(app: FastifyInstance){

    app.get('/polls/:pollid/results', {websocket: true}, (connection, request)=>{
        const getPollParams = z.object({
            pollid: z.string().uuid()
        })

        const {pollid} = getPollParams.parse(request.params);

       voting.subscribe(pollid, (message)=>{
        connection.socket.send(JSON.stringify(message))
       })
    })

}