import { Client } from 'pg';
// import jwt from 'json-web-token';

export const createResponseObject = res => {
    console.log("res here is", res)
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

export const verifyToken = async (client, token, userId) => {
    console.log("verify token is called", token, userId)
    // const DB_CONFIG = { host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME };    
    // const client = new Client(DB_CONFIG);

    // await client.connect()
    // jwt.decode(secret, token, function (err_, decodedPayload, decodedHeader) {
    //     if (err) {
    //       console.error(err.name, err.message);
    //     } else {
    //       console.log(decodedPayload, decodedHeader);
    //     }
    // let secret = 'spotme'
    // const decodeToken = await jwt.decode(secret, token)

    // console.log("decodeToken here is", decodeToken)

    const result = await client.query(`SELECT * FROM userstoken WHERE user_id=$1`, [userId]);
    console.log("result here is", result)

    if(result.rows.length > 0){
        if(result.rows[0].token === token){
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
