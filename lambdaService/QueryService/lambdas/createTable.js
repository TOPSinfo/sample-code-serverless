import { createResponseObject, createErrorResponseObject } from '../../utils/utils';
import { Client } from 'pg';

const createTable = async (event, context, callback) => {
    try {
        const DB_CONFIG = { host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME };
        const client = new Client(DB_CONFIG);
        await client.connect()

        const res = await client.query(`
            CREATE TABLE Users(user_id SERIAL PRIMARY KEY,
                first_name VARCHAR (50) NULL,
                last_name VARCHAR (50) NULL,
                email VARCHAR (355) UNIQUE NULL,
                created_on TIMESTAMP  NULL,
                last_login TIMESTAMP,
                user_image VARCHAR (100)  NULL,
                device_type VARCHAR (50)  NULL,
                device_id VARCHAR (100)  NULL,
                device_name VARCHAR (100)  NULL,
                last_visited_screen VARCHAR (100)  NULL,
                phone_no VARCHAR (15) UNIQUE NOT NULL
         )`);

        // const res = await client.query(`
        //     CREATE TABLE Otp(id SERIAL PRIMARY KEY, 
        //     user_id INTEGER,
        //     otp INTEGER,
        //     created_on TIMESTAMP without time zone NOT NULL
        // )`);

        // const res = await client.query(`
        //     CREATE TABLE UsersToken(id SERIAL PRIMARY KEY, 
        //     user_id INTEGER,
        //     token VARCHAR (125),
        //     created_on TIMESTAMP without time zone NOT NULL
        // )`);

        await client.end();
        callback(null, createResponseObject(res));
    }
    catch (err) {
        console.log("err in lambda", err);
        callback(null, createErrorResponseObject(500, 'INTERNAL_SERVER_ERROR', 'Could not execute auth function'));
    }
};

export default createTable;
