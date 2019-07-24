import { createResponseObject, createErrorResponseObject, verifyToken } from '../../utils/utils';
import { Client } from 'pg';
import Joi from 'joi';

const createEvent = async (event, context, callback) => {
    try {

        const token =  decodeURI(event.headers.token);
        let data = JSON.parse(event.body);
        const timestamp = new Date();
        const DB_CONFIG = { host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME };
        const client = new Client(DB_CONFIG);
        await client.connect()

        if(token){
            let userVerified = await verifyToken(client, token, data.created_user_id) 
            if(userVerified){
                console.log("userVerified is true", userVerified)
                const schema = Joi.object().keys({
                    event_name: Joi.string().required(),
                    created_user_id: Joi.required(),
                    start_date: Joi.date(),
                    end_date: Joi.date(),
                    event_type: Joi.required(),
                    location: Joi.required(),
                    description: Joi.string()
                });

                let validation = await Joi.validate(data, schema) 

                console.log("validation", validation)
                let result = await client.query(`INSERT INTO 
                            events(event_name, 
                                created_user_id, 
                                created_on, 
                                start_date,
                                 end_date,
                                  description,
                                   event_image,
                                    event_type, 
                                    location ) 
                            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, 
                            [data.event_name, 
                                data.created_user_id,
                                timestamp,
                                data.start_date,
                                data.end_date,
                                data.description,
                                "123",
                                data.event_type,
                                data.location
                            ]);
                
                        await client.end();
                        callback(null, createResponseObject({'msg': 'success'}));
                // validate the request data against the schema
                // Joi.validate(data, schema, async(err, value) => {    
                //     console.log("joi validate inside", err);
                //     if (err) {
                //         callback(null, createErrorResponseObject(422, 'INVALID_DATA', 'Request data is invalid'));
                //     }
                //     else{
                //         let result = await client.query(`INSERT INTO 
                //             events(event_name, created_user_id, created_on, starte_date, end_date, description, event_image, event_type, location ) 
                //             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, 
                //             [data.event_name, 
                //                 data.user_id,
                //                 timestamp,
                //                 data.start_date,
                //                 data.end_date,
                //                 data.description,
                //                 "123",
                //                 data.event_type,
                //                 data.location
                //             ]);
                //         await client.end();
                //         callback(null, createResponseObject({'msg': 'success'}));
                //     }
                // })      
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
        if(err.name === 'ValidationError'){
            callback(null, createErrorResponseObject(422, 'INVALID_DATA', err.details[0].message));
        }
        else{
            callback(null, createErrorResponseObject(500, 'INTERNAL_SERVER_ERROR', 'Could not execute create event function'));
        }
        
    }
};

export default createEvent;