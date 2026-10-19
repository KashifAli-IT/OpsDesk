const ticketService = require("../services/ticketService");
const {
  VALID_STATUSES,
  VALID_PRIORITIES,
  validateCreateTicket,
  validateTicketUpdate,
} = require("../validators/ticketValidator");

function parsePositiveInteger(value, fallback) {
  if (value === undefined) return fallback;

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

function parseTicketId(value) {
  if (!/^[1-9]\d*$/.test(value)) return null;

  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

async function listTickets(req, res) {
  const page = parsePositiveInteger(req.query.page, 1);
  const limit = parsePositiveInteger(req.query.limit, 10);

  if (!page || !limit) {
    return res.status(400).json({
      error: "page and limit must be positive integers",
    });
  }

  if (limit > 100) {
    return res.status(400).json({
      error: "limit must not exceed 100",
    });
  }

  const { search, status, priority, assigned_to, sort_by, sort_order } =
    req.query;

  for (const [field, value] of Object.entries({
    search,
    status,
    priority,
    assigned_to,
    sort_by,
    sort_order,
  })) {
    if (value !== undefined && typeof value !== "string") {
      return res.status(400).json({
        error: `${field} must be provided only once as a string`,
      });
    }
  }

  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `status must be one of: ${VALID_STATUSES.join(", ")}`,
    });
  }

  if (priority && !VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({
      error: `priority must be one of: ${VALID_PRIORITIES.join(", ")}`,
    });
  }

  if (search && search.length > 200) {
    return res.status(400).json({
      error: "search must not exceed 200 characters",
    });
  }

  if (assigned_to && assigned_to.length > 120) {
    return res.status(400).json({
      error: "assigned_to must not exceed 120 characters",
    });
  }

  const allowedSortColumns = [
    "created_at",
    "updated_at",
    "priority",
    "status",
    "title",
  ];

  if (sort_by && !allowedSortColumns.includes(sort_by)) {
    return res.status(400).json({
      error: `sort_by must be one of: ${allowedSortColumns.join(", ")}`,
    });
  }

  if (sort_order && !["asc", "desc"].includes(sort_order)) {
    return res.status(400).json({
      error: "sort_order must be asc or desc",
    });
  }

  const result = await ticketService.listTickets({
    search: search?.trim() || "",
    status,
    priority,
    assigned_to,
    page,
    limit,
    sort_by,
    sort_order,
  });

  res.status(200).json(result);
}

async function getTicket(req, res) {
  const id = parseTicketId(req.params.id);

  if (!id) {
    return res.status(400).json({ error: "Invalid ticket ID" });
  }

  const ticket = await ticketService.getTicketById(id);

  if (!ticket) {
    return res.status(404).json({ error: "Ticket not found" });
  }

  res.status(200).json({ data: ticket });
}

async function createTicket(req, res) {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ error: "Request body must be a JSON object" });
  }

  const errors = validateCreateTicket(req.body);

  if (errors.length) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors,
    });
  }

  const ticket = await ticketService.createTicket(req.body);

  res
    .status(201)
    .location(`/api/tickets/${ticket.id}`)
    .json({ data: ticket });
}

async function updateTicket(req, res) {
  const id = parseTicketId(req.params.id);

  if (!id) {
    return res.status(400).json({ error: "Invalid ticket ID" });
  }

  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ error: "Request body must be a JSON object" });
  }

  const errors = validateTicketUpdate(req.body);

  if (errors.length) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors,
    });
  }

  const ticket = await ticketService.updateTicket(id, req.body);

  if (!ticket) {
    return res.status(404).json({ error: "Ticket not found" });
  }

  res.status(200).json({ data: ticket });
}

async function deleteTicket(req, res) {
  const id = parseTicketId(req.params.id);

  if (!id) {
    return res.status(400).json({ error: "Invalid ticket ID" });
  }

  const deleted = await ticketService.deleteTicket(id);

  if (!deleted) {
    return res.status(404).json({ error: "Ticket not found" });
  }

  res.status(204).end();
}

module.exports = {
  listTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
};
