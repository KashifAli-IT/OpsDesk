-- OpsDesk database schema
-- PostgreSQL 17

CREATE TABLE IF NOT EXISTS tickets (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    customer_name VARCHAR(120) NOT NULL,
    customer_email VARCHAR(254) NOT NULL,
    priority VARCHAR(10) NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    assigned_to VARCHAR(120),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_status_history (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    old_status VARCHAR(20)
        CHECK (old_status IS NULL OR old_status IN ('open', 'in_progress', 'resolved', 'closed')),
    new_status VARCHAR(20) NOT NULL
        CHECK (new_status IN ('open', 'in_progress', 'resolved', 'closed')),
    changed_by VARCHAR(120) NOT NULL DEFAULT 'system',
    note TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for filtering, sorting, and history lookup
CREATE INDEX IF NOT EXISTS idx_tickets_status
    ON tickets(status);

CREATE INDEX IF NOT EXISTS idx_tickets_priority
    ON tickets(priority);

CREATE INDEX IF NOT EXISTS idx_tickets_created_at
    ON tickets(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to
    ON tickets(assigned_to);

CREATE INDEX IF NOT EXISTS idx_tickets_customer_email
    ON tickets(customer_email);

CREATE INDEX IF NOT EXISTS idx_ticket_status_history_ticket_id
    ON ticket_status_history(ticket_id, created_at DESC);

-- Sample data: inserted only when the table is empty.
-- The sample tickets are for local development and demonstrations.
INSERT INTO tickets
    (title, description, customer_name, customer_email, priority, status, assigned_to)
SELECT *
FROM (VALUES
    ('Cannot reset password',
     'Password reset email is not arriving in the customer inbox.',
     'Ayesha Khan', 'ayesha@example.com', 'high', 'open', 'Sara Ahmed'),
    ('Payment charged twice',
     'Customer reports two charges for a single order.',
     'Bilal Ahmed', 'bilal@example.com', 'urgent', 'in_progress', 'Usman Ali'),
    ('Dashboard loads slowly',
     'Reports dashboard takes more than 10 seconds to load.',
     'Hina Shah', 'hina@example.com', 'medium', 'open', NULL),
    ('Update account email',
     'Customer needs help changing the email linked to the account.',
     'Hamza Malik', 'hamza@example.com', 'low', 'resolved', 'Sara Ahmed'),
    ('Mobile app crashes',
     'Application closes after the customer opens order history.',
     'Fatima Noor', 'fatima@example.com', 'urgent', 'in_progress', 'Usman Ali'),
    ('Invoice download failing',
     'PDF invoice download returns an error.',
     'Ahmed Raza', 'ahmed@example.com', 'high', 'open', NULL),
    ('Request for refund status',
     'Customer is asking for an update on a previously requested refund.',
     'Mariam Iqbal', 'mariam@example.com', 'medium', 'closed', 'Sara Ahmed'),
    ('Unable to change profile photo',
     'Uploading a new profile photo does not save the change.',
     'Zain Tariq', 'zain@example.com', 'low', 'resolved', 'Usman Ali')
) AS sample(title, description, customer_name, customer_email, priority, status, assigned_to)
WHERE NOT EXISTS (SELECT 1 FROM tickets);

-- Record the initial status of each sample ticket.
INSERT INTO ticket_status_history
    (ticket_id, old_status, new_status, changed_by, note)
SELECT id, NULL, status, 'system', 'Initial ticket status'
FROM tickets
WHERE customer_email IN (
    'ayesha@example.com',
    'bilal@example.com',
    'hina@example.com',
    'hamza@example.com',
    'fatima@example.com',
    'ahmed@example.com',
    'mariam@example.com',
    'zain@example.com'
)
AND NOT EXISTS (
    SELECT 1
    FROM ticket_status_history history
    WHERE history.ticket_id = tickets.id
);
