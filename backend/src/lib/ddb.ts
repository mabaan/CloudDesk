import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

let cached: DynamoDBDocumentClient | null = null;

export function getDdb() {
  if (cached) return cached;

  const client = new DynamoDBClient({});
  cached = DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true }
  });
  return cached;
}

export function getTableName(): string {
  const name = process.env.TABLE_NAME;
  if (!name) {
    throw new Error("Missing TABLE_NAME");
  }
  return name;
}
