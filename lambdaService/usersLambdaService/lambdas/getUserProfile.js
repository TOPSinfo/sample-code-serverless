import {
  createResponseObject,
  createErrorResponseObject,
  verifyToken,
} from "../../utils/utils";
import { Client } from "pg";
import { dbConfig, messages, s3BucketUrl } from "../../utils/config";
import { getUser } from "../userService";

const getUserProfile = async (event, context, callback) => {
  try {
    const user_id = decodeURI(event.pathParameters.userId);

    const token = decodeURI(event.headers.Authorization);

    let config = await dbConfig(process.env.stage);
    const client = new Client(config);
    await client.connect();

    // if(token){
    let userVerified = await verifyToken(client, token, user_id);

    if (userVerified) {
      const users = await getUser(client, user_id);
      if (users.rows.length > 0) {
        await client.end();
        const response = {
          user_id: users.rows[0].user_id,
          username: users.rows[0].username,
          email: users.rows[0].email,
          phone_no: users.rows[0].phone_no,
          user_image: users.rows[0].user_image
            ? `${s3BucketUrl(process.env.stage)}${users.rows[0]["user_image"]}`
            : "",
        };
        let responseResult = {
          status: true,
          msg: messages.getUserProfileSuccess,
          user: response,
        };
        callback(null, createResponseObject(responseResult));
      } else {
        await client.end();
        callback(
          null,
          createErrorResponseObject(401, "INVALID_ID", messages.invalidUserId)
        );
      }
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
    console.log("err in lambda", err);
    callback(
      null,
      createErrorResponseObject(
        500,
        "INTERNAL_SERVER_ERROR",
        "Could not execute auth function"
      )
    );
  }
};

export default getUserProfile;
