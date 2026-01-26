import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { requireAuthenticated, authErrorToResponse } from "../lib/auth";
import { getDdb, getTableName } from "../lib/ddb";
import { errorResponse, jsonResponse } from "../lib/response";
import { validateDescription, validateTitle } from "../lib/validate";

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const requestId = event.requestContext.requestId;

  let auth;
  try {
    auth = requireAuthenticated(event);
  } catch (e) {
    return authErrorToResponse(e, requestId);
  }

  let body: any = null;
  try {
    body = event.body ? JSON.parse(event.body) : null;
  } catch {
    return errorResponse(400, "BadRequest", "Invalid JSON body", requestId);
  }

  const titleErr = validateTitle(body?.title);
  if (titleErr) return errorResponse(400, "BadRequest", titleErr, requestId);

  const descErr = validateDescription(body?.description);
  if (descErr) return errorResponse(400, "BadRequest", descErr, requestId);

  const ticketId = uuidv4();
  const createdAt = new Date().toISOString();
  const status = "OPEN";

  const tableName = getTableName();
  const ddb = getDdb();

  const ticketMeta = {
    PK: `TICKET#${ticketId}`,
    SK: "META",
    ticketId,
    ownerSub: auth.userSub,
    status,
    createdAt,
    title: body.title,
    description: body.description,
    GSI1PK: `STATUS#${status}`,
    GSI1SK: `CREATED#${createdAt}#TICKET#${ticketId}`
  };

  const userLookup = {
    PK: `USER#${auth.userSub}`,
    SK: `TICKET#${createdAt}#${ticketId}`,
    ticketId,
    status,
    createdAt,
    title: body.title
  };

  try {
    console.log(
      JSON.stringify({
        requestId,
        route: "POST /tickets",
        userSub: auth.userSub
      })
    );

    await ddb.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: tableName,
              Item: ticketMeta,
              ConditionExpression: "attribute_not_exists(PK)"
            }
          },
          {
            Put: {
              TableName: tableName,
              Item: userLookup,
              ConditionExpression: "attribute_not_exists(PK)"
            }
          }
        ]
      })
    );

    return jsonResponse(201, { ticketId, status, createdAt });
  } catch (e: any) {
    console.log(
      JSON.stringify({
        requestId,
        route: "POST /tickets",
        userSub: auth.userSub,
        error: e?.name || "UnknownError",
        message: e?.message || String(e)
      })
    );
    return errorResponse(500, "ServerError", "Failed to create ticket", requestId);
  }
};
