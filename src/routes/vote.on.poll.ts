import { FastifyInstance } from "fastify";
import z from "zod";
import { prisma } from "../data.base/prisma.config";
import {randomUUID} from "node:crypto"
import { redis } from "../data.base/redis";
import { voting } from "../utils/voting.pil.sub";

export async function voteOnPoll (app: FastifyInstance) {
    app.post('/polls/:pollId/vote', async (request, reply)=> {

            const votePollBody = z.object({
                pollOpitionsId: z.string().uuid()
            });

            const votePollParams = z.object({
                pollId: z.string().uuid(),
            })

            const {pollId} = votePollParams.parse(request.params);
            const {pollOpitionsId} = votePollBody.parse(request.body);

            let { sectionId } = request.cookies;

            if(sectionId){
                const userPreviousVotePoll = await prisma.vote.findUnique({
                    where: {
                        sessionId_pollId: {
                            sessionId:sectionId,
                            pollId
                        }
                    }
                })

                if(userPreviousVotePoll && userPreviousVotePoll.pollOptionId !== pollOpitionsId){
                    await prisma.vote.delete({
                        where: {
                            id: userPreviousVotePoll.id
                        }
                    })

                    const resultVote = await redis.zincrby(pollId, -1, userPreviousVotePoll.pollOptionId)

                    voting.publish(pollId, {
                        pollOptionsId:userPreviousVotePoll.pollOptionId,
                        votes: Number(resultVote),
                    })
                    
                } else if (userPreviousVotePoll) {

                    return reply.status(400).send({ message: "You already voted on this poll" })
                }
            }

            if(!sectionId){
                sectionId = randomUUID();
                reply.setCookie('sectionId', sectionId, {
                    path: '/',
                    maxAge: 60 * 60 * 24 * 30, //30 dias
                    signed: true,
                    httpOnly: true,
                })
            }

            await prisma.vote.create({
                data: {
                    sessionId:sectionId,
                    pollId,
                    pollOptionId:pollOpitionsId
                }
            })

            const resultVote = await redis.zincrby(pollId, 1, pollOpitionsId)

            voting.publish(pollId, {
                pollOptionsId:pollOpitionsId,
                votes: Number(resultVote),
            })

            return reply.status(201).send();
    })
}

