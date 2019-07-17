import { createResponseObject, createErrorResponseObject, verifyToken } from '../../utils/utils';
import { Client } from 'pg';
import uuid from 'uuid'

const contactSync = async (event, context, callback) => {
    try {
        const timestamp = new Date();
        let data = JSON.parse(event.body);
        console.log("api called **************************", data)
        //Example object in body
        // let data = {
        //     'userId' : 12345,
        //     'contacts' : [
        //         {
        //             phone_no : '918401655455',
        //             local_id: 1
        //         },
        //         {
        //             phone_no : '919725337199',
        //             local_id: 2
        //         },
        //         {
        //             phone_no : '8401255455',
        //             local_id: 3
        //         },
        //         {
        //             phone_no : '8408575455',
        //             local_id: 4
        //         },
        //         {
        //             phone_no : '8400255455',
        //             local_id: 5
        //         }
        //     ]
        // }
        const token =  decodeURI(event.headers.token);

        const DB_CONFIG = { host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME };
        const client = new Client(DB_CONFIG);
        await client.connect()

        if(token){
            let userVerified = await verifyToken(client, token, data.user_id) 

            if(userVerified){
                let phoneNumbers = data.contacts.map(contact => contact.phone_no )
                
                console.log("phoneNumbers here is", phoneNumbers)

                const result = await client.query(`SELECT * FROM users WHERE phone_no = ANY($1) `,[[phoneNumbers]]);

                console.log("result here is", result)

                let response = data.contacts.map(contact => {
                    result.rows.map(res => {
                        if(res.phone_no === contact.phone_no){
                            contact.server_id = res.user_id
                        }
                    })
                    return contact;
                })
                await client.end();
                callback(null, createResponseObject(response));
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
        callback(null, createErrorResponseObject(500, 'INTERNAL_SERVER_ERROR', 'Could not execute contact sync function'));
    }
};


export default contactSync;
