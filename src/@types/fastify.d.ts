import {fastify} from 'fastify'

declare module 'fastify' {
    export interface FastifyRequest {
        user?: {
            id: string
            session_id: string
            name: string
            email: string
            created_At: string
            updated_At: string
        }
    }
}