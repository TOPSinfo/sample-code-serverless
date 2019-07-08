import { createErrorResponseObject, createResponseObject } from '../../utils/utils';
import { Client } from 'pg';

const testFunction = async (event, context, callback) => {
    try {
        const client = new Client({
            host: 'spot-me-db-instance.cdnduxceh2ya.us-east-1.rds.amazonaws.com',
            port: '5432',
            user: 'spotmedev',
            password: 'spotme?123',
            database: 'spot_me'
        })
        await client.connect()
        const res = await client.query('SELECT NOW()');
        console.log("********", res);
        await client.end();
        callback(null, createResponseObject(true));
    }
    catch (err) {
        console.log("err in lambda", err);
        callback(null, createErrorResponseObject(500, 'INTERNAL_SERVER_ERROR', 'Could not execute test function'));
    }
};

export default testFunction;
