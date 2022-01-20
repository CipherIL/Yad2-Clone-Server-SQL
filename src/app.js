const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const userRouter = require('./routers/user.router');
// const realestateRouter = require('./routers/realestate.router');

const app = express();

app.use(cors({
    origin: ["http://localhost:3000",],
    credentials: true,
    exposedHeaders: ["set-cookie"],
}));

app.use(express.json());
app.use(cookieParser());
app.use(userRouter);
// app.use(realestateRouter);

module.exports = app;