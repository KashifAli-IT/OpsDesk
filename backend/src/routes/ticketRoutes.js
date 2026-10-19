const express = require("express");
const controller = require("../controllers/ticketController");

const router = express.Router();

router.get("/", controller.listTickets);
router.get("/:id", controller.getTicket);
router.post("/", controller.createTicket);
router.patch("/:id", controller.updateTicket);
router.delete("/:id", controller.deleteTicket);

module.exports = router;
