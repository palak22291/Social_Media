// before a request reaches database prisma and controller it will go through this limiter and if a client makes too many requests it will throw an error 
// express-rate-limit creates a middleware which tracks requests counts them and blocks the access if limit exceeded

const rateLimit = require("express-rate-limit")
// this a fucntion which will return middleware

const feedLimiter =rateLimit({
    windowMs : 60*1000,
    max:60,
    standardHeaders:true,
    legacyHeaders:false,
    message:{
        "error":"Too many requests. Please slow down."
    }

})



module.exports = feedLimiter;