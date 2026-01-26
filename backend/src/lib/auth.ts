import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { errorResponse } from "./response";

export type AuthContext = {
  userSub: string;
  groups: string[];
};

function normalizeGroups(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((x) => String(x));
  if (typeof raw === "string") return [raw];
  return [String(raw)];
}

export function requireAuthenticated(event: APIGatewayProxyEventV2): AuthContext {
  const claims = (event.requestContext as any)?.authorizer?.jwt?.claims;
  const sub = claims?.sub;
  if (!sub || typeof sub !== "string") {
    throw new Error("UNAUTHENTICATED");
  }

  const groupsRaw = claims?.["cognito:groups"];
  const groups = normalizeGroups(groupsRaw);

  return { userSub: sub, groups };
}

export function requireAgent(event: APIGatewayProxyEventV2): AuthContext {
  const ctx = requireAuthenticated(event);
  if (!ctx.groups.includes("Agents")) {
    throw new Error("FORBIDDEN_AGENT_ONLY");
  }
  return ctx;
}

export function authErrorToResponse(err: unknown, requestId?: string) {
  const msg = err instanceof Error ? err.message : String(err);

  if (msg === "UNAUTHENTICATED") {
    return errorResponse(401, "Unauthorized", "Missing or invalid auth context", requestId);
  }
  if (msg === "FORBIDDEN_AGENT_ONLY") {
    return errorResponse(403, "Forbidden", "Agent role required", requestId);
  }
  return errorResponse(401, "Unauthorized", "Unauthorized", requestId);
}
