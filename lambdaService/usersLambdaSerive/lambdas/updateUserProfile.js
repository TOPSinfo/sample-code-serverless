import { createResponseObject, createErrorResponseObject, verifyToken } from '../../utils/utils';
import { Client } from 'pg';
import http from "http"

const aws = require('aws-sdk')
const s3 = new aws.S3()

const updateUserProfile = async (event, context, callback) => {
    try {
        console.log("event value is", event)
        const token =  decodeURI(event.headers.token);
        const data = JSON.parse(event.body)
        const DB_CONFIG = { host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME };
        const client = new Client(DB_CONFIG);
        await client.connect()

        if(token){
            let userVerified = await verifyToken(client, token, data.user_id) 
            
            if(userVerified){

                let updateArray = [data.user_id, data.device_id, data.device_type, data.device_name]
                let query = `UPDATE users SET device_id=($2), device_type=($3), device_name=($4)`
                
                let queryClause = 'WHERE user_id=($1)'

                if('user_image' in data){
                    await s3.upload({
                        Bucket: bucketName,
                        Key: data.user_image.fileName,
                        Body: ''
                      }, (error, result) => {
                        console.log(error, result);
                      });
                }

                if('first_name' in data){
                    updateArray.push(data.first_name);
                    query += ` ,first_name=($${updateArray.length})`
                }
                if('last_name' in data){
                    updateArray.push(data.last_name);
                    query += ` ,last_name=($${updateArray.length})`
                }
                if('email' in data){
                    updateArray.push(data.email);
                    query += ` ,email=($${updateArray.length})`
                }

                query+=' '+queryClause

                console.log("query here is", query)

                const user = await client.query(query, updateArray)

                // var options = {
                //     method: 'GET',
                //     host: 'localhost:9090',        
                //     path: '/plugins/restapi/v1/users/honey', 
                //     headers: {
                //         'accept': 'application/json',
                //     }
                // };
                // const req = http.request(options, function (response) {
                //     response.on('data', data => dataStr += data);
                //     response.on('end', () => callback(JSON.parse(dataStr)));
                //   }).on('error', err => console.log("err here is", err)
                // );    
                // req.end()
                
                await client.end();
                callback(null, createResponseObject({'msg' :'success'}));
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