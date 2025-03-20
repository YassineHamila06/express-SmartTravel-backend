const express = require('express');
const router = express.Router();
const { getusers, createuser, getuser, updateuser, deleteuser, forgotPassword, resetPassword } = require('../controllers/userController');

// Define routes for user operations
router.get('/', getusers);  // Gets all users
router.post('/', createuser);  // Creates a new user
router.get('/:id', getuser);  // Gets a single user by id
router.put('/:id', updateuser);  // Updates a user by id
router.delete('/:id', deleteuser);  // Deletes a user by id

// Define routes for password management

router.post('/forgot-password', forgotPassword);  // Handles password recovery
router.post('/reset-password', resetPassword);  // Handles password reset

module.exports = router;
