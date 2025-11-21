import React from "react";
import { Card, CardContent, Typography, Box, Button } from "@mui/material";

export default function PostCard({ post }) {
  return (
    <Card
      sx={{
        background: "rgba(30, 30, 50, 0.85)",
        backdropFilter: "blur(8px)",
        borderRadius: 3,
        border: "1px solid rgba(255,255,255,0.05)",
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

        {/* CONTENT PREVIEW */}
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          {post.content}
        </Typography>

        {/* LIKE + VIEW BUTTONS (Placeholders) */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="contained" size="small">
            Like ({post._count?.likes || 0})
          </Button>
          <Button variant="outlined" size="small">
            Comments ({post._count?.comments || 0})
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
