const express = require('express');
const {
    checkEmailAvailability,
    registerUser,
} = require('../controllers/user.controller')
const userAuth = require('../middleware/userAuth');

const router = new express.Router();

//Check email availability
router.post('/user/email-availability', checkEmailAvailability);

//register new user
router.post('/user/register', registerUser)

module.exports = router;