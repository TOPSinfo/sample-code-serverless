import { createResponseObject, createErrorResponseObject, verifyToken } from '../../utils/utils';
import { Client } from 'pg';
import Multipart from "lambda-multipart-parser";

const aws = require('aws-sdk')
const s3 = new aws.S3({
    accessKeyId: "AKIAZUJATGDNYJNWRZG6",
    secretAccessKey: "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"
});

const updateUserProfile = async (event, context, callback) => {
    try {
        const token =  decodeURI(event.headers.token);
        const data = await Multipart.parse(event);
            data.user_image = data.files[0];
            delete data.files;
        console.log("data here is", data)

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
                    let s3Response = await uploadImageOns3(data.user_image);
                    updateArray.push(s3Response.Location);
                    query += ` ,user_image=($${updateArray.length})`
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
                
                console.log("user value is", user)
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

function uploadImageOns3(userImage) {
    return new Promise(function(res, rej) {
      let key = userImage.filename;
      let params = {
        Bucket: "spot-me-user-image",
        Key: key,
        Body: userImage.content,
        ACL: "public-read"
      };
      s3.upload(params, function(err, data) {
        if (err) {
          rej(err);
        }
        res(data);
      });
    });
  }