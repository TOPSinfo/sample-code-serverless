const spotme = async (event, context, callback) => {
    let response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
        }
    };
    response.body = JSON.stringify({ message: 'Welcome to Spot me' });
    callback(null, response);
};

export default spotme;
