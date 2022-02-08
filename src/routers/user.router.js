const express = require('express');
const {
    checkEmailAvailability,
    registerUser,
    checkValidToken,
    userLogin,
    userLogout,
    publishRealestate
} = require('../controllers/user.controller')
const userAuth = require('../middleware/userAuth');

const router = new express.Router();

//Check email availability
router.post('/user/email-availability', checkEmailAvailability);

//Register new user
router.post('/user/register', registerUser)

//User login
router.post('/user/login', userLogin)

//User logout
router.get('/user/logout', userAuth, userLogout)

//Check if token is valid and return user info
router.get('/user/check-token', userAuth, checkValidToken);

//Publish realestate
router.post('/user/publish-realestate',userAuth, publishRealestate)

module.exports = router;