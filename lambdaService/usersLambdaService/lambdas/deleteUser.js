import {
  createResponseObject,
  createErrorResponseObject,
  verifyToken,
} from "../../utils/utils";
import { Client } from "pg";
import { dbConfig, s3Access, messages, s3Bucket } from "../../utils/config";
const aws = require("aws-sdk");
import { userDelete } from "../userService";

const deleteUser = async (event, context, callback) => {
  try {
    const token = decodeURI(event.headers.Authorization);
    const user_id = decodeURI(event.pathParameters.userId);
    let config = await dbConfig(process.env.stage);
    const client = new Client(config);

    await client.connect();

    let userVerified = await verifyToken(client, token, user_id);

    if (userVerified) {
      const deleteUser = await userDelete(client, user_id);

      let response = {
        status: true,
        msg: messages.deleteUserSuccess,
      };

      await client.end();
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
    console.log("error here is", err);
    callback(
      null,
      createErrorResponseObject(
        500,
        "INTERNAL_SERVER_ERROR",
        "Could not execute delete event function"
      )
    );
  }
};

export default deleteUser;
