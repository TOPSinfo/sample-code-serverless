import { createResponseObject, createErrorResponseObject, verifyToken } from '../../utils/utils';
import { Client } from 'pg';

const fetchLastVisitedScreen = async (event, context, callback) => {
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
                let screenToDisplay 
                const user = await client.query(`SELECT * FROM users WHERE user_id=$1`, [user_id]);
                
                if(!user.rows[0].first_name){
                    screenToDisplay = 'profile'
                }
                else if(user.rows[0].first_name && user.rows[0].first_name.length === 0){
                    screenToDisplay = 'profile'
                }
                else{
                    screenToDisplay = user.rows[0].last_visited_screen
                }

                await client.end();
                callback(null, createResponseObject({'screenToDisplay': screenToDisplay}));
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
        callback(null, createErrorResponseObject(500, 'INTERNAL_SERVER_ERROR', 'Could not execute fetch last visited screen function'));
    }
};

export default fetchLastVisitedScreen;