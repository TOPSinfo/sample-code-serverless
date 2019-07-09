import { Client } from 'pg';

export const createResponseObject = res => {
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
        },
        body: JSON.stringify(res)
    }
};


export const createErrorResponseObject = (error_id, error_name, error_msg) => {
    return {
        statusCode: error_id || 501,
        headers: {
            "Content-Type": "text/plain",
            "Access-Control-Allow-Origin": "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
        },
        body: JSON.stringify({ error_id, error_name, error_msg })
    }
}

export const verifyToken = async (token, userId) => {
    console.log("token here is", token);
    console.log("userId here is", userId)

    const DB_CONFIG = { host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME };
    console.log("DB_CONFIG", DB_CONFIG);
    const client = new Client(DB_CONFIG);

    console.log("client here is", client);

    // await client.connect()

    console.log("hello world")
    const result = await client.query(`SELECT * FROM userstoken WHERE user_id=$1`, [userId]);

    console.log("result here is", result)

    console.log("result here is", result);
    if(result.length > 0){
        if(result.token === token){
            return true
        }
        else{
            return false
        }
    }
    else{
       return false 
    }
}
