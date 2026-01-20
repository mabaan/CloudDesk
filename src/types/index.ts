// User Types
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'agent';
    department?: string;
    avatar?: string;
    createdAt: string;
}

// Ticket Types
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketCategory = 'hardware' | 'software' | 'network' | 'access' | 'other';

export interface Ticket {
    id: string;
    subject: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    category: TicketCategory;
    createdBy: string;
    createdByName: string;
    assignedTo?: string;
    assignedToName?: string;
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
    comments: TicketComment[];
}

export interface TicketComment {
    id: string;
    ticketId: string;
    authorId: string;
    authorName: string;
    authorRole: 'user' | 'agent';
    content: string;
    createdAt: string;
}

// Form Types
export interface LoginFormData {
    email: string;
    password: string;
    role: 'user' | 'agent';
}

export interface TicketFormData {
    subject: string;
    description: string;
    priority: TicketPriority;
    category: TicketCategory;
}

// Stats Types
export interface TicketStats {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
}

export interface AgentStats {
    assigned: number;
    resolvedToday: number;
    avgResolutionTime: string;
    pendingReview: number;
}
