import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { GetCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { requireAgent, authErrorToResponse } from "../lib/auth";
import { getDdb, getTableName } from "../lib/ddb";
import { errorResponse, jsonResponse } from "../lib/response";
import { isTicketStatus, validateStatusTransition, TicketStatus } from "../lib/validate";

type TicketMeta = {
  PK: string;
  SK: string;
  ticketId: string;
  ownerSub: string;
  status: TicketStatus;
  createdAt: string;
  title: string;
  description: string;
};

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

  const ticketId = event.pathParameters?.ticketId;
  if (!ticketId) {
    return errorResponse(400, "BadRequest", "Missing ticketId path parameter", requestId);
  }

  let body: any = null;
  try {
    body = event.body ? JSON.parse(event.body) : null;
  } catch {
    return errorResponse(400, "BadRequest", "Invalid JSON body", requestId);
  }

  const nextStatusRaw = body?.status;
  if (!isTicketStatus(nextStatusRaw)) {
    return errorResponse(
      400,
      "BadRequest",
      "Missing or invalid status. Use OPEN, IN_PROGRESS, or RESOLVED",
      requestId
    );
  }

  const tableName = getTableName();
  const ddb = getDdb();

  try {
    console.log(
      JSON.stringify({
        requestId,
        route: "PATCH /agent/tickets/{ticketId}",
        userSub: auth.userSub,
        ticketId,
        nextStatus: nextStatusRaw
      })
    );

    const metaKey = { PK: `TICKET#${ticketId}`, SK: "META" };

    const metaRes = await ddb.send(
      new GetCommand({
        TableName: tableName,
        Key: metaKey
      })
    );

    const meta = metaRes.Item as TicketMeta | undefined;
    if (!meta) {
      return errorResponse(404, "NotFound", "Ticket not found", requestId);
    }

    const transitionErr = validateStatusTransition(meta.status, nextStatusRaw);
    if (transitionErr) {
      return errorResponse(400, "BadRequest", transitionErr, requestId);
    }

    const updatedAt = new Date().toISOString();

    const userLookupKey = {
      PK: `USER#${meta.ownerSub}`,
      SK: `TICKET#${meta.createdAt}#${ticketId}`
    };

    await ddb.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Update: {
              TableName: tableName,
              Key: metaKey,
              UpdateExpression:
                "SET #s = :s, GSI1PK = :gpk, GSI1SK = :gsk, updatedAt = :u",
              ConditionExpression: "#s = :expected",
              ExpressionAttributeNames: {
                "#s": "status"
              },
              ExpressionAttributeValues: {
                ":s": nextStatusRaw,
                ":expected": meta.status,
                ":gpk": `STATUS#${nextStatusRaw}`,
                ":gsk": `CREATED#${meta.createdAt}#TICKET#${ticketId}`,
                ":u": updatedAt
              }
            }
          },
          {
            Update: {
              TableName: tableName,
              Key: userLookupKey,
              UpdateExpression: "SET #s = :s",
              ConditionExpression: "attribute_exists(PK)",
              ExpressionAttributeNames: {
                "#s": "status"
              },
              ExpressionAttributeValues: {
                ":s": nextStatusRaw
              }
            }
          }
        ]
      })
    );

    return jsonResponse(200, { ticketId, status: nextStatusRaw, updatedAt });
  } catch (e: any) {
    console.log(
      JSON.stringify({
        requestId,
        route: "PATCH /agent/tickets/{ticketId}",
        userSub: auth.userSub,
        ticketId,
        error: e?.name || "UnknownError",
        message: e?.message || String(e)
      })
    );

    const msg = e?.name === "TransactionCanceledException"
      ? "Status update rejected (possible concurrent update)"
      : "Failed to update ticket status";

    return errorResponse(500, "ServerError", msg, requestId);
  }
};
