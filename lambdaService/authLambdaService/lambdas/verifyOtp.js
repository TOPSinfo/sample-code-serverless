

import { createResponseObject, createErrorResponseObject } from '../../utils/utils';
import { Client } from 'pg';

const verifyOtp = async (event, context, callback) => {
    try {
        const timestamp = new Date();
        let data = JSON.parse(event.body);
        const DB_CONFIG = { host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME };
        const client = new Client(DB_CONFIG);
        await client.connect()

        const result = await client.query(`SELECT otp FROM otp WHERE user_id=$1`, [data.user_id]);
        if (data.code === result.rows[0].otp) {
            callback(null, createResponseObject({ 'msg': 'success' }));
        } else {
            callback(null, createErrorResponseObject(400, 'INVALID_PARAMETER', 'Invalid Otp'));
        }

        await client.end();
    }
    catch (err) {
        console.log("err in lambda", err);
        callback(null, createErrorResponseObject(500, 'INTERNAL_SERVER_ERROR', 'Could not execute auth function'));
    }
};

export default verifyOtp;
