import { createResponseObject, createErrorResponseObject } from '../../utils/utils';
import { Client } from 'pg';
import * as AWS from "aws-sdk";

const auth = async (event, context, callback) => {
    try {
        const timestamp = new Date();
        const phoneNo = decodeURI(event.pathParameters.phoneNo);
        const DB_CONFIG = { host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME };
        const client = new Client(DB_CONFIG);
        await client.connect()
                     
        let OTP = Math.floor(100000 + Math.random() * 900000)
        let userId

        const user = await client.query(`SELECT * FROM users WHERE phone_no=$1`, [phoneNo]);

        let result = user;
        
        if(user.rows.length === 0){
            result = await client.query(`INSERT INTO Users(phone_no, created_on) VALUES ($1,$2) RETURNING user_id`, [phoneNo, timestamp]);
            userId = result.rows[0].user_id;
        }
        else{
            userId = user.rows[0].user_id
            let deleteToken = await client.query(`DELETE FROM otp WHERE user_id=$1`, [userId])
            // OTP = insertOtp.rows[0].otp
        }

        const insertOtp = await client.query(`INSERT INTO otp(user_id,otp,created_on) VALUES ($1,$2,$3) RETURNING user_id`, [userId, OTP, timestamp]);

        await sendOtp(OTP, phoneNo);
        await client.end();
        callback(null, createResponseObject({'user_id' : userId, 'otp' : OTP}));
    }
    catch (err) {
        console.log("err in lambda", err);
        callback(null, createErrorResponseObject(500, 'INTERNAL_SERVER_ERROR', 'Could not execute auth function'));
    }
};

export default auth;

const sendOtp = async (OTP, phoneNo) => {
    console.log("called")
    let otp = OTP.toString();
    var sns = new AWS.SNS();

    sns.publish({
        Message: `OTP: ` + otp,
        MessageAttributes: {
            'AWS.SNS.SMS.SMSType': {
                DataType: 'String',
                StringValue: 'Transactional'
            },
            'AWS.SNS.SMS.SenderID': {
                DataType: 'String',
                StringValue: 'sendingOtp'
            },
        },
        PhoneNumber: phoneNo
    }, function (err, data) {
        if (err) console.log("err", err, err.stack);
        else console.log("data", data);
    });

}