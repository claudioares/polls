import { FastifyInstance } from "fastify";
import z from "zod";
import { prisma } from "../data.base/prisma.config";

export async function createPoll (app: FastifyInstance) {
    app.post('/polls', async (request, reply)=> {

            const resultBody = z.object({
                title: z.string(),
                options: z.array(z.string())
            });

            const {title, options} = resultBody.parse(request.body);

            const newPoll = await prisma.poll.create({
                data:{
                    title,
                    option: {
                        createMany: {
                            data: options.map(opt => {
                                return {title: opt}
                            })
                        }
                    }
                }
            });

            return reply.status(201).send({pollId: newPoll.id})
    })
}

