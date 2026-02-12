export const TICKET_STATUS_VALUES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
export type TicketStatus = (typeof TICKET_STATUS_VALUES)[number];
export type ClientTicketStatus = "open" | "in_progress" | "resolved" | "closed";

export function normalizeTicketStatus(input: unknown): TicketStatus | null {
  if (typeof input !== "string") return null;

  const normalized = input.trim().replace(/[\s-]+/g, "_").toUpperCase();
  return TICKET_STATUS_VALUES.includes(normalized as TicketStatus)
    ? (normalized as TicketStatus)
    : null;
}

export function isTicketStatus(x: unknown): x is TicketStatus {
  return normalizeTicketStatus(x) !== null;
}

export function toClientStatus(status: TicketStatus): ClientTicketStatus {
  return status.toLowerCase() as ClientTicketStatus;
}

export function validateTitle(title: unknown) {
  if (typeof title !== "string" || title.trim().length < 3) {
    return "title is required and must be at least 3 characters";
  }
  if (title.length > 120) {
    return "title must be at most 120 characters";
  }
  return null;
}

export function validateDescription(description: unknown) {
  if (typeof description !== "string" || description.trim().length < 5) {
    return "description is required and must be at least 5 characters";
  }
  if (description.length > 2000) {
    return "description must be at most 2000 characters";
  }
  return null;
}

export function validateStatusTransition(current: TicketStatus, next: TicketStatus) {
  if (current === "OPEN" && next === "IN_PROGRESS") return null;
  if (current === "IN_PROGRESS" && next === "RESOLVED") return null;
  if (current === "RESOLVED" && next === "CLOSED") return null;
  return `invalid transition ${current} -> ${next}`;
}
