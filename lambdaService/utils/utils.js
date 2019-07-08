export const createResponseObject = res => {
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
        },
        body: JSON.stringify(res)
    }
};


export const createErrorResponseObject = (error_id, error_name, error_msg) => {
    return {
        statusCode: error_id || 501,
        headers: {
            "Content-Type": "text/plain",
            "Access-Control-Allow-Origin": "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
        },
        body: JSON.stringify({ error_id, error_name, error_msg })
    }
}