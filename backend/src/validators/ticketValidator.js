const VALID_STATUSES = ["open", "in_progress", "resolved", "closed"];
const VALID_PRIORITIES = ["low", "medium", "high", "urgent"];

function validateCreateTicket(body) {
  const errors = [];

  const requiredFields = [
    "title",
    "customer_name",
    "customer_email",
  ];

  for (const field of requiredFields) {
    if (typeof body[field] !== "string" || !body[field].trim()) {
      errors.push(`${field} is required and must be a non-empty string`);
    }
  }

  if (typeof body.title === "string" && body.title.trim().length > 200) {
    errors.push("title must not exceed 200 characters");
  }

  if (
    typeof body.customer_name === "string" &&
    body.customer_name.trim().length > 120
  ) {
    errors.push("customer_name must not exceed 120 characters");
  }

  if (
    typeof body.customer_email === "string" &&
    (
      body.customer_email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customer_email.trim())
    )
  ) {
    errors.push("customer_email must be a valid email address");
  }

  if (
    body.description !== undefined &&
    typeof body.description !== "string"
  ) {
    errors.push("description must be a string");
  }

  if (
    typeof body.description === "string" &&
    body.description.length > 10000
  ) {
    errors.push("description must not exceed 10000 characters");
  }

  if (
    body.priority !== undefined &&
    !VALID_PRIORITIES.includes(body.priority)
  ) {
    errors.push(`priority must be one of: ${VALID_PRIORITIES.join(", ")}`);
  }

  if (
    body.status !== undefined &&
    !VALID_STATUSES.includes(body.status)
  ) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  if (
    body.assigned_to !== undefined &&
    body.assigned_to !== null &&
    (
      typeof body.assigned_to !== "string" ||
      body.assigned_to.trim().length > 120
    )
  ) {
    errors.push("assigned_to must be a string of at most 120 characters or null");
  }

  return errors;
}

function validateTicketUpdate(body) {
  const errors = [];
  const allowedFields = [
    "title",
    "description",
    "customer_name",
    "customer_email",
    "priority",
    "status",
    "assigned_to",
  ];

  const fields = Object.keys(body);

  if (fields.length === 0) {
    errors.push("At least one field must be provided");
    return errors;
  }

  const unknownFields = fields.filter(
    (field) => !allowedFields.includes(field)
  );

  if (unknownFields.length > 0) {
    errors.push(`Unsupported fields: ${unknownFields.join(", ")}`);
  }

  for (const field of fields) {
    const value = body[field];

    if (!allowedFields.includes(field)) continue;

    if (field === "title" || field === "customer_name" || field === "customer_email") {
      if (typeof value !== "string" || !value.trim()) {
        errors.push(`${field} must be a non-empty string`);
        continue;
      }

      if (field === "title" && value.trim().length > 200) {
        errors.push("title must not exceed 200 characters");
      }

      if (field === "customer_name" && value.trim().length > 120) {
        errors.push("customer_name must not exceed 120 characters");
      }

      if (
        field === "customer_email" &&
        (
          value.length > 254 ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
        )
      ) {
        errors.push("customer_email must be a valid email address");
      }
    }

    if (field === "description") {
      if (typeof value !== "string") {
        errors.push("description must be a string");
      } else if (value.length > 10000) {
        errors.push("description must not exceed 10000 characters");
      }
    }

    if (field === "priority" && !VALID_PRIORITIES.includes(value)) {
      errors.push(`priority must be one of: ${VALID_PRIORITIES.join(", ")}`);
    }

    if (field === "status" && !VALID_STATUSES.includes(value)) {
      errors.push(`status must be one of: ${VALID_STATUSES.join(", ")}`);
    }

    if (
      field === "assigned_to" &&
      value !== null &&
      (
        typeof value !== "string" ||
        value.trim().length > 120
      )
    ) {
      errors.push("assigned_to must be a string of at most 120 characters or null");
    }
  }

  return errors;
}

module.exports = {
  VALID_STATUSES,
  VALID_PRIORITIES,
  validateCreateTicket,
  validateTicketUpdate,
};
