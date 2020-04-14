import * as AWS from "aws-sdk";
import dynamodb from "serverless-dynamodb-client";
import _ from "lodash";
import {
  createResponseObject,
  createErrorResponseObject,
} from "../../utils/utils";

const docClient = dynamodb.doc;

const getRecentProjects = async (event, context, callback) => {
  try {
    const data = JSON.parse(event.body);
    let projectId = data.projectId;
    let userId = data.userId;

    let recentProjects = [];
    if (userId && projectId) {
      // get recent projects
      let getRecentProjects = {
        TableName: process.env.projectsTable,
        ProjectionExpression: ["id", "logo", "projectName", "lastModifiedAt"],
        FilterExpression: "(userId = :userId OR contains(#users, :userId))",
        ExpressionAttributeNames: { "#users": "userIds" },
        ExpressionAttributeValues: { ":userId": userId },
      };

      let userProjects = await docClient.scan(getRecentProjects).promise();

      let arr = _.orderBy(userProjects.Items, "lastModifiedAt", "desc");

      recentProjects = arr.filter((project) => project.id != projectId);
      // to fetch most recent 4 projects
      if (recentProjects.length > 3)
        recentProjects = recentProjects.slice(0, 3);

      if (recentProjects.length) {
        /* NOTE: We can not use forEach or map here, it will throw as error as it doesn't expect async code inside it */
        for (const project of recentProjects) {
          let getUnreadMsgParams = {
            TableName: process.env.chatsTable,
            FilterExpression:
              "not contains (#n,:value) AND projectId = :projectId",
            ExpressionAttributeNames: { "#n": "readBy" },
            ExpressionAttributeValues: {
              ":value": userId,
              ":projectId": project.id,
            },
          };
          let unreadChats = await docClient.scan(getUnreadMsgParams).promise();
          project.unreadChatCount = unreadChats.Count;
        }
      }
    }

    let result = { recentProjects };

    callback(null, createResponseObject(result));
  } catch (err) {
    callback(
      null,
      createErrorResponseObject(err, `Couldn't find recent projects`)
    );
  }
};

export default getRecentProjects;
