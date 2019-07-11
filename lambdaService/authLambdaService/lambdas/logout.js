

import { createResponseObject, createErrorResponseObject, verifyToken } from '../../utils/utils';
import { Client } from 'pg';


const logout = async (event, context, callback) => {
    try {
        console.log("lout value is called")
        const timestamp = new Date();
        let data = JSON.parse(event.body);

        console.log("data value is", data)

        const DB_CONFIG = { host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME };
        const client = new Client(DB_CONFIG);
        await client.connect();

        // const insertUserToken = await client.query(`INSERT INTO UsersToken(user_id,token,created_on) VALUES ($1,$2,$3) RETURNING user_id`, [data.user_id, token.value, timestamp]);
        const deleteToken = await client.query(`DELETE FROM userstoken  WHERE user_id=$1`, [data.user_id]);
        if(deleteToken.rowCount === 1){
            callback(null, createResponseObject({ 'msg': 'success' })); 
        }
        else{
            callback(null, createErrorResponseObject(401, 'UNAUTHORIZED_USER', 'User does not exists'));    
        }
        
        await client.end();
    }
    catch (err) {
        console.log("err in lambda", err);
        callback(null, createErrorResponseObject(500, 'INTERNAL_SERVER_ERROR', 'Could not execute logout function'));
    }
};

export default logout;
