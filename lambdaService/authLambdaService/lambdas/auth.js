import { createResponseObject, createErrorResponseObject } from '../../utils/utils';
import { Client } from 'pg';
import * as uuid from "uuid";

const testFunction = async (event, context, callback) => {
    try {
        const timestamp = new Date().getTime();
        const DB_CONFIG = { host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME };
        const client = new Client(DB_CONFIG);
        await client.connect()
        const res = await client.query(`DROP TABLE Users`);
        const res = await client.query(`
            CREATE TABLE Users(user_id SERIAL PRIMARY KEY,
            first_name VARCHAR (50),
            last_name VARCHAR (50),
            phone_no VARCHAR (15) UNIQUE NOT NULL,
            created_on TIMESTAMP NOT NULL,
            last_login TIMESTAMP
         )`);

        const result = await client.query(`INSERT INTO Users(phone_no, created_on) VALUES ('7405237892', ${timestamp})`);
        await client.end();
        callback(null, createResponseObject(result));
    }
    catch (err) {
        console.log("err in lambda", err);
        callback(null, createErrorResponseObject(500, 'INTERNAL_SERVER_ERROR', 'Could not execute auth function'));
    }
};

export default testFunction;
