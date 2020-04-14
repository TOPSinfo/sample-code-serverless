import { Client } from "pg";
import jwt from "json-web-token";

export const createResponseObject = res => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", // Required for CORS support to work
      "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
    },
    body: JSON.stringify(res)
  };
};

export const createErrorResponseObject = (error_id, error_name, error_msg) => {
  return {
    statusCode: error_id || 501,
    headers: {
      "Content-Type": "text/plain",
      "Access-Control-Allow-Origin": "*", // Required for CORS support to work
      "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
    },
    body: JSON.stringify({ error_id, error_name, msg: error_msg })
  };
};

export const createLocationResponseObject = res => {
  return {
    statusCode: 285,
    headers: {
      "Content-Type": "text/plain",
      "Access-Control-Allow-Origin": "*", // Required for CORS support to work
      "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
    },
    body: JSON.stringify(res)
  };
};

export const verifyToken = async (client, token, userId) => {
  if (token) {
    let secret = "spotme";
    let user_id;
    await jwt.decode(secret, token, function(
      err,
      decodedPayload,
      decodedHeader
    ) {
      if (err) {
        console.error(err.name, err.message);
      } else {
        console.log("decodedPayload value is", decodedPayload);
        user_id = decodedPayload.request.userId;
      }
    });

    const result = await client.query(
      `SELECT * FROM userstoken WHERE user_id=$1`,
      [userId]
    );
    if (result.rows.length > 0) {
      if (result.rows[0].token === token) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
};
