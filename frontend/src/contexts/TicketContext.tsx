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

  // Not supported by backend yet, kept for UI compatibility
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
  subject?: string;
  description?: string;
  status: ApiTicketStatus;
  createdAt?: string;
  updatedAt?: string;
  ownerSub?: string;
};

type ApiListTicketsResponse = { tickets?: ApiTicket[]; items?: ApiTicket[] };

// Some backends return { ticketId, status, createdAt }
type ApiCreateTicketResponseA = {
  ticketId: string;
  status: ApiTicketStatus;
  createdAt: string;
};

// Some backends return { ticket: {...} }
type ApiCreateTicketResponseB = {
  ticket: ApiTicket;
};

function getApiBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (!base) {
    throw new Error("VITE_API_BASE_URL is missing. Set it in frontend/.env or frontend/.env.local");
  }
  return base.replace(/\/+$/, "");
}

async function getJwtToken(): Promise<string> {
  const session = await fetchAuthSession();

  // Cognito User Pool authorizers most commonly expect the ID token.
  const idToken = session.tokens?.idToken?.toString();
  if (idToken) return idToken;

  const accessToken = session.tokens?.accessToken?.toString();
  if (accessToken) return accessToken;

  throw new Error("Not authenticated (no token). Please log in again.");
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
  const token = await getJwtToken();

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
      method: options.method || "GET",
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

function mapApiTicketToUiTicket(api: ApiTicket, fallbacks?: { subject?: string; description?: string }): Ticket {
  const nowIso = new Date().toISOString();

  const subject = (api.title ?? api.subject ?? fallbacks?.subject ?? "").toString();
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
  const subject = (data.subject || "").trim();
  const description = (data.description || "").trim();

  if (subject.length < 3) {
    throw new Error("Title is required and must be at least 3 characters");
  }
  if (description.length < 5) {
    throw new Error("Description is required and must be at least 5 characters");
  }

  return { subject, description };
}

function extractList(resp: ApiListTicketsResponse): ApiTicket[] {
  if (Array.isArray(resp?.tickets)) return resp.tickets;
  if (Array.isArray(resp?.items)) return resp.items;
  return [];
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
        // Merge across all statuses
        const statuses: ApiTicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED"];
        const results = await Promise.all(
          statuses.map((s) => apiRequest<ApiListTicketsResponse>(`/agent/tickets?status=${s}`))
        );

        const merged = results.flatMap((r) => extractList(r));
        const mapped = merged.map((t) => mapApiTicketToUiTicket(t));

        mapped.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
        setTickets(mapped);

        console.log("REFRESH_TICKETS_OK_AGENT", { count: mapped.length });
      } else {
        const res = await apiRequest<ApiListTicketsResponse>("/tickets", { method: "GET" });
        const apiTickets = extractList(res);
        const mapped = apiTickets.map((t) => mapApiTicketToUiTicket(t));

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
      const { subject, description } = validateCreateTicketInput(data);

      // Send both subject and title to match either backend expectation.
      const payload = {
        subject,
        title: subject,
        description,
        priority: data.priority,
        category: data.category
      };

      console.log("CREATE_TICKET_START", { subjectLength: subject.length, descriptionLength: description.length });

      const res = await apiRequest<ApiCreateTicketResponseA | ApiCreateTicketResponseB | ApiTicket>("/tickets", {
        method: "POST",
        json: payload
      });

      let createdUi: Ticket;

      if ((res as ApiCreateTicketResponseB).ticket) {
        const t = (res as ApiCreateTicketResponseB).ticket;
        createdUi = mapApiTicketToUiTicket(t, { subject, description });
      } else if ((res as ApiCreateTicketResponseA).ticketId) {
        const r = res as ApiCreateTicketResponseA;
        createdUi = mapApiTicketToUiTicket(
          { ticketId: r.ticketId, status: r.status, createdAt: r.createdAt },
          { subject, description }
        );
      } else {
        createdUi = mapApiTicketToUiTicket(res as ApiTicket, { subject, description });
      }

      console.log("CREATE_TICKET_OK", createdUi);

      await refreshTicketsForCurrentUser();
      return createdUi;
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
      const apiStatus = toApiStatus(status);

      console.log("UPDATE_TICKET_STATUS_START", { ticketId, apiStatus });

      // Send both keys to match either backend handler style
      await apiRequest(`/agent/tickets/${ticketId}`, {
        method: "PATCH",
        json: { newStatus: apiStatus, status: apiStatus }
      });

      console.log("UPDATE_TICKET_STATUS_OK", { ticketId, apiStatus });

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
