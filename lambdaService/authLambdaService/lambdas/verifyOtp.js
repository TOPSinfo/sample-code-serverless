

import { createResponseObject, createErrorResponseObject, verifyToken } from '../../utils/utils';
import { Client } from 'pg';
import jwt from 'json-web-token';

const verifyOtp = async (event, context, callback) => {
    try {
        const timestamp = new Date();
        let data = JSON.parse(event.body);
        const DB_CONFIG = { host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME };
        const client = new Client(DB_CONFIG);
        await client.connect();
        const result = await client.query(`SELECT otp FROM otp WHERE user_id=$1`, [data.user_id]);
        if (data.code === result.rows[0].otp) {
            var payload = {
                "request": {
                  "userId": result.rows[0].user_id,
                  "status": "SUCCESS"
                }
            };
            var secret = 'spotme'
    
            var token = jwt.encode(secret, payload);
            const insertUserToken = await client.query(`INSERT INTO userstoken(user_id,token,created_on) VALUES ($1,$2,$3) RETURNING user_id`, [data.user_id, token.value, timestamp]);
            callback(null, createResponseObject({ 'msg': 'success', 'token' : token }));
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
