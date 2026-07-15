import Feed from "./pages/Feed";
import CreatePost from "./pages/CreatePost";
import MainLayout from "./layouts/MainLayout";
import PostDetails from "./pages/PostDetails";

import Register from "./components/Register";
import Login from "./components/Login";
import React, { useState, useMemo, createContext, useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { getTheme } from "./theme";
import EditPost from "./pages/EditPost";

// Dark/light toggle — consumed by MainLayout's navbar button
const ColorModeContext = createContext({ mode: "dark", toggleMode: () => {} });
export const useColorMode = () => useContext(ColorModeContext);

function App() {
  const [mode, setMode] = useState(() => localStorage.getItem("colorMode") || "dark");
  const theme = useMemo(() => getTheme(mode), [mode]);

  const toggleMode = () =>
    setMode((m) => {
      const next = m === "dark" ? "light" : "dark";
      localStorage.setItem("colorMode", next);
      return next;
    });

  return (
    <ColorModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <MainLayout>
                <Feed />
              </MainLayout>
            }
          />
          <Route
            path="/create"
            element={
              <MainLayout>
                <CreatePost />
              </MainLayout>
            }
          />
          <Route
            path="/edit/:postId"
            element={
              <MainLayout>
                <EditPost />
              </MainLayout>
            }
          />
          <Route
            path="/post/:postId"
            element={
              <MainLayout>
                <PostDetails />
              </MainLayout>
            }
          />
        </Routes>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
