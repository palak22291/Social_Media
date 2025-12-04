

import React, {  useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  // TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function PostCard({ post, onDelete, user }) {
  const navigate = useNavigate();

  // -----------------------
  // COMMENT STATE
  // -----------------------
  // const [comments, setComments] = useState([]);
  // const [newComment, setNewComment] = useState("");

  // -----------------------
  // FETCH COMMENTS
  // -----------------------
  // useEffect(() => {
  //   fetchComments();
  // });

  // const fetchComments = async () => {
  //   try {
  //     const res = await axiosInstance.get(`/comments/${post.id}`);
  //     setComments(res.data.comments || []);
  //   } catch (err) {
  //     console.error("❌ Fetch comments failed:", err);
  //   }
  // };

  // -----------------------
  // ADD COMMENT
  // -----------------------
  // const handleAddComment = async () => {
  //   if (!newComment.trim()) return;

  //   try {
  //     const res = await axiosInstance.post(
  //       `/comments/create/${post.id}`,
  //       { content: newComment }
  //     );

  //     setComments((prev) => [res.data.comment, ...prev]);
  //     setNewComment("");
  //   } catch (err) {
  //     console.error("❌ Add comment error:", err);
  //     alert("Failed to add comment");
  //   }
  // };

  // -----------------------
  // DELETE COMMENT
  // -----------------------
  // const handleDeleteComment = async (commentId) => {
  //   try {
  //     await axiosInstance.delete(`/comments/delete/${commentId}`);
  //     setComments((prev) => prev.filter((c) => c.id !== commentId));
  //   } catch (err) {
  //     console.error("❌ Delete comment error:", err);
  //     alert("Failed to delete comment");
  //   }
  // };

  // -----------------------
  // DELETE POST
  // -----------------------
  const [deleting, setDeleting] = useState(false);

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      setDeleting(true);
      const res = await axiosInstance.delete(`/posts/${post.id}`);

      if (res.status === 200) {
        if (typeof onDelete === "function") onDelete(post.id);
      } else {
        alert("Failed to delete post");
      }
    } catch (err) {
      console.error("❌ Delete post error:", err);
      alert("Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card
      sx={{
        background: "rgba(30, 30, 50, 0.85)",
        backdropFilter: "blur(8px)",
        borderRadius: 3,
        border: "1px solid rgba(255,255,255,0.05)",
        mb: 3,
      }}
    >
      <CardContent>
        {/* AUTHOR */}
        <Typography variant="subtitle2" sx={{ color: "#BB86FC", mb: 1 }}>
          @{post.author?.firstName || "Unknown"}
        </Typography>

        {/* TITLE */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
          {post.title}
        </Typography>

        {/* CONTENT */}
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          {post.content}
        </Typography>

        {/* ACTION ROW */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {/* LIKE BTN */}
          <Button variant="contained" size="small">
            Like ({post._count?.likes || 0})
          </Button>

          {/* COMMENTS COUNT BTN */}
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate(`/post/${post.id}`)}
          >
            Comments ({post._count?.comments || 0})
          </Button>

          <Box sx={{ flex: 1 }} />

          {/* EDIT + DELETE BUTTONS (ONLY IF OWNER) */}
          {user?.id === post.author?.id && (
            <>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate(`/edit/${post.id}`)}
              >
                Edit
              </Button>

              <IconButton onClick={handleDeletePost} disabled={deleting}>
                <DeleteIcon sx={{ color: "error.main" }} />
              </IconButton>
            </> 
          )}
        </Box>

        {/* COMMENT INPUT */}
        {/* <Box sx={{ mt: 3, mb: 2 }}> */}
          {/* <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{
              input: { color: "white" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.2)",
                },
              },
            }}
          />

          <Button
            variant="contained"
            size="small"
            sx={{ mt: 1 }}
            onClick={handleAddComment}
          >
            Add Comment
          </Button>
        </Box> */}

        {/* COMMENT LIST */}
        {/* {comments.map((c) => (
          <Box
            key={c.id}
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 2,
              background: "rgba(255,255,255,0.06)",
            }}
          >
            <Typography variant="subtitle2">
              @{c.author.firstName}
            </Typography>

            <Typography variant="body2" sx={{ color: "gray" }}>
              {c.content}
            </Typography>

            {c.author.id === user?.id && (
              <Button
                size="small"
                color="error"
                onClick={() => handleDeleteComment(c.id)}
              >
                Delete
              </Button>
            )}
          </Box> */}
        {/* ))} */}
      </CardContent>
    </Card>
  );
}
