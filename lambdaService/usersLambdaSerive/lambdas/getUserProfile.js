import { createResponseObject, createErrorResponseObject, verifyToken } from '../../utils/utils';
import { Client } from 'pg';

const getUserProfile = async (event, context, callback) => {
    try {
        const user_id = decodeURI(event.pathParameters.userId);
        const token =  decodeURI(event.headers.token);

        const DB_CONFIG = { host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME };
        const client = new Client(DB_CONFIG);
        await client.connect()

        if(token){
            let userVerified = await verifyToken(client, token, user_id) 
            
            if(userVerified){
                const users = await client.query(`SELECT * FROM users WHERE user_id=$1`, [user_id]);
                await client.end();
                const response = {
                    user_id: users.rows[0].user_id,
                    username : users.rows[0].first_name,
                    email: users.rows[0].email,
                    phone_no: users.rows[0].phone_no
                }
                callback(null, createResponseObject(response));
            }
            else{
                await client.end();
                callback(null, createErrorResponseObject(401, 'UNAUTHORIZED_USER', 'User is not authorized'));
            }
        }else{
            callback(null, createErrorResponseObject(401, 'UNAUTHORIZED_USER', 'User is not authorized'));
        }
        
    }
    catch (err) {
        console.log("err in lambda", err);
        callback(null, createErrorResponseObject(500, 'INTERNAL_SERVER_ERROR', 'Could not execute auth function'));
    }
};

export default getUserProfile;