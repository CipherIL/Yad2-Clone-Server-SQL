const express = require('express');
const {getRealestatePosts} = require('../controllers/realestate.controller');

const router = new express.Router();

router.post('/realestate/get-posts', getRealestatePosts);

module.exports = router;