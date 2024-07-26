import {FastifyInstance} from 'fastify'

export async function userRoutes(app: FastifyInstance){
    app.get('/', async (req, res) => {
        return 'hello world'
    })
}