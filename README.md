# CloudDesk

A demo-ready serverless IT ticketing platform built on AWS. This project demonstrates real cloud engineering skills through authentication, role-based access control, serverless APIs, and NoSQL data modeling using AWS-native services.

## Overview

CloudDesk is a proof-of-concept IT support ticketing system designed to showcase end-to-end AWS serverless architecture—not to ship a full product. The focus is on secure authentication, clean API design, and proper DynamoDB access patterns.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js 18+ on AWS Lambda |
| Auth | Amazon Cognito (user and agent pools) |
| API | Amazon API Gateway (HTTP API) |
| Database | Amazon DynamoDB |
| Frontend | Minimal React UI or plain HTML/JS |
| Infrastructure | AWS SAM (CDK optional) |
| Hosting | Amplify Hosting or S3 static site |
| Logging | Amazon CloudWatch |

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Browser UI │────▶│   Cognito   │────▶│ API Gateway │────▶│   Lambda    │────▶│  DynamoDB   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                    (Authentication)      (HTTP API)         (Node.js)          (NoSQL)
```

## Features

### User Role
- Sign in via Cognito
- Create support tickets
- View their own tickets

### Agent Role
- View tickets filtered by status (e.g., OPEN)
- Update ticket status (OPEN → IN_PROGRESS → RESOLVED)

### Out of Scope
This PoC intentionally excludes: attachments, comments, notifications, analytics, and UI polish.

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

```bash
# Clone the repository
git clone 
cd clouddesk

# Install dependencies
npm install

# Deploy to AWS
sam build
sam deploy --guided
```

## Demo Flow

1. **User signs in** → Authenticates via Cognito
2. **User creates a ticket** → Ticket saved with status `OPEN`
3. **User views their tickets** → Sees the new ticket
4. **Agent signs in** → Authenticates with agent credentials
5. **Agent views OPEN tickets** → Sees the user's ticket
6. **Agent updates ticket** → Changes status to `RESOLVED`
7. **User refreshes** → Sees updated status

## Project Structure

```
clouddesk/
├── src/
│   └── handlers/          # Lambda function handlers
├── template.yaml          # SAM template
├── package.json
└── README.md
```

## License

MIT
