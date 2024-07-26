import {fastify} from 'fastify'
import { userRoutes } from './routes/user'
import cookie from '@fastify/cookie'
export const app = fastify()

app.register(cookie)

app.register( userRoutes,{
    prefix: 'users'
})