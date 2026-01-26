export function jsonResponse(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  };
}

export function errorResponse(
  statusCode: number,
  error: string,
  message: string,
  requestId?: string
) {
  return jsonResponse(statusCode, {
    error,
    message,
    requestId: requestId || null
  });
}
