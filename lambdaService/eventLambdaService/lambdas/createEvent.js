import {
  createResponseObject,
  createErrorResponseObject,
  verifyToken
} from "../../utils/utils";
import { Client } from "pg";
import Joi from "joi";
import Multipart from "lambda-multipart-parser";

const aws = require("aws-sdk");
const s3 = new aws.S3({
  accessKeyId: "AKIAZUJATGDNYJNWRZG6",
  secretAccessKey: "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"
});

const createEvent = async (event, context, callback) => {
  try {
    const token = decodeURI(event.headers.token);

    const data = await Multipart.parse(event);
    data.event_image = data.files[0];
    delete data.files;
    // let data = event.body.event_name

    const timestamp = new Date();
    const DB_CONFIG = {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    };
    const client = new Client(DB_CONFIG);
    await client.connect();

    if (token) {
      let userVerified = await verifyToken(client, token, data.created_user_id);
      if (userVerified) {
        const schema = Joi.object().keys({
          event_name: Joi.string().required(),
          created_user_id: Joi.required(),
          start_date: Joi.date(),
          end_date: Joi.date(),
          event_type: Joi.required(),
          location: Joi.required(),
          description: Joi.string(),
          event_image: Joi.object()
        });

        let validation = await Joi.validate(data, schema);
        let s3Response;
        if (data.event_image) {
          s3Response = await uploadImageOns3(data.event_image);
        }

        console.log("req here is", s3Response);
        let result = await client.query(
          `INSERT INTO 
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
          [
            data.event_name,
            data.created_user_id,
            timestamp,
            data.start_date,
            data.end_date,
            data.description,
            s3Response.Location,
            data.event_type,
            data.location
          ]
        );
        console.log("result here is", result);
        await client.end();
        callback(null, createResponseObject({ msg: "success" }));
      } else {
        await client.end();
        callback(
          null,
          createErrorResponseObject(
            401,
            "UNAUTHORIZED_USER",
            "User is not authorized"
          )
        );
      }
    } else {
      callback(
        null,
        createErrorResponseObject(
          401,
          "UNAUTHORIZED_USER",
          "User is not authorized"
        )
      );
    }
  } catch (err) {
    console.log("err in lambda", err);
    if (err.name === "ValidationError") {
      callback(
        null,
        createErrorResponseObject(422, "INVALID_DATA", err.details[0].message)
      );
    } else {
      callback(
        null,
        createErrorResponseObject(
          500,
          "INTERNAL_SERVER_ERROR",
          "Could not execute create event function"
        )
      );
    }
  }
};

export default createEvent;

function uploadImageOns3(eventImage) {
  return new Promise(function(res, rej) {
    let key = eventImage.filename;
    let params = {
      Bucket: "spot-me-user-image",
      Key: key,
      Body: eventImage.content,
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
