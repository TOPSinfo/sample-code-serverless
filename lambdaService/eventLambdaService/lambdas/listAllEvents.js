import { createResponseObject, createErrorResponseObject, verifyToken } from '../../utils/utils';
import { Client } from 'pg';

const listAllEvents = async (event, context, callback) => {
    try {
        const user_id = decodeURI(event.pathParameters.userId);
        const token =  decodeURI(event.headers.token);

        const DB_CONFIG = { host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME };
        const client = new Client(DB_CONFIG);
        await client.connect()

        if(token){
            let userVerified = await verifyToken(client, token, user_id) 
            console.log("userVerified here is", userVerified)
            if(userVerified){

                const events = await client.query(`SELECT * FROM events WHERE created_user_id=$1`, [user_id]);
        
                await client.end();
                callback(null, createResponseObject(events.rows));
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
        callback(null, createErrorResponseObject(500, 'INTERNAL_SERVER_ERROR', 'Could not execute list event function'));
    }
};

export default listAllEvents;