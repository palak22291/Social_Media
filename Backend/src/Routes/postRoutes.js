const express  = require("express")

const {createPost,getAllPosts,getFeedPosts,getPostById,updatePost,deletePost} = require("../Controllers/postController")
const feedLimiter = require("../Middleware/feedRateLimit")
const auth = require("../Middleware/auth");
const optionalAuth = require("../Middleware/optionalAuth");
const { validate, createPostSchema, updatePostSchema } = require("../Validation/schemas");

const router = express.Router()
// It's like a mini Express app.Helps us group all the routes related to posts in one file.

// public routes(login not required)
// optionalAuth: decodes the token if present (for likedByMe) but never 401s

router.get("/",optionalAuth,getAllPosts)
router.get("/feed",feedLimiter,optionalAuth,getFeedPosts)
router.get("/:id",optionalAuth,getPostById)

// protected routes(authentication)

router.post("/",auth,validate(createPostSchema),createPost)
router.put("/:id",auth,validate(updatePostSchema),updatePost)
router.delete("/:id",auth,deletePost)

module.exports=router;





