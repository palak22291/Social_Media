import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  Stack,
  Alert,
} from "@mui/material";
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
    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("authToken");

      const res = await axiosInstance.post(
        "/posts",
        { title, content, imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSeverity("success");
      setMessage("Post created successfully!");

      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      setSeverity("error");
      setMessage(err?.response?.data?.error || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0d0d16, #1a0033)",
        p: 3,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 600,
          background: "rgba(30, 30, 50, 0.85)",
          backdropFilter: "blur(8px)",
          borderRadius: 3,
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            fontWeight={700}
            align="center"
            gutterBottom
            sx={{
              background: "linear-gradient(90deg, #6A00F4, #BB86FC)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Create a Post
          </Typography>

          {message && <Alert severity={severity} sx={{ mb: 2 }}>{message}</Alert>}

          <Stack spacing={2}>
            <TextField
              label="Title"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <TextField
              label="Content"
              fullWidth
              multiline
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <TextField
              label="Image URL (optional)"
              fullWidth
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />

            <Button
              variant="contained"
              sx={{ textTransform: "none", mt: 1 }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Publishing..." : "Publish Post"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
