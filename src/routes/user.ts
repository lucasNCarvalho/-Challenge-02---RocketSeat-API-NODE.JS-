import { randomUUID } from 'crypto'
import {FastifyInstance} from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function userRoutes(app: FastifyInstance){
    app.post('/', async (req, res) => {
        
        const createUserSchema = z.object({
            name: z.string(),
            email: z.string()
        })

        const {name, email} = createUserSchema.parse(req.body)

        console.log('name', name, 'email', email)

        let session_id = req.cookies.session_id

        if(!session_id) {
            session_id = randomUUID()

            res.cookie('session_id', session_id, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            })
        }

        await knex('users')
            .insert({
                id: randomUUID(),
                session_id,
                name,
                email
            })

        return res.status(201).send('User created')
    })  
}