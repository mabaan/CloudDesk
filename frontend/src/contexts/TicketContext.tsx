import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Ticket, TicketFormData, TicketStatus } from "../types";
import { useAuth } from "./AuthContext";
import { fetchAuthSession } from "aws-amplify/auth";

interface TicketContextType {
  tickets: Ticket[];
  isLoading: boolean;

  createTicket: (data: TicketFormData) => Promise<Ticket>;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => Promise<void>;

  // Not supported by backend yet, but kept for UI compatibility
  assignTicket: (ticketId: string, agentId: string, agentName: string) => Promise<void>;
  addComment: (ticketId: string, content: string) => Promise<void>;

  getTicketById: (ticketId: string) => Ticket | undefined;
  getUserTickets: () => Ticket[];
  getAgentTickets: () => Ticket[];
  getAllTickets: () => Ticket[];
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

type ApiTicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

type ApiTicket = {
  ticketId: string;
  title?: string;
  description?: string;
  status: ApiTicketStatus;
  createdAt?: string;
  updatedAt?: string;
  ownerSub?: string;
};

type ApiListTicketsResponse = { tickets: ApiTicket[] };

// Backend createTicket returns: { ticketId, status, createdAt }
type ApiCreateTicketResponse = {
  ticketId: string;
  status: ApiTicketStatus;
  createdAt: string;
};

function getApiBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (!base) {
    throw new Error("VITE_API_BASE_URL is missing. Set it in frontend/.env or frontend/.env.local");
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

async function apiRequest<T>(path: string, options: RequestInit & { json?: any } = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const token = await getAccessToken();

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);

  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const url = `${baseUrl}${path}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
      body: options.json !== undefined ? JSON.stringify(options.json) : options.body
    });
  } catch (e) {
    console.log("API_NETWORK_ERROR", { url, error: e });
    throw new Error("Network error calling API. Check your internet, CORS, and API URL.");
  }

  const text = await res.text();
  const data = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `Request failed: ${res.status} ${res.statusText}`;

    console.log("API_ERROR", {
      url,
      status: res.status,
      statusText: res.statusText,
      body: data ?? text
    });

    throw new Error(message);
  }

  return data as T;
}

function toUiStatus(status: ApiTicketStatus): TicketStatus {
  if (status === "OPEN") return "open";
  if (status === "IN_PROGRESS") return "in_progress";
  return "resolved";
}

function toApiStatus(status: TicketStatus): ApiTicketStatus {
  if (status === "open") return "OPEN";
  if (status === "in_progress") return "IN_PROGRESS";
  return "RESOLVED";
}

function mapApiTicketToUiTicket(api: ApiTicket, fallbacks?: { title?: string; description?: string }): Ticket {
  const nowIso = new Date().toISOString();

  const subject = (api.title ?? fallbacks?.title ?? "").toString();
  const description = (api.description ?? fallbacks?.description ?? "").toString();

  return {
    id: api.ticketId,
    subject,
    description,
    status: toUiStatus(api.status),

    // Backend does not store these yet, keep UI defaults
    priority: "medium",
    category: "general",

    createdBy: api.ownerSub || "unknown",
    createdByName: api.ownerSub || "unknown",

    createdAt: api.createdAt || nowIso,
    updatedAt: api.updatedAt || api.createdAt || nowIso,
    resolvedAt: api.status === "RESOLVED" ? api.updatedAt || api.createdAt || nowIso : undefined,

    assignedTo: undefined,
    assignedToName: undefined,
    comments: []
  };
}

function validateCreateTicketInput(data: TicketFormData) {
  const title = (data.subject || "").trim();
  const description = (data.description || "").trim();

  // Match backend validation exactly (title >= 3, description >= 5)
  if (title.length < 3) {
    throw new Error("Title is required and must be at least 3 characters");
  }
  if (description.length < 5) {
    throw new Error("Description is required and must be at least 5 characters");
  }

  return { title, description };
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
        // Fetch all statuses and merge
        const statuses: ApiTicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED"];
        const results = await Promise.all(
          statuses.map((s) => apiRequest<ApiListTicketsResponse>(`/agent/tickets?status=${s}`))
        );

        const merged = results.flatMap((r) => (Array.isArray(r?.tickets) ? r.tickets : []));
        const mapped = merged.map((t) => mapApiTicketToUiTicket(t));

        mapped.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
        setTickets(mapped);

        console.log("REFRESH_TICKETS_OK_AGENT", { count: mapped.length });
      } else {
        const res = await apiRequest<ApiListTicketsResponse>("/tickets", { method: "GET" });
        const apiTickets = Array.isArray(res?.tickets) ? res.tickets : [];
        const mapped = apiTickets.map((t) => mapApiTicketToUiTicket(t));

        mapped.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
        setTickets(mapped);

        console.log("REFRESH_TICKETS_OK_USER", { count: mapped.length });
      }
    } catch (error) {
      console.log("REFRESH_TICKETS_ERROR", error);
      setTickets([]);

      // If you see "Agent role required" here, your agent user is not in the Cognito "Agents" group.
      // Fix with:
      // aws cognito-idp admin-add-user-to-group --user-pool-id <POOL> --username <EMAIL_OR_USERNAME> --group-name Agents

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
      const { title, description } = validateCreateTicketInput(data);

      console.log("CREATE_TICKET_START", { titleLength: title.length, descriptionLength: description.length });

      const payload = { title, description };

      // Backend returns { ticketId, status, createdAt } on success
      const res = await apiRequest<ApiCreateTicketResponse>("/tickets", {
        method: "POST",
        json: payload
      });

      const createdTicketForUi: Ticket = mapApiTicketToUiTicket(
        {
          ticketId: res.ticketId,
          status: res.status,
          createdAt: res.createdAt
        },
        { title, description }
      );

      console.log("CREATE_TICKET_OK", createdTicketForUi);

      await refreshTicketsForCurrentUser();
      return createdTicketForUi;
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

      await apiRequest(`/agent/tickets/${ticketId}`, {
        method: "PATCH",
        json: { newStatus: toApiStatus(status) }
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

    // Backend has no assignment support yet. Treat "assign" as moving to IN_PROGRESS.
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

  const value: TicketContextType = useMemo(
    () => ({
      tickets,
      isLoading,
      createTicket,
      updateTicketStatus,
      assignTicket,
      addComment,
      getTicketById,
      getUserTickets,
      getAgentTickets,
      getAllTickets
    }),
    [tickets, isLoading]
  );

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>;
}

export function useTickets() {
  const ctx = useContext(TicketContext);
  if (!ctx) {
    throw new Error("useTickets must be used within TicketProvider");
  }
  return ctx;
}
