import type { APIGatewayProxyEventV2 } from "aws-lambda";

export class AuthError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}

type APIGatewayProxyEventV2WithAuth = APIGatewayProxyEventV2 & {
  requestContext: APIGatewayProxyEventV2["requestContext"] & {
    authorizer?: any;
  };
};

type AuthContext = {
  userSub: string;
  email?: string;
  groups: string[];
};

export function requireAuthenticated(
  event: APIGatewayProxyEventV2WithAuth
): AuthContext {
  const authorizer = event.requestContext.authorizer;

  if (!authorizer) {
    throw new AuthError(401, "Unauthorized", "Missing authorizer");
  }

  // HTTP API v2 (Cognito)
  const jwtClaims = authorizer.jwt?.claims;

  // REST API fallback (older)
  const legacyClaims = authorizer.claims;

  const claims = jwtClaims || legacyClaims;

  if (!claims || !claims.sub) {
    throw new AuthError(401, "Unauthorized", "Invalid token claims");
  }

  const rawGroups = claims["cognito:groups"];

  let groups: string[] = [];
  if (Array.isArray(rawGroups)) {
    groups = rawGroups as string[];
  } else if (typeof rawGroups === "string") {
    const trimmed = rawGroups.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      groups = trimmed
        .slice(1, -1)
        .split(",")
        .map((g) => g.replace(/['"]/g, "").trim())
        .filter(Boolean);
    } else {
      groups = [trimmed];
    }
  }

  return {
    userSub: claims.sub,
    email: claims.email,
    groups
  };
}

export function requireAgent(
  event: APIGatewayProxyEventV2WithAuth
): AuthContext {
  const auth = requireAuthenticated(event);

  const inAgents = auth.groups.some((g) => g.toLowerCase() === "agents");

  if (!inAgents) {
    throw new AuthError(403, "Forbidden", "Agent access required");
  }

  return auth;
}

export function authErrorToResponse(
  err: any,
  requestId: string
) {
  if (err instanceof AuthError) {
    return {
      statusCode: err.statusCode,
      body: JSON.stringify({
        error: err.code,
        message: err.message,
        requestId
      })
    };
  }

  return {
    statusCode: 401,
    body: JSON.stringify({
      error: "Unauthorized",
      message: "Authentication failed",
      requestId
    })
  };
}
