export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export function isTicketStatus(x: any): x is TicketStatus {
  return x === "OPEN" || x === "IN_PROGRESS" || x === "RESOLVED";
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
  return `invalid transition ${current} -> ${next}`;
}
