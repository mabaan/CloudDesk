<h2>CloudDesk</h2>

CloudDesk is a small, demo-ready **serverless IT ticketing platform** built as a **2-day proof of concept** on AWS.
The goal is to demonstrate real cloud engineering skills, not to ship a full product.

This project focuses on authentication, role-based access, serverless APIs, and NoSQL design using AWS-native services. 

* Secure login with user and agent roles
* Serverless REST API with real business logic
* DynamoDB NoSQL data modeling around access patterns
* End-to-end flow from UI to database on AWS

## Tech stack

* **Backend:** Node.js on AWS Lambda
* **Auth:** Amazon Cognito (users and agents)
* **API:** Amazon API Gateway (HTTP API)
* **Database:** Amazon DynamoDB
* **Frontend:** Minimal React UI or plain HTML/JS
* **Infra:** AWS SAM (CDK optional)
* **Hosting:** Amplify Hosting or S3 static site
* **Logs:** Amazon CloudWatch

## Core features

**User**

* Sign in
* Create a support ticket
* View their own tickets

**Agent**

* View OPEN tickets
* Update ticket status (OPEN, IN_PROGRESS, RESOLVED)

Out of scope for this PoC includes attachments, comments, notifications, analytics, and heavy UI polish.

## High-level architecture

Browser UI
→ Cognito (authentication)
→ API Gateway
→ Lambda (Node.js)
→ DynamoDB

## API endpoints

* `POST /tickets` Create a ticket (user)
* `GET /tickets` List my tickets (user)
* `GET /agent/tickets?status=OPEN` List tickets by status (agent)
* `PATCH /agent/tickets/{ticketId}` Update ticket status (agent)

## Local setup (minimal)

* Node.js 18+
* AWS CLI configured
* AWS SAM CLI
* Git

## Demo flow

1. User signs in and creates a ticket
2. User sees ticket with status OPEN
3. Agent signs in and views OPEN tickets
4. Agent updates ticket to RESOLVED
5. User sees updated status
