# CloudDesk

CloudDesk is a cloud-native IT ticketing platform on AWS. It is fully operational out of the box with synthetic data so you can run the full user and agent flows immediately.

## Architecture

```
+------------+     +---------+     +-------------+     +--------+     +----------+
| Browser UI | --> | Cognito | --> | API Gateway | --> | Lambda | --> | DynamoDB |
+------------+     +---------+     +-------------+     +--------+     +----------+
   (Auth)           (HTTP API)        (Node.js)           (Compute)      (NoSQL)
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js 18+ on AWS Lambda |
| Auth | Amazon Cognito (user & agent groups) |
| API | Amazon API Gateway (HTTP API) |
| Database | Amazon DynamoDB |
| Frontend | React 19 + TypeScript + Vite |
| Infrastructure | AWS SAM |
| Hosting | AWS Amplify Hosting + CloudFront |
| Observability | Amazon CloudWatch |

## Features

- Role-based access for employees and support agents
- Ticket lifecycle: create, list, assign, and update status
- Status workflow: OPEN ? IN_PROGRESS ? RESOLVED ? CLOSED
- Priority, category, timestamps, and owner details on each ticket
- JWT-secured API backed by DynamoDB

## API Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `POST` | `/tickets` | Create a new ticket | User |
| `GET` | `/tickets` | List my tickets | User |
| `GET` | `/agent/tickets?status=OPEN` | List tickets by status | Agent |
| `PATCH` | `/agent/tickets/{ticketId}` | Update ticket status | Agent |

## Prerequisites

- Node.js 18+
- AWS CLI (configured with credentials)
- AWS SAM CLI
- Git

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

3. Run the frontend.

```bash
cd frontend
npm install
npm run dev
```

For detailed AWS setup, see `CloudDesk_Deployment_Guide.pdf`.

## Project Structure

```
CloudDesk/
backend/     # Lambda handlers, SAM template, API
frontend/    # React app
README.md
```

## Frontend Notes

- Routing and role guards live in `frontend/src/App.tsx`
- Auth and ticket data flows live in `frontend/src/contexts/`
- UI shell and ticket cards live in `frontend/src/components/`
- Styling and design tokens live in `frontend/src/index.css`

## Scripts (Frontend)

- `npm run dev` start the Vite dev server
- `npm run build` type check then bundle for production
- `npm run preview` serve the built assets locally
- `npm run lint` run ESLint

## License

MIT

