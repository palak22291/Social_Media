import React, { useEffect, useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  useEffect(() => {
    fetchPost();
  });

  const fetchPost = async () => {
    try {
      const res = await axiosInstance.get(`/posts/${id}`);
      setTitle(res.data.post.title || "");
      setContent(res.data.post.content || "");
    } catch (err) {
      console.error("❌ Failed to fetch post:", err);
    }
  };

  const handleUpdate = async () => {
    try {
      const payload = { title, content };

      const res = await axiosInstance.put(`/posts/${id}`, payload);

      if (res.status === 200) {
        alert("Post updated successfully");
        navigate("/");
      }
    } catch (err) {
      console.error("❌ Update failed:", err.response?.data || err);
      alert("Failed to update post");
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 6 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Edit Post
      </Typography>

      <TextField
        label="Title"
        fullWidth
        sx={{ mb: 2 }}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <TextField
        label="Content"
        multiline
        rows={6}
        fullWidth
        sx={{ mb: 2 }}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <Button variant="contained" fullWidth onClick={handleUpdate}>
        Save Changes
      </Button>
    </Box>
  );
}
