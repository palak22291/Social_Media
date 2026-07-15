// src/pages/EditPost.jsx
import React, { useEffect, useState } from "react";
import { Box, Typography, TextField, Button, Alert, CircularProgress } from "@mui/material";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";

export default function EditPost() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axiosInstance
      .get(`/posts/${postId}`)
      .then((res) => {
        const fetched = res.data.post || res.data;
        setTitle(fetched.title || "");
        setContent(fetched.content || "");
        setImageUrl(fetched.imageUrl || "");
      })
      .catch((err) => {
        console.error("Failed to load post for editing:", err);
        navigate(-1);
      })
      .finally(() => setLoading(false));
  }, [postId, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!title.trim() || !content.trim()) return;

    try {
      setSaving(true);
      await axiosInstance.put(`/posts/${postId}`, {
        title: title.trim(),
        content: content.trim(),
        // empty string would be rejected by validation — send null to clear
        imageUrl: imageUrl.trim() || null,
      });
      navigate(`/post/${postId}`);
    } catch (err) {
      setMessage(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to update post."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress size={24} color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 1 }}>
      <Typography variant="h2" sx={{ mb: 0.5, color: "text.primary" }}>
        Edit post
      </Typography>
      <Typography variant="body2" sx={{ mb: 3 }}>
        Make your changes and save.
      </Typography>

      {message && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <form onSubmit={handleSave}>
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
              type="submit"
              variant="contained"
              color="primary"
              disabled={saving || !title.trim() || !content.trim()}
            >
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </Box>
        </Box>
      </form>
    </Box>
  );
}
