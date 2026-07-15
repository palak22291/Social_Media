// src/pages/CreatePost.jsx
import React, { useState } from "react";
import { Box, TextField, Typography, Button, Alert } from "@mui/material";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function CreatePost() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState(null);
  const [severity, setSeverity] = useState("info");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setMessage(null);
    if (!title.trim() || !content.trim()) return;

    try {
      setLoading(true);
      const res = await axiosInstance.post("/posts", {
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl.trim() || null,
      });

      setSeverity("success");
      setMessage(res.data?.message || "Post created!");
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      setSeverity("error");
      setMessage(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to create post. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ py: 1 }}>
      <Typography variant="h2" sx={{ mb: 0.5, color: "text.primary" }}>
        Create a post
      </Typography>
      <Typography variant="body2" sx={{ mb: 3 }}>
        Share something with your feed.
      </Typography>

      {message && (
        <Alert severity={severity} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          fullWidth
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          fullWidth
          multiline
          rows={5}
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <TextField
          fullWidth
          placeholder="Image URL (optional)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button variant="text" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading || !title.trim() || !content.trim()}
          >
            {loading ? "Publishing…" : "Publish"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
