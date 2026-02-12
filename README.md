# CloudDesk

<<<<<<< HEAD
CloudDesk is a cloud-native IT ticketing platform on AWS. It is fully operational out of the box with synthetic data so you can run the full user and agent flows immediately.
=======
A demo-ready serverless IT ticketing platform built on AWS. This project demonstrates cloud engineering skills through authentication, role-based access control, serverless APIs, and NoSQL data modeling using AWS-native services.
>>>>>>> fee75c8d1ac8f3c6288cae43bb48861c955a3878

## Architecture

<<<<<<< HEAD
```
+------------+     +---------+     +-------------+     +--------+     +----------+
| Browser UI | --> | Cognito | --> | API Gateway | --> | Lambda | --> | DynamoDB |
+------------+     +---------+     +-------------+     +--------+     +----------+
   (Auth)           (HTTP API)        (Node.js)           (Compute)      (NoSQL)
```
=======
CloudDesk is a IT support ticketing system designed to showcase end-to-end AWS serverless architecture. The focus is on secure authentication, clean API design, and proper DynamoDB access patterns.
>>>>>>> fee75c8d1ac8f3c6288cae43bb48861c955a3878

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

<<<<<<< HEAD
- Role-based access for employees and support agents
- Ticket lifecycle: create, list, assign, and update status
- Status workflow: OPEN ? IN_PROGRESS ? RESOLVED ? CLOSED
- Priority, category, timestamps, and owner details on each ticket
- JWT-secured API backed by DynamoDB
=======
### User Role
- Sign in via Cognito
- Create support tickets
- View their own tickets

### Agent Role
- View tickets filtered by status (e.g., OPEN)
- Update ticket status (OPEN → IN_PROGRESS → RESOLVED)
>>>>>>> fee75c8d1ac8f3c6288cae43bb48861c955a3878

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

<<<<<<< HEAD
## License

MIT

=======
## Folder layout
- `src/main.tsx` bootstraps React and global styles
- `src/App.tsx` configures routing and guards
- `src/contexts/` auth and ticket providers with localStorage persistence and sample data
- `src/components/` shared UI elements (layout, animated background, ticket cards)
- `src/pages/` route level screens for login, dashboards, ticket creation, and listings
- `src/types/` TypeScript types for users, tickets, and stats
- `src/index.css` design system tokens, utilities, and component styles
>>>>>>> fee75c8d1ac8f3c6288cae43bb48861c955a3878
