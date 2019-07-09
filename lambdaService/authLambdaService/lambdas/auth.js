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

        const OTP = Math.floor(100000 + Math.random() * 900000)
        const result = await client.query(`INSERT INTO Users(phone_no, created_on) VALUES ($1,$2) RETURNING user_id`, [phoneNo, timestamp]);

        console.log("result here is", result);

        const newlyCreatedUserId = result.rows[0].user_id;

        console.log("newlyCreatedUserId", newlyCreatedUserId)

        const insertOtp = await client.query(`INSERT INTO otp(user_id,otp,created_on) VALUES ($1,$2,$3) RETURNING user_id`, [newlyCreatedUserId, OTP, timestamp]);

        console.log("insertOtp value is", insert)

        await sendOtp(OTP, phoneNo);

        await client.end();
        callback(null, createResponseObject(newlyCreatedUserId));
    }
    catch (err) {
        console.log("err in lambda", err);
        callback(null, createErrorResponseObject(500, 'INTERNAL_SERVER_ERROR', 'Could not execute auth function'));
    }
};

export default auth;

const sendOtp = async (OTP, phoneNo) => {
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
        if (err) console.log(err, err.stack);
        else console.log(data);
    });

}