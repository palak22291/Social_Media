// import React from "react";
// import { Card, CardContent, Typography, Box, Button } from "@mui/material";
// import DeleteIcon from "@mui/icons-material/Delete";
// // import axios from "axios";
// import axiosInstance from "../utils/axiosInstance";
// import {useNavigate} from "react-router-dom"

// export default function PostCard({ post,onDelete,user }) {
//   const handleDelete = async () => {
//     try {
//       const res = await axiosInstance.delete(`/posts/${post.id}`);
//       if (res.status === 200) {
//         alert("Post Deleted Sucessfully");
//         onDelete(post.id);
//         // ondelete will be created inside feed.jsx as post card is a child component and feed.jsx is parent
//       }
//     } catch (err) {
//       console.error("DeleteError:", err.response?.data || err);
//       alert("Failed to delete post");
//     }
//   };

//   const navigate = useNavigate();

//   return (
//     <Card
//       sx={{
//         background: "rgba(30, 30, 50, 0.85)",
//         backdropFilter: "blur(8px)",
//         borderRadius: 3,
//         border: "1px solid rgba(255,255,255,0.05)",
//       }}
//     >
//       <CardContent>
//         <Typography variant="subtitle2" sx={{ color: "#BB86FC", mb: 1 }}>
//           @{post.author?.firstName || "Unknown"}
//         </Typography>

//         <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
//           {post.title}
//         </Typography>

//         <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
//           {post.content}
//         </Typography>

//         <Box sx={{ display: "flex", gap: 2 }}>
//           <Button variant="contained" size="small">
//             Like ({post._count?.likes || 0})
//           </Button>
//           <Button variant="outlined" size="small">
//             Comments ({post._count?.comments || 0})
//           </Button>

//           {/* delete button  */}

//           {user?.id === post.author?.id && (
//             // optional chaining and short circuit conditional rendering 

//             <>
//             <Button

//             variant="outlined"
//             size="small"
//             onClick={()=> navigate(`/edit/${post.id}`)}
//             />
            
//             <DeleteIcon
//               onClick={handleDelete}
//               style={{ cursor: "pointer", color: "red", marginLeft: "auto" }}
//             />
//             </>
//           )}
//         </Box>
//       </CardContent>
//     </Card>
//   );
// }


import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function PostCard({ post, onDelete, user }) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      setDeleting(true);
      const res = await axiosInstance.delete(`/posts/${post.id}`);
      if (res.status === 200) {

        if (typeof onDelete === "function") onDelete(post.id);
      } else {
        
        console.error("Unexpected delete response:", res);
        alert("Failed to delete post");
      }
    } catch (err) {
      console.error("Delete Error:", err.response?.data || err);
      alert(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to delete post"
      );
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
        <Typography variant="subtitle2" sx={{ color: "#BB86FC", mb: 1 }}>
          @{post.author?.firstName || "Unknown"}
        </Typography>

        <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
          {post.title}
        </Typography>

        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          {post.content}
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button variant="contained" size="small">
            Like ({post._count?.likes || 0})
          </Button>

          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate(`/post/${post.id}`)}
          >
            Comments ({post._count?.comments || 0})
          </Button>

          {/* spacer pushes edit/delete to the right */}
          <Box sx={{ flex: 1 }} />

          {/* Edit + Delete only for author */}
          {user?.id === post.author?.id && (
            <>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate(`/edit/${post.id}`)}
                sx={{ mr: 1 }}
              >
                Edit
              </Button>

              <IconButton
                aria-label="delete post"
                onClick={handleDelete}
                disabled={deleting}
                size="small"
              >
                <DeleteIcon sx={{ color: "error.main" }} />
              </IconButton>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
