import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        background: "rgba(20, 20, 35, 0.7)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        
        {/* ---------- LEFT: Brand Name ---------- */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            cursor: "pointer",
            background:
              "linear-gradient(135deg, hsl(270, 70%, 65%), hsl(270, 80%, 75%))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
          onClick={() => navigate("/")}
        >
          Connectify
        </Typography>

        {/* ---------- RIGHT BUTTONS ---------- */}
        <Box sx={{ display: "flex", gap: 2 }}>

          {/* CREATE POST (only if logged in) */}
          {token && (
            <Button
              variant="contained"
              onClick={() => navigate("/create")}
              sx={{ textTransform: "none" }}
            >
              Create Post
            </Button>
          )}

          {/* IF USER NOT LOGGED IN → show Login & Signup */}
          {!token && (
            <>
              <Button
                variant="outlined"
                onClick={() => navigate("/login")}
                sx={{ textTransform: "none", color: "white", borderColor: "white" }}
              >
                Login
              </Button>

              <Button
                variant="contained"
                onClick={() => navigate("/register")}
                sx={{ textTransform: "none" }}
              >
                Sign Up
              </Button>
            </>
          )}

          {/* IF USER LOGGED IN → Show Logout */}
          {token && (
            <Button
              variant="outlined"
              onClick={handleLogout}
              sx={{ textTransform: "none", color: "white", borderColor: "white" }}
            >
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
