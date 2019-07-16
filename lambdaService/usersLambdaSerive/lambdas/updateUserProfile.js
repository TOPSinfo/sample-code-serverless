import { createResponseObject, createErrorResponseObject, verifyToken } from '../../utils/utils';
import { Client } from 'pg';

const updateUserProfile = async (event, context, callback) => {
    try {
        const user_id = decodeURI(event.pathParameters.userId);
        const token =  decodeURI(event.headers.token);

        const DB_CONFIG = { host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME };
        const client = new Client(DB_CONFIG);
        await client.connect()

        if(token){
            let userVerified = verifyToken(client, token, user_id) 
            
            if(userVerified){

                let updateArray = [data.device_id, data.device_type, data.device_name]
                let query = `UPDATE users SET device_id=($1), device_type=($2), device_name={$3}`
                
                let queryClause = 'WHERE user_id=($2)'
                
                if('first_name' in data){
                    updateArray.push(data.first_name);
                    query += `first_name={$${updateArray.length}}`
                }
                if('last_name' in data){
                    updateArray.push(data.last_name);
                    query += `last_name={$${updateArray.length}}`
                }
                if('email' in data){
                    updateArray.push(data.email);
                    query += `email={$${updateArray.length}}`
                }
                if('last_visited_screen' in data){
                    updateArray.push(data.last_visited_screen);
                    query += `last_name={$${updateArray.length}}`
                }

                console.log("query here is", query)

                // const user = await client.query(`UPDATE users SET last_visited_screen=($1) WHERE user_id=($2)`, [data.last_visited_screen, data.user_id])
                await client.end();
                // callback(null, createResponseObject(users.rows));
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

export default updateUserProfile;