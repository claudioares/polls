import { FastifyInstance } from "fastify";
import { prisma } from "../data.base/prisma.config";

export async function listPolls (app: FastifyInstance) {

    app.get('/polls', async (_ , reply)=> {
        try {
            const listPolls = await prisma.poll.findMany();
            return reply.send(listPolls)
    
        } catch (error) {
            console.error('Error during authentication:', error);
            reply.status(500).send({ error: "Error during creation!" });
        }
    });

}
