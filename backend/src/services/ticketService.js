const pool = require("../config/db");

const ALLOWED_SORT_COLUMNS = {
  created_at: "created_at",
  updated_at: "updated_at",
  priority: "priority",
  status: "status",
  title: "title",
};

async function listTickets({
  search = "",
  status,
  priority,
  assigned_to,
  page = 1,
  limit = 10,
  sort_by = "created_at",
  sort_order = "desc",
}) {
  const conditions = [];
  const values = [];

  function addCondition(sql, value) {
    values.push(value);
    conditions.push(sql.replace("?", `$${values.length}`));
  }

  if (search) {
    values.push(`%${search}%`);
    const parameter = `$${values.length}`;

    conditions.push(
      `(title ILIKE ${parameter} OR customer_name ILIKE ${parameter} OR customer_email ILIKE ${parameter})`
    );
  }

  if (status) addCondition("status = ?", status);
  if (priority) addCondition("priority = ?", priority);
  if (assigned_to) addCondition("assigned_to = ?", assigned_to);

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM tickets ${whereClause}`,
    values
  );

  const total = countResult.rows[0].total;
  const offset = (page - 1) * limit;

  const sortColumn = ALLOWED_SORT_COLUMNS[sort_by] || "created_at";
  const sortDirection = sort_order === "asc" ? "ASC" : "DESC";

  const dataValues = [...values, limit, offset];

  const result = await pool.query(
    `SELECT *
     FROM tickets
     ${whereClause}
     ORDER BY ${sortColumn} ${sortDirection}, id DESC
     LIMIT $${dataValues.length - 1}
     OFFSET $${dataValues.length}`,
    dataValues
  );

  return {
    data: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getTicketById(id) {
  const result = await pool.query(
    "SELECT * FROM tickets WHERE id = $1",
    [id]
  );

  return result.rows[0] || null;
}

async function createTicket(ticket) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO tickets
        (title, description, customer_name, customer_email, priority, status, assigned_to)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        ticket.title.trim(),
        ticket.description || "",
        ticket.customer_name.trim(),
        ticket.customer_email.trim().toLowerCase(),
        ticket.priority || "medium",
        ticket.status || "open",
        ticket.assigned_to?.trim() || null,
      ]
    );

    const createdTicket = result.rows[0];

    await client.query(
      `INSERT INTO ticket_status_history
        (ticket_id, old_status, new_status, changed_by, note)
       VALUES ($1, NULL, $2, $3, $4)`,
      [
        createdTicket.id,
        createdTicket.status,
        "system",
        "Ticket created",
      ]
    );

    await client.query("COMMIT");
    return createdTicket;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function updateTicket(id, updates) {
  const client = await pool.connect();

  const columnMap = {
    title: "title",
    description: "description",
    customer_name: "customer_name",
    customer_email: "customer_email",
    priority: "priority",
    status: "status",
    assigned_to: "assigned_to",
  };

  try {
    await client.query("BEGIN");

    const existingResult = await client.query(
      "SELECT * FROM tickets WHERE id = $1 FOR UPDATE",
      [id]
    );

    const existing = existingResult.rows[0];

    if (!existing) {
      await client.query("ROLLBACK");
      return null;
    }

    const fields = Object.keys(updates).filter(
      (field) => Object.hasOwn(columnMap, field)
    );

    const values = [];
    const assignments = [];

    for (const field of fields) {
      let value = updates[field];

      if (typeof value === "string") value = value.trim();
      if (field === "customer_email" && typeof value === "string") {
        value = value.toLowerCase();
      }
      if (field === "assigned_to" && value === "") value = null;

      values.push(value);
      assignments.push(`${columnMap[field]} = $${values.length}`);
    }

    if (assignments.length === 0) {
      await client.query("ROLLBACK");
      return existing;
    }

    values.push(id);

    const updateResult = await client.query(
      `UPDATE tickets
       SET ${assignments.join(", ")}, updated_at = NOW()
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );

    const updated = updateResult.rows[0];

    if (updates.status && updates.status !== existing.status) {
      await client.query(
        `INSERT INTO ticket_status_history
          (ticket_id, old_status, new_status, changed_by, note)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          id,
          existing.status,
          updated.status,
          "system",
          "Status updated through ticket API",
        ]
      );
    }

    await client.query("COMMIT");
    return updated;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function deleteTicket(id) {
  const result = await pool.query(
    "DELETE FROM tickets WHERE id = $1 RETURNING id",
    [id]
  );

  return result.rowCount > 0;
}

module.exports = {
  listTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
};
