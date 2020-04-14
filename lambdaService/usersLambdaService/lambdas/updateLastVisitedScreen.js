import {
  createResponseObject,
  createErrorResponseObject,
  verifyToken,
} from "../../utils/utils";
import { Client } from "pg";
import { dbConfig, messages } from "../../utils/config";
import { updateVisitedScreen } from "../userService";

const updateLastVisitedScreen = async (event, context, callback) => {
  try {
    const token = decodeURI(event.headers.Authorization);
    let data = JSON.parse(event.body);

    let config = await dbConfig(process.env.stage);
    const client = new Client(config);
    await client.connect();

    // if (token) {
    let userVerified = await verifyToken(client, token, data.user_id);

    if (userVerified) {
      const lastScreen = await updateVisitedScreen(client, data);

      await client.end();
      let response = {
        status: true,
        msg: messages.updateLastVisitedScreen,
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
    console.log("err in lambda", err);
    callback(
      null,
      createErrorResponseObject(
        500,
        "INTERNAL_SERVER_ERROR",
        "Could not execute Update last visited screen function"
      )
    );
  }
};

export default updateLastVisitedScreen;
