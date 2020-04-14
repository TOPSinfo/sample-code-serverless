import * as AWS from "aws-sdk";
import dynamodb from "serverless-dynamodb-client";
import {
  createResponseObject,
  createErrorResponseObject,
  deleterequestArray,
  deleteItems,
  getItemsByProjectId,
  getItem,
} from "../../utils/utils";

import { s3Bucket } from "../../utils/config";

const docClient = dynamodb.doc;

const aws = require("aws-sdk");
const s3 = new aws.S3();

const deleteCurrentProject = async (event, context, callback) => {
  try {
    let projectId = decodeURI(event.pathParameters.projectId);
    const bucketName = await s3Bucket(process.env.stage);
    //Fetch project for deleteing from s3
    let project = await getItem(process.env.projectsTable, "id", projectId);
    // Fetch audios, segments, chat msgs and invites of a project.
    let audios = await getItemsByProjectId(process.env.audiosTable, projectId);
    let segments = await getItemsByProjectId(
      process.env.segmentsTable,
      projectId
    );
    // let chatMsgs = await getItemsByProjectId(process.env.chatsTable, projectId);
    let invites = await getItemsByProjectId(
      process.env.invitesTable,
      projectId
    );
    if (audios.Count > 0) {
      for (let i = 0; i < audios.Items.length; i++) {
        const editAudioParams = {
          TableName: process.env.audiosTable,
          Key: { id: audios.Items[i].id },
          UpdateExpression: "REMOVE projectId",
          ReturnValues: "ALL_NEW",
        };
        await docClient.update(editAudioParams).promise();
      }
    }
    let params = { RequestItems: {} };
    let itemsCount = 0;

    if (segments.Count > 0)
      itemsCount = await deleterequestArray(
        segments.Items,
        process.env.segmentsTable,
        itemsCount,
        params
      );
    // if (chatMsgs.Count > 0) itemsCount = await deleterequestArray(chatMsgs.Items, process.env.chatsTable, itemsCount, params);
    if (invites.Count > 0)
      itemsCount = await deleterequestArray(
        invites.Items,
        process.env.invitesTable,
        itemsCount,
        params
      );

    if (project.logo) {
      s3.deleteObject(
        {
          Bucket: bucketName,
          Key: `projectImages/${projectId}/` + project.logo,
        },
        (error, result) => {
          console.log(error, result);
        }
      );
    }

    params.RequestItems[process.env.projectsTable] = [
      {
        DeleteRequest: {
          Key: {
            id: projectId,
          },
        },
      },
    ];
    let operationResult = await deleteItems(params);
    callback(null, createResponseObject(operationResult));
  } catch (err) {
    callback(null, createErrorResponseObject(err, `Couldn't delete project.`));
  }
};

export default deleteCurrentProject;
