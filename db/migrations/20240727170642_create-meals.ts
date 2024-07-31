import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('meals', (table) => {
        table.uuid('id').primary();
        table.uuid('user_id').references('users.id').notNullable();
        table.string('name').notNullable();
        table.text('description').notNullable().unique();
        table.date('date_time').notNullable();
        table.boolean('within_diet').notNullable();
        table.dateTime('created_on')
            .notNullable()
            .defaultTo(knex.raw('CURRENT_TIMESTAMP'));

        table.dateTime('updated_on')
            .notNullable()
            .defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    });

    await knex.raw(`
        CREATE TRIGGER update_meals_updated_on
        AFTER UPDATE ON meals
        FOR EACH ROW
        BEGIN
            UPDATE meals SET updated_on = CURRENT_TIMESTAMP WHERE id = OLD.id;
        END
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw('DROP TRIGGER IF EXISTS update_meals_updated_on');
    await knex.schema.dropTable('meals');
}