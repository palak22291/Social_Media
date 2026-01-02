const express  = require("express")

const {createPost,getAllPosts,getFeedPosts,getPostById,updatePost,deletePost} = require("../Controllers/postController")
const feedLimiter = require("../Middleware/feedRateLimit")
const auth = require("../Middleware/auth");

const router = express.Router()
// It's like a mini Express app.Helps us group all the routes related to posts in one file.

// public routes(login not required)

router.get("/",getAllPosts)
router.get("/feed",feedLimiter,getFeedPosts)
router.get("/:id",getPostById)

// protected routes(authentication)

router.post("/",auth,createPost)
router.put("/:id",auth,updatePost)
router.delete("/:id",auth,deletePost)

module.exports=router;





