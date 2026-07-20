// before a request reaches database prisma and controller it will go through this limiter and if a client makes too many requests it will throw an error 
// express-rate-limit creates a middleware which tracks requests counts them and blocks the access if limit exceeded

const rateLimit = require("express-rate-limit")
// this a fucntion which will return middleware

const feedLimiter =rateLimit({
    windowMs : 60*1000,
    // dev: two windows × StrictMode double-fetch burns 60/min fast during
    // testing, and a 429'd feed used to render as "No posts yet"
    max: process.env.NODE_ENV === "production" ? 60 : 1000,
    standardHeaders:true,
    legacyHeaders:false,
    message:{
        "error":"Too many requests. Please slow down."
    }

})



module.exports = feedLimiter;