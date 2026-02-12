import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { requireAgent, authErrorToResponse } from "../lib/auth";
import { getDdb, getTableName } from "../lib/ddb";
import { errorResponse, jsonResponse } from "../lib/response";
import { normalizeTicketStatus, toClientStatus } from "../lib/validate";

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const requestId = event.requestContext.requestId;

  let auth;
  try {
    auth = requireAgent(event);
  } catch (e) {
    return authErrorToResponse(e, requestId);
  }

  const statusRaw = event.queryStringParameters?.status;
  const normalizedStatus = normalizeTicketStatus(statusRaw);
  if (!normalizedStatus) {
    return errorResponse(
      400,
      "BadRequest",
      "Missing or invalid status. Use open, in_progress, or resolved",
      requestId
    );
  }

  const tableName = getTableName();
  const ddb = getDdb();
  const gsiName = process.env.GSI1_NAME || "GSI1";

  try {
    console.log(
      JSON.stringify({
        requestId,
        route: "GET /agent/tickets",
        userSub: auth.userSub,
        status: statusRaw,
        normalizedStatus
      })
    );

    const res = await ddb.send(
      new QueryCommand({
        TableName: tableName,
        IndexName: gsiName,
        KeyConditionExpression: "GSI1PK = :gpk",
        ExpressionAttributeValues: {
          ":gpk": `STATUS#${normalizedStatus}`
        },
        ScanIndexForward: false
      })
    );

    const tickets = (res.Items || []).map((x) => ({
      ticketId: x.ticketId,
      ownerSub: x.ownerSub,
      status: toClientStatus(normalizeTicketStatus(x.status) ?? normalizedStatus),
      createdAt: x.createdAt,
      updatedAt: x.updatedAt || x.createdAt,
      title: x.title,
      description: x.description,
      priority: x.priority,
      category: x.category
    }));

    return jsonResponse(200, { tickets });
  } catch (e: any) {
    console.log(
      JSON.stringify({
        requestId,
        route: "GET /agent/tickets",
        userSub: auth.userSub,
        error: e?.name || "UnknownError",
        message: e?.message || String(e)
      })
    );
    return errorResponse(500, "ServerError", "Failed to list tickets by status", requestId);
  }
};
