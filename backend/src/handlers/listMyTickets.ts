import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { requireAuthenticated, authErrorToResponse } from "../lib/auth";
import { getDdb, getTableName } from "../lib/ddb";
import { errorResponse, jsonResponse } from "../lib/response";
import { normalizeTicketStatus, toClientStatus } from "../lib/validate";

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

  const tableName = getTableName();
  const ddb = getDdb();

  try {
    console.log(
      JSON.stringify({
        requestId,
        route: "GET /tickets",
        userSub: auth.userSub
      })
    );

    const res = await ddb.send(
      new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
        ExpressionAttributeValues: {
          ":pk": `USER#${auth.userSub}`,
          ":skPrefix": "TICKET#"
        },
        ScanIndexForward: false
      })
    );

    const items = (res.Items || []).map((x) => {
      const status = normalizeTicketStatus(x.status) ?? "OPEN";
      return {
        ticketId: x.ticketId,
        status: toClientStatus(status),
        createdAt: x.createdAt,
        updatedAt: x.updatedAt || x.createdAt,
        title: x.title,
        description: x.description,
        priority: x.priority,
        category: x.category,
        ownerSub: auth.userSub
      };
    });

    return jsonResponse(200, { tickets: items });
  } catch (e: any) {
    console.log(
      JSON.stringify({
        requestId,
        route: "GET /tickets",
        userSub: auth.userSub,
        error: e?.name || "UnknownError",
        message: e?.message || String(e)
      })
    );
    return errorResponse(500, "ServerError", "Failed to list tickets", requestId);
  }
};
