const express = require('express');
const router = express.Router();
const { getusers, createuser, getuser, updateuser, deleteuser, forgotPassword, resetPassword } = require('../controllers/userController');

router.get('/users', getusers);
router.post('/users', createuser);
router.get('/users/:id', getuser);
router.put('/users/:id', updateuser);
router.delete('/users/:id', deleteuser);
router.post('/users/forgot-password', forgotPassword);
router.post('/users/reset-password', resetPassword);

module.exports = router;
