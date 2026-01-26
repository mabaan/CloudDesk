
# CloudDesk

CloudDesk is a modern IT support ticketing UI built with React and Vite. It represents the front end of the two day serverless proof of concept described in AWS CloudDesk-1.pdf. The current build runs entirely in the browser with mock authentication and ticket data stored in localStorage so that you can demo flows without standing up back end services.

## Key features
- Role based entry for employees and support agents with separate navigation and dashboards
- Ticket lifecycle demo: create, list, search, assign to self (agent), and update status (open, in_progress, resolved, closed)
- Styled ticket cards with priority, category, timestamps, comments, and inline status controls
- Animated glassmorphism UI with Lucide icons, gradients, and responsive layouts
- Local persistence: auth state and tickets stored in `localStorage` (keys `clouddesk_auth` and `clouddesk_tickets`) with seeded demo tickets

## Current architecture (front end)
- React 19, TypeScript, Vite, React Router 7
- Component highlights:
  - `src/App.tsx` wires routes and guards by role (user vs agent)
  - `src/contexts/AuthContext.tsx` provides mock login, logout, and persisted user session
  - `src/contexts/TicketContext.tsx` seeds sample tickets, supports create, assign, status update, and comments, and persists to localStorage
  - `src/components/Layout.tsx` renders the shell (sidebar, top bar, background animation)
  - `src/components/TicketCard.tsx` shows ticket details with expandable body and agent actions
  - Pages in `src/pages` deliver the main flows: login, user dashboard, new ticket, my tickets, agent dashboard, all tickets
- Styling lives in `src/index.css` with design tokens, glass surfaces, and animation helpers loaded by `index.html` via Google Fonts (Inter and Outfit)

## AWS Hosting
- Delivery: Amplify Hosting , CloudFront
- Auth: Cognito User Pool with groups `users` and `agents`
- API: API Gateway HTTP API secured with JWT authorizer
- Compute: Node.js Lambdas for ticket operations
- Data: DynamoDB Tickets table (PK `ticketId`) plus GSIs for user tickets (`userId` SK `createdAt`) and status queries (`status` SK `createdAt`)
- Minimal endpoints: POST /tickets, GET /tickets (user scope), GET /agent/tickets?status=OPEN, PATCH /agent/tickets/{ticketId}
- Demo script: user signs in, creates a ticket, agent views and updates status, user sees the change

## Getting started (local demo)
Prerequisites: Node.js 18+, npm

1) Install dependencies  
   `npm install`
2) Run the dev server  
   `npm run dev`  
   Open the printed localhost URL.
3) Create a production build  
   `npm run build`
4) Preview the production build  
   `npm run preview`

## How to use the demo
- Sign in: open `/`, choose Employee or Support Agent, enter any email and password (validation only checks that both fields are filled), then submit.
- Employee flow: land on Dashboard, review stats, create a ticket via New Ticket, and browse My Tickets with search.
- Agent flow: land on Agent Dashboard with stats, search and filter the queue, assign a ticket to yourself, and update its status; All Tickets provides the same controls across the full list.
- Data reset: clear `localStorage` keys `clouddesk_auth` and `clouddesk_tickets` in your browser to return to the seeded state.

## Project scripts
- `npm run dev` start the Vite dev server
- `npm run build` type check then bundle for production
- `npm run preview` serve the built assets locally
- `npm run lint` run ESLint

## Folder layout
- `src/main.tsx` bootstraps React and global styles
- `src/App.tsx` configures routing and guards
- `src/contexts/` auth and ticket providers with localStorage persistence and sample data
- `src/components/` shared UI elements (layout, animated background, ticket cards)
- `src/pages/` route level screens for login, dashboards, ticket creation, and listings
- `src/types/` TypeScript types for users, tickets, and stats
- `src/index.css` design system tokens, utilities, and component styles

## Notes and next steps
- The current build is a front end only demo that mirrors the flows in the AWS PoC document but uses browser storage instead of Cognito, API Gateway, Lambda, and DynamoDB.
- To align with the planned AWS stack, replace the mock contexts with API calls to the Lambda endpoints, wire Cognito tokens into requests, and back ticket data with the DynamoDB table described above.
