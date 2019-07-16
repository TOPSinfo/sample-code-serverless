import { createResponseObject, createErrorResponseObject, verifyToken } from '../../utils/utils';
import { Client } from 'pg';

const updateLastVisitedScreen = async (event, context, callback) => {
    try {

        const token =  decodeURI(event.headers.token);
        let data = JSON.parse(event.body);

        const DB_CONFIG = { host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME };
        const client = new Client(DB_CONFIG);
        await client.connect()

        if(token){
            let userVerified = verifyToken(client, token, data.user_id) 
            
            if(userVerified){
                const user = await client.query(`UPDATE users SET last_visited_screen=($1) WHERE user_id=($2)`, [data.last_visited_screen, data.user_id])

                await client.end();
                callback(null, createResponseObject({'msg': 'success'}));
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
        callback(null, createErrorResponseObject(500, 'INTERNAL_SERVER_ERROR', 'Could not execute Update last visited screen function'));
    }
};

export default updateLastVisitedScreen;