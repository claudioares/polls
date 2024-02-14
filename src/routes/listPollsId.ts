import { FastifyInstance } from "fastify";
import { prisma } from "../data.base/prisma.config";
import z from "zod";
import { redis } from "../data.base/redis";



export async function listPollsId (app: FastifyInstance) {

    app.get('/polls/:pollsId', async ( request, reply)=> {
        try {
            const getPollParams = z.object({
                pollsId: z.string()
            });

            const getIdParams = getPollParams.parse(request.params);
            const pollId = getIdParams.pollsId

            const newPoll = await prisma.poll.findUnique({
                where:{
                    id: pollId
                },
                include: {
                    option: {
                        select: {
                            id: true,
                            title: true
                        }
                    }
                }
            });

            if(!newPoll) {
                return reply.send({ message: "Poll not found!"})
            }

            const resultPointsPolls = await redis.zrange(pollId, 0, -1, 'WITHSCORES')

            const votes = resultPointsPolls.reduce((obj, line, index)=>{
                if(index % 2 === 0) {
                    const score = resultPointsPolls[index + 1]

                    Object.assign(obj, {[line] : Number(score)})
                }

                return obj;
            }, {} as Record<string, number>)

            return reply.send({
                poll: {
                    id: newPoll.id,
                    title: newPoll.title,
                    options: newPoll.option.map(opt => {
                        return {
                            id: opt.id,
                            title: opt.title,
                            score: (opt.id in votes) ? votes[opt.id] : 0
                        }
                    })
                }
            })
    
        } catch (error) {
            console.error('Error during authentication:', error);
            reply.status(500).send({ error: "Error during creation!" });
        }
    });

}