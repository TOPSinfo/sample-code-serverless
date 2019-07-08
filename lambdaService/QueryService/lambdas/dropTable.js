import { createResponseObject, createErrorResponseObject } from '../../utils/utils';
import { Client } from 'pg';

const dropTable = async (event, context, callback) => {
    try {
        const DB_CONFIG = { host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME };
        const tableName = decodeURI(event.pathParameters.tableName);
        const client = new Client(DB_CONFIG);
        await client.connect()

        const response = await client.query(`DROP TABLE ${tableName}`);
        await client.end();
        callback(null, createResponseObject(response));
    }
    catch (err) {
        console.log("err in lambda", err);
        callback(null, createErrorResponseObject(500, 'INTERNAL_SERVER_ERROR', 'Could not execute auth function'));
    }
};

export default dropTable;
