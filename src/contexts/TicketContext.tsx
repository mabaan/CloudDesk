import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Ticket, TicketFormData, TicketStatus, TicketComment } from '../types';
import { useAuth } from './AuthContext';

interface TicketContextType {
    tickets: Ticket[];
    isLoading: boolean;
    createTicket: (data: TicketFormData) => Promise<Ticket>;
    updateTicketStatus: (ticketId: string, status: TicketStatus) => Promise<void>;
    assignTicket: (ticketId: string, agentId: string, agentName: string) => Promise<void>;
    addComment: (ticketId: string, content: string) => Promise<void>;
    getTicketById: (ticketId: string) => Ticket | undefined;
    getUserTickets: () => Ticket[];
    getAgentTickets: () => Ticket[];
    getAllTickets: () => Ticket[];
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

const TICKETS_STORAGE_KEY = 'clouddesk_tickets';

// Sample tickets for demo
const generateSampleTickets = (): Ticket[] => {
    return [
        {
            id: 'TKT-001',
            subject: 'Cannot access VPN from home',
            description: 'I am unable to connect to the company VPN when working from home. The connection times out after 30 seconds.',
            status: 'open',
            priority: 'high',
            category: 'network',
            createdBy: 'user_1',
            createdByName: 'John Smith',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            comments: [],
        },
        {
            id: 'TKT-002',
            subject: 'Request for new software license - Adobe Creative Suite',
            description: 'Our design team needs 3 additional licenses for Adobe Creative Suite for the new hires starting next month.',
            status: 'in_progress',
            priority: 'medium',
            category: 'software',
            createdBy: 'user_2',
            createdByName: 'Sarah Johnson',
            assignedTo: 'agent_1',
            assignedToName: 'Mike Support',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            comments: [
                {
                    id: 'cmt_1',
                    ticketId: 'TKT-002',
                    authorId: 'agent_1',
                    authorName: 'Mike Support',
                    authorRole: 'agent',
                    content: 'I\'ve submitted the purchase request. Awaiting approval from procurement.',
                    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                }
            ],
        },
        {
            id: 'TKT-003',
            subject: 'Laptop keyboard not working',
            description: 'Several keys on my laptop keyboard have stopped responding. The affected keys are: Q, W, E, R, T.',
            status: 'resolved',
            priority: 'high',
            category: 'hardware',
            createdBy: 'user_3',
            createdByName: 'Alex Chen',
            assignedTo: 'agent_2',
            assignedToName: 'Lisa Tech',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            comments: [
                {
                    id: 'cmt_2',
                    ticketId: 'TKT-003',
                    authorId: 'agent_2',
                    authorName: 'Lisa Tech',
                    authorRole: 'agent',
                    content: 'Keyboard replacement completed. Please confirm if everything is working correctly.',
                    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                }
            ],
        },
        {
            id: 'TKT-004',
            subject: 'Password reset for finance portal',
            description: 'I forgot my password for the finance portal and need it reset urgently for end-of-month reports.',
            status: 'open',
            priority: 'critical',
            category: 'access',
            createdBy: 'user_4',
            createdByName: 'Emma Wilson',
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            comments: [],
        },
        {
            id: 'TKT-005',
            subject: 'Printer on 3rd floor not printing',
            description: 'The main printer on the 3rd floor (HP LaserJet 500) is showing an error message and won\'t print any documents.',
            status: 'in_progress',
            priority: 'low',
            category: 'hardware',
            createdBy: 'user_5',
            createdByName: 'David Brown',
            assignedTo: 'agent_1',
            assignedToName: 'Mike Support',
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            comments: [],
        },
    ];
};

export function TicketProvider({ children }: { children: ReactNode }) {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    // Load tickets from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(TICKETS_STORAGE_KEY);
        if (stored) {
            try {
                const ticketData = JSON.parse(stored);
                setTickets(ticketData);
            } catch (error) {
                console.error('Failed to parse stored tickets:', error);
                // Initialize with sample data
                const sampleTickets = generateSampleTickets();
                setTickets(sampleTickets);
                localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(sampleTickets));
            }
        } else {
            // Initialize with sample data for demo
            const sampleTickets = generateSampleTickets();
            setTickets(sampleTickets);
            localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(sampleTickets));
        }
        setIsLoading(false);
    }, []);

    // Save tickets to localStorage whenever they change
    useEffect(() => {
        if (!isLoading && tickets.length > 0) {
            localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
        }
    }, [tickets, isLoading]);

    const createTicket = async (data: TicketFormData): Promise<Ticket> => {
        if (!user) throw new Error('User not authenticated');

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const newTicket: Ticket = {
            id: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
            subject: data.subject,
            description: data.description,
            status: 'open',
            priority: data.priority,
            category: data.category,
            createdBy: user.id,
            createdByName: user.name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            comments: [],
        };

        setTickets(prev => [newTicket, ...prev]);
        return newTicket;
    };

    const updateTicketStatus = async (ticketId: string, status: TicketStatus): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 300));

        setTickets(prev =>
            prev.map(ticket =>
                ticket.id === ticketId
                    ? {
                        ...ticket,
                        status,
                        updatedAt: new Date().toISOString(),
                        resolvedAt: status === 'resolved' ? new Date().toISOString() : ticket.resolvedAt,
                    }
                    : ticket
            )
        );
    };

    const assignTicket = async (ticketId: string, agentId: string, agentName: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 300));

        setTickets(prev =>
            prev.map(ticket =>
                ticket.id === ticketId
                    ? {
                        ...ticket,
                        assignedTo: agentId,
                        assignedToName: agentName,
                        status: ticket.status === 'open' ? 'in_progress' : ticket.status,
                        updatedAt: new Date().toISOString(),
                    }
                    : ticket
            )
        );
    };

    const addComment = async (ticketId: string, content: string): Promise<void> => {
        if (!user) throw new Error('User not authenticated');

        await new Promise(resolve => setTimeout(resolve, 300));

        const newComment: TicketComment = {
            id: `cmt_${Date.now()}`,
            ticketId,
            authorId: user.id,
            authorName: user.name,
            authorRole: user.role,
            content,
            createdAt: new Date().toISOString(),
        };

        setTickets(prev =>
            prev.map(ticket =>
                ticket.id === ticketId
                    ? {
                        ...ticket,
                        comments: [...ticket.comments, newComment],
                        updatedAt: new Date().toISOString(),
                    }
                    : ticket
            )
        );
    };

    const getTicketById = (ticketId: string): Ticket | undefined => {
        return tickets.find(ticket => ticket.id === ticketId);
    };

    const getUserTickets = (): Ticket[] => {
        if (!user) return [];
        return tickets.filter(ticket => ticket.createdBy === user.id);
    };

    const getAgentTickets = (): Ticket[] => {
        if (!user) return [];
        return tickets.filter(ticket => ticket.assignedTo === user.id);
    };

    const getAllTickets = (): Ticket[] => {
        return tickets;
    };

    const value: TicketContextType = {
        tickets,
        isLoading,
        createTicket,
        updateTicketStatus,
        assignTicket,
        addComment,
        getTicketById,
        getUserTickets,
        getAgentTickets,
        getAllTickets,
    };

    return (
        <TicketContext.Provider value={value}>
            {children}
        </TicketContext.Provider>
    );
}

export function useTickets(): TicketContextType {
    const context = useContext(TicketContext);
    if (context === undefined) {
        throw new Error('useTickets must be used within a TicketProvider');
    }
    return context;
}
