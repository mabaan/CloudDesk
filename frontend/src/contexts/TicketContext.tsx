import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type {
  Ticket,
  TicketFormData,
  TicketStatus,
  TicketPriority,
  TicketCategory
} from "../types";
import { useAuth } from "./AuthContext";
import { fetchAuthSession } from "aws-amplify/auth";

interface TicketContextType {
  tickets: Ticket[];
  isLoading: boolean;
  refreshMyTickets: () => Promise<void>;
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

type ApiTicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "open"
  | "in_progress"
  | "resolved"
  | "closed";

type ApiTicket = {
  ticketId: string;
  title?: string;
  subject?: string;
  description?: string;
  priority?: string;
  category?: string;
  status: ApiTicketStatus;
  createdAt?: string;
  updatedAt?: string;
  ownerSub?: string;
};

function getApiBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (!base) {
    throw new Error("VITE_API_BASE_URL is missing. Set it in frontend/.env (or .env.local)");
  }
  return base.replace(/\/+$/, "");
}

async function getAccessToken(): Promise<string> {
  const session = await fetchAuthSession();
  const token = session.tokens?.accessToken?.toString();
  if (!token) {
    throw new Error("Not authenticated (no access token). Please log in again.");
  }
  return token;
}

function safeJsonParse(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function extractErrorMessage(data: any, fallback: string): string {
  if (!data) return fallback;
  return (
    data.message ||
    data.error ||
    data.errors?.[0]?.message ||
    fallback
  );
}

function extractRequestId(data: any): string | undefined {
  if (!data) return undefined;
  return data.requestId || data.requestID || data.request_id;
}

async function apiRequest<T>(
  path: string,
  options: RequestInit & { json?: any } = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const token = await getAccessToken();

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Accept", "application/json");

  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const url = `${baseUrl}${path}`;

  const res = await fetch(url, {
    ...options,
    headers,
    body: options.json !== undefined ? JSON.stringify(options.json) : options.body
  });

  const text = await res.text();
  const data = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    const fallback = `Request failed: ${res.status} ${res.statusText}`;
    const msg = extractErrorMessage(data, fallback);
    const requestId = extractRequestId(data);

    console.log("API_ERROR", {
      url,
      method: options.method || "GET",
      status: res.status,
      body: data
    });

    if (requestId) {
      throw new Error(`${msg} (requestId: ${requestId})`);
    }
    throw new Error(msg);
  }

  return data as T;
}

function toUiStatus(status: ApiTicketStatus | string | undefined): TicketStatus {
  const normalized = (status || "").toString().trim().toUpperCase();
  if (normalized === "OPEN") return "open";
  if (normalized === "IN_PROGRESS") return "in_progress";
  if (normalized === "RESOLVED") return "resolved";
  if (normalized === "CLOSED") return "closed";
  // Fallback: assume new tickets are open rather than resolved when unknown
  return "open";
}

function toApiStatus(status: TicketStatus): ApiTicketStatus {
  if (status === "open") return "OPEN";
  if (status === "in_progress") return "IN_PROGRESS";
  if (status === "resolved") return "RESOLVED";
  return "CLOSED";
}

function normalizePriority(input: string | undefined): TicketPriority {
  const val = (input || "").toLowerCase();
  if (val === "low" || val === "medium" || val === "high" || val === "critical") return val;
  return "medium";
}

function normalizeCategory(input: string | undefined): TicketCategory {
  const val = (input || "").toLowerCase();
  if (
    val === "hardware" ||
    val === "software" ||
    val === "network" ||
    val === "access" ||
    val === "other" ||
    val === "general"
  ) {
    return val;
  }
  return "general";
}

function mapApiTicketToUiTicket(api: ApiTicket): Ticket {
  const nowIso = new Date().toISOString();

  const subject = (api.title || api.subject || "").trim();
  const priority = normalizePriority(api.priority);
  const category = normalizeCategory(api.category);

  return {
    id: api.ticketId,
    subject: subject || "Untitled",
    description: api.description || "",
    status: toUiStatus(api.status),

    // Backend does not store these in the current implementation, so we default them
    priority,
    category,

    // We do not have a human name from Cognito by default, so we store ownerSub or "unknown"
    createdBy: api.ownerSub || "unknown",
    createdByName: api.ownerSub || "unknown",

    createdAt: api.createdAt || nowIso,
    updatedAt: api.updatedAt || api.createdAt || nowIso,
    resolvedAt: toUiStatus(api.status) === "resolved"
      ? api.updatedAt || api.createdAt || nowIso
      : undefined,

    // Assignment and comments are not supported by the backend yet
    assignedTo: undefined,
    assignedToName: undefined,
    comments: []
  };
}

export function TicketProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  async function refreshTicketsForCurrentUser() {
    if (!user) {
      setTickets([]);
      return;
    }

    setIsLoading(true);
    try {
      console.log("REFRESH_TICKETS_START", { role: user.role, username: user.username });

      if (user.role === "agent") {
        const statuses: ApiTicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED"];
        const results = await Promise.all(
          statuses.map((s) => apiRequest<{ tickets: ApiTicket[] }>(`/agent/tickets?status=${s}`))
        );

        const merged = results.flatMap((r) => (Array.isArray(r?.tickets) ? r.tickets : []));
        const mapped = merged.map(mapApiTicketToUiTicket);

        mapped.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

        setTickets(mapped);
        console.log("REFRESH_TICKETS_OK_AGENT", { count: mapped.length });
      } else {
        const res = await apiRequest<{ tickets: ApiTicket[] }>("/tickets", { method: "GET" });
        const apiTickets = Array.isArray(res?.tickets) ? res.tickets : [];
        const mapped = apiTickets.map(mapApiTicketToUiTicket);

        mapped.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

        setTickets(mapped);
        console.log("REFRESH_TICKETS_OK_USER", { count: mapped.length });
      }
    } catch (error) {
      console.log("REFRESH_TICKETS_ERROR", error);
      setTickets([]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refreshTicketsForCurrentUser().catch(() => {});
  }, [user?.username, user?.role]);

  const createTicket = async (data: TicketFormData): Promise<Ticket> => {
    if (!user) throw new Error("User not authenticated");

    setIsLoading(true);
    try {
      const subject = (data.subject || "").trim();
      const description = (data.description || "").trim();

      console.log("CREATE_TICKET_START", { subject });

      // Important: send BOTH subject and title for compatibility with backend variants.
      const payload = {
        subject,
        title: subject,
        description,

        // Optional fields (backend can ignore safely)
        priority: data.priority,
        category: data.category
      };

      const res = await apiRequest<{ ticket: ApiTicket } | ApiTicket>("/tickets", {
        method: "POST",
        json: payload
      });

      const apiTicket = (res as any)?.ticket ? (res as any).ticket : (res as any);
      const created = mapApiTicketToUiTicket(apiTicket as ApiTicket);

      console.log("CREATE_TICKET_OK", created);

      await refreshTicketsForCurrentUser();
      return created;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: TicketStatus): Promise<void> => {
    if (!user) throw new Error("User not authenticated");
    if (user.role !== "agent") {
      throw new Error("Only agents can update ticket status");
    }

    setIsLoading(true);
    try {
      console.log("UPDATE_TICKET_STATUS_START", { ticketId, status });

      // Some backends expect "status", some expect "newStatus". Send both.
      await apiRequest(`/agent/tickets/${ticketId}`, {
        method: "PATCH",
        json: { newStatus: toApiStatus(status), status: toApiStatus(status) }
      });

      console.log("UPDATE_TICKET_STATUS_OK", { ticketId, status });

      await refreshTicketsForCurrentUser();
    } finally {
      setIsLoading(false);
    }
  };

  const assignTicket = async (ticketId: string, agentId: string, agentName: string): Promise<void> => {
    if (!user) throw new Error("User not authenticated");
    if (user.role !== "agent") {
      throw new Error("Only agents can assign tickets");
    }

    console.log("ASSIGN_TICKET_REQUEST", { ticketId, agentId, agentName, current: user.username });

    if (agentId && agentId !== user.username) {
      throw new Error("Assignment to other agents is not supported yet");
    }

    await updateTicketStatus(ticketId, "in_progress");
  };

  const addComment = async (ticketId: string, content: string): Promise<void> => {
    console.log("ADD_COMMENT_NOT_SUPPORTED", { ticketId, contentLength: content?.length || 0 });
    throw new Error("Comments are not supported yet");
  };

  const getTicketById = (ticketId: string): Ticket | undefined => {
    return tickets.find((ticket) => ticket.id === ticketId);
  };

  const getUserTickets = (): Ticket[] => {
    if (!user) return [];
    if (user.role === "user") return tickets;
    return tickets.filter((t) => t.createdBy === user.username);
  };

  const getAgentTickets = (): Ticket[] => {
    if (!user) return [];
    if (user.role === "agent") return tickets;
    return [];
  };

  const getAllTickets = (): Ticket[] => {
    return tickets;
  };

  const value: TicketContextType = {
    tickets,
    isLoading,
    refreshMyTickets: refreshTicketsForCurrentUser,
    createTicket,
    updateTicketStatus,
    assignTicket,
    addComment,
    getTicketById,
    getUserTickets,
    getAgentTickets,
    getAllTickets
  };

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>;
}

export function useTickets(): TicketContextType {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error("useTickets must be used within a TicketProvider");
  }
  return context;
}
