const express = require('express');
const {
  getContacts,
  getContact,
  createContact,
  deleteContact
} = require('../controllers/contactController');

const router = express.Router();

// Public routes
router.post('/', createContact);

// Protected routes (would need auth middleware in production)
router.get('/', getContacts);
router.get('/:id', getContact);
router.delete('/:id', deleteContact);

module.exports = router;