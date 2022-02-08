const jwt = require('jsonwebtoken');
const {sql} = require('../database/sql');

const userAuth = async (req,res,next) => {
    try {
        //Step 1: is there even a cookie with a token?
        if(!req.cookies.AuthToken) throw new Error();
        //Step 2: does the token match any tokens in the DB?
        const request = new sql.Request();
        request.query(`SELECT * FROM tbl_Yad2_tokens WHERE Token = '${req.cookies.AuthToken}'`,(err,result)=>{
            if(err) {
                throw new Error;
            } else {
                //Step 3: No token matched - remove the cookie
                if(result.recordset.length === 0) {
                    res.clearCookie("AuthToken");
                    return res.status(400).send("Invalid token - login again please")
                }
                //Step 3: Token matched - decode it
                const token = result.recordset[0].Token;
                const decoded = jwt.verify(token,process.env.SECRET);
                if(!decoded) throw new Error;

                //Step 4: get user by id from decoded token
                request.query(`SELECT * FROM tbl_Yad2_users WHERE Id = ${decoded.data}`, (err,result) => {
                    if(err) {
                        console.log(err)
                        throw new Error();
                    } else {
                        req.user = {...result.recordset[0]}
                        next();
                    }
                })
            }
        });

    } catch (err) {
        return res.status(500).send("Internal Server Error");
    }
}

module.exports = userAuth;