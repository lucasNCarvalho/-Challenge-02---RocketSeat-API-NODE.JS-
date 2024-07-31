import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check_session_id_exists'

export async function mealRoutes(app: FastifyInstance) {
    app.post('/', {
        preHandler: [checkSessionIdExists]
    }, async (req, res) => {

        const createMealSchema = z.object({
            name: z.string(),
            description: z.string().nullable(),
            date_time: z.coerce.date(),
            within_diet: z.boolean(),
        })

        const { name, description, date_time, within_diet } = createMealSchema.parse(req.body)

        try {
            await knex('meals')
                .insert({
                    id: randomUUID(),
                    name,
                    description,
                    user_id: req.user?.id,
                    date_time,
                    within_diet
                })

            return res.status(201).send({ message: 'meal created' })

        } catch (error) {

            return res.status(500).send({ message: 'Internal Server Error' })

        }

    })

    app.put('/:id', {
        preHandler: [checkSessionIdExists]
    }, async (req, res) => {

        const paramsSchema = z.object({
            id: z.string()
        })

        const { id } = paramsSchema.parse(req.params)

        console.log('id', id)

        const updateMealSchema = z.object({
            name: z.string(),
            description: z.string().nullable(),
            date_time: z.coerce.date(),
            within_diet: z.boolean(),
        })

        try {
            const { name, description, date_time, within_diet } = updateMealSchema.parse(req.body)

            const mealExists = await knex('meals').where({ id: id }).first()

            if (!mealExists) {
                return res.status(404).send('meal not found')
            }

            if (mealExists.user_id === req.user?.id) {
                await knex('meals')
                    .where({ id: id })
                    .update({
                        name,
                        description,
                        date_time,
                        within_diet
                    })

                return res.status(204).send('meal updated')

            } else {

                return res.status(403).send('unauthorized')
            }

        } catch (error) {

            return res.status(500).send({ message: 'Internal Server Error' })

        }

    })

    app.delete('/:id', {
        preHandler: [checkSessionIdExists]
    }, async (req, res) => {
        const paramsSchema = z.object({
            id: z.string()
        })

        const { id } = paramsSchema.parse(req.params)

        try {
            const mealExists = await knex('meals').where({ id: id }).first()

            if (!mealExists) {
                return res.status(404).send({ message: 'meal not found' })
            }

            if (mealExists.user_id === req.user?.id) {
                await knex('meals')
                    .where({ id: id })
                    .delete()

                return res.status(204).send({ message: 'meal deleted' })
            } else {
                return res.status(403).send({ message: 'unauthorized' })
            }
        } catch (error) {

            return res.status(500).send({ message: 'Internal Server Error' })

        }


    })

    app.get('/:id', {
        preHandler: [checkSessionIdExists]
    }, async (req, res) => {
        const paramsSchema = z.object({
            id: z.string()
        })

        const { id } = paramsSchema.parse(req.params)

        try {
            const mealExists = await knex('meals').where({ id: id }).first()

            if (!mealExists) {
                return res.status(404).send({ message: 'meal not found' })
            }

            if (mealExists.user_id !== req.user?.id) {
                return res.status(403).send({ message: 'unauthorized' })
            }

            return res.status(200).send(mealExists)

        } catch (error) {

            return res.status(500).send({ message: 'Internal Server Error' })

        }

    })

    app.get('/', {
        preHandler: [checkSessionIdExists]
    }, async (req, res) => {

        try {
            const meals = await knex('meals').where({ user_id: req.user?.id }).select()

            res.status(200).send(meals)
        } catch (error) {

            return res.status(500).send({ message: 'Internal Server Error' })

        }
    })

    app.get('/metrics', {
        preHandler: [checkSessionIdExists]
    }, async (req, res) => {

        const totalMeals = await knex('meals').where({ user_id: req.user?.id })

        const totalMealOnDiet = totalMeals.filter((value) => {
            return value.within_diet === 1
        })

        const totalMealOffDiet = totalMeals.filter((value) => {
            return value.within_diet !== 1
        })

        const {bestSequence} = totalMeals.reduce((acumulator, value) => {

            if (value.within_diet === 1) {
                acumulator.actualSequence++;
            } else {
                acumulator.actualSequence = 0;
            }

            if (acumulator.actualSequence > acumulator.bestSequence) {
                acumulator.bestSequence = acumulator.actualSequence
            }

            return acumulator
        }, { actualSequence: 0, bestSequence: 0 })

        return res.send({
            totalMeals: totalMeals.length,
            totalMealOnDiet: totalMealOnDiet.length,
            totalMealOffDiet: totalMealOffDiet.length,
            bestDietSequence: bestSequence,
        })
    })
}