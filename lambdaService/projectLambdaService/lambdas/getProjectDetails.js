import dynamodb from "serverless-dynamodb-client";
import {
  createResponseObject,
  createErrorResponseObject,
} from "../../utils/utils";

const docClient = dynamodb.doc;

const getProjectDetails = async (event, context, callback) => {
  try {
    let id = decodeURI(event.pathParameters.projectId);
    let getProjectParams = {
      TableName: process.env.projectsTable,
      Key: { id },
    };

    let currentProject = await docClient.get(getProjectParams).promise();
    callback(
      null,
      createResponseObject({ currentProject: [currentProject.Item] })
    );
  } catch (err) {
    callback(
      null,
      createErrorResponseObject(err, `Couldn't find current project`)
    );
  }
};

export default getProjectDetails;
