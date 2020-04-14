import {
  createResponseObject,
  createErrorResponseObject,
  verifyToken,
} from "../../utils/utils";
import { Client } from "pg";
import Multipart from "lambda-multipart-parser";
import Joi from "joi";
import {
  dbConfig,
  s3Access,
  messages,
  s3Bucket,
  s3BucketUrl,
} from "../../utils/config";

import { getUser } from "../userService";

const aws = require("aws-sdk");
const s3 = new aws.S3(s3Access);

const schema = Joi.object().keys({
  user_id: Joi.required(),
  username: Joi.string().required(),
  email: Joi.string(),
  created_on: Joi.date(),
  last_login: Joi.date(),
  user_image: Joi.object(),
  device_type: Joi.string().required(),
  device_id: Joi.string().required(),
  device_name: Joi.string().required(),
  isImageDelete: Joi.boolean(),
});

const updateUserProfile = async (event, context, callback) => {
  try {
    context.callbackWaitsForEmptyEventLoop = false;
    const token = decodeURI(event.headers.Authorization);
    const data = await Multipart.parse(event);

    if (data.files) data.user_image = data.files[0];
    delete data.files;

    let validation = await Joi.validate(data, schema);

    let config = await dbConfig(process.env.stage);
    const client = new Client(config);
    await client.connect();

    // if(token){
    let userVerified = await verifyToken(client, token, data.user_id);

    if (userVerified) {
      let updateArray = [
        data.user_id,
        data.device_id,
        data.device_type,
        data.device_name,
      ];

      const userDetail = await getUser(client, data.user_id);

      let s3RemoveImageRes;

      let query = `UPDATE users SET device_id=($2), device_type=($3), device_name=($4)`;

      let queryClause = "WHERE user_id=($1) RETURNING *";

      if ("user_image" in data) {
        let s3Response;
        if (data.user_image) {
          s3Response = await uploadImageOns3(data.user_image);
          deleteImage();
          updateArray.push(s3Response.Key);
          query += ` ,user_image=($${updateArray.length})`;
        } else if (data.isImageDelete == "true") {
          deleteImage();
          updateArray.push("");
          query += ` ,user_image=($${updateArray.length})`;
        }
      }

      async function deleteImage() {
        if (userDetail && userDetail.rows[0].user_image) {
          s3RemoveImageRes = await deleteImageFroms3(
            userDetail.rows[0].user_image
          );
        }
      }

      if ("username" in data) {
        updateArray.push(data.username);
        query += ` ,username=($${updateArray.length})`;
      }
      if ("email" in data) {
        updateArray.push(data.email);
        query += ` ,email=($${updateArray.length})`;
      }

      query += " " + queryClause;

      const user = await client.query(query, updateArray);

      user.rows[0]["user_image"] = user.rows[0]["user_image"]
        ? `${s3BucketUrl(process.env.stage)}${user.rows[0]["user_image"]}`
        : "";

      await client.end();

      let response = {
        status: true,
        msg: messages.updateUserSuccess,
        user: user.rows[0],
      };

      callback(null, createResponseObject(response));
    } else {
      await client.end();
      callback(
        null,
        createErrorResponseObject(
          401,
          "UNAUTHORIZED_USER",
          messages.unAuthorizedUser
        )
      );
    }
  } catch (err) {
    if (err.name === "error") {
      callback(null, createErrorResponseObject(422, err.name, err.detail));
    } else if (err.name === "ValidationError") {
      callback(
        null,
        createErrorResponseObject(422, err.name, err.details[0].message)
      );
    } else {
      callback(
        null,
        createErrorResponseObject(
          500,
          "INTERNAL_SERVER_ERROR",
          "Could not execute update profile function"
        )
      );
    }
  }
};

export default updateUserProfile;

function uploadImageOns3(userImage) {
  return new Promise(function (res, rej) {
    let timestamp = new Date().getTime();
    let key = `${timestamp}_${userImage.filename}`;
    let bucketName = s3Bucket(process.env.stage);

    let params = {
      Bucket: bucketName,
      Key: key,
      Body: userImage.content,
      ACL: "public-read",
    };
    s3.upload(params, function (err, data) {
      if (err) {
        rej(err);
      }
      res(data);
    });
  });
}

function deleteImageFroms3(key) {
  return new Promise(function (resolve, reject) {
    let bucketName = s3Bucket(process.env.stage);
    let params = {
      Bucket: bucketName,
      Key: key,
    };
    s3.deleteObject(params, function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}
