# CloudDesk

CloudDesk is a cloud-native IT ticketing platform built on AWS for handling internal support requests at scale. It provides a clean employee experience for submitting and tracking issues, and an agent experience for triage and workflow management.

## Architecture

```
+------------+     +---------+     +-------------+     +--------+     +----------+
| Browser UI | --> | Cognito | --> | API Gateway | --> | Lambda | --> | DynamoDB |
+------------+     +---------+     +-------------+     +--------+     +----------+
   (Auth)           (HTTP API)        (Node.js)           (Compute)      (NoSQL)
```

CloudDesk uses a serverless backend with Cognito for authentication, HTTP APIs for ticket operations, and DynamoDB for storage.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js 18+ on AWS Lambda |
| Auth | Amazon Cognito (user and agent groups) |
| API | Amazon API Gateway (HTTP API) |
| Database | Amazon DynamoDB |
| Frontend | React 19 + TypeScript + Vite |
| Infrastructure | AWS SAM |
| Hosting | AWS Amplify Hosting + CloudFront |
| Observability | Amazon CloudWatch |

## Capabilities

### Employee Experience
- Sign in with Cognito
- Create support tickets
- View ticket history and current status

### Agent Experience
- View tickets by status
- Move tickets through the workflow
- See priority, category, timestamps, and requester details

## Ticket Lifecycle

Status flow: OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED.

## API Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `POST` | `/tickets` | Create a new ticket | User |
| `GET` | `/tickets` | List my tickets | User |
| `GET` | `/agent/tickets?status=OPEN` | List tickets by status | Agent |
| `PATCH` | `/agent/tickets/{ticketId}` | Update ticket status | Agent |

## Security and Auth

- Cognito User Pool with an `Agents` group for agent access.
- API Gateway HTTP API uses a Cognito JWT authorizer.
- Frontend uses Amplify Auth and sends `Authorization: Bearer <token>` to the API.
- Add users to the `Agents` group in Cognito to grant agent permissions.

## Data Model

- Single DynamoDB table with `PK` and `SK` keys.
- Ticket metadata stored as `PK = TICKET#<id>`, `SK = META`.
- User lookup items stored as `PK = USER#<sub>`, `SK = TICKET#<createdAt>#<id>`.
- `GSI1` indexes ticket status for agent queues.

## Getting Started

1. Clone the repo.

```bash
git clone <your-repo-url>
cd CloudDesk
```

2. Deploy the backend.

```bash
cd backend
npm install
sam build
sam deploy --guided
```

Capture the outputs from the deploy (API base URL and Cognito IDs).

3. Configure the frontend environment.

Create `frontend/.env.local` with values from the SAM outputs:

```bash
VITE_API_BASE_URL=https://<api-id>.execute-api.<region>.amazonaws.com/<stage>
VITE_COGNITO_USER_POOL_ID=<user-pool-id>
VITE_COGNITO_USER_POOL_CLIENT_ID=<user-pool-client-id>
```

4. Run the frontend.

```bash
cd frontend
npm install
npm run dev
```

For detailed AWS setup, see `CloudDesk_Deployment_Guide.pdf`.

## Configuration

Backend parameters (`backend/template.yaml`):
- `StageName` deployment stage (default `dev`).
- `CorsAllowedOrigin` allowed origin for local dev (default `http://localhost:5173`).
- `LogLevel` Lambda log level (default `INFO`).

Frontend variables (`frontend/.env.local`):
- `VITE_API_BASE_URL`
- `VITE_COGNITO_USER_POOL_ID`
- `VITE_COGNITO_USER_POOL_CLIENT_ID`

## Project Structure

```
CloudDesk/
backend/     # Lambda handlers, SAM template, API
frontend/    # React app
README.md
```

## Scripts

Backend scripts:
- `npm run lint` type-check backend
- `npm run build` placeholder (SAM uses esbuild during `sam build`)
- `npm test` placeholder

Frontend scripts:
- `npm run dev` start the Vite dev server
- `npm run build` type check then bundle for production
- `npm run preview` serve the built assets locally
- `npm run lint` run ESLint

## License

MIT
