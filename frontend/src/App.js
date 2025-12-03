import Feed from "./pages/Feed";
import CreatePost from "./pages/CreatePost";
import MainLayout from "./layouts/MainLayout";
import PostDetails from "./pages/PostDetails";

import Register from "./components/Register";
import Login from "./components/Login";
import React from "react";
import { Routes, Route } from "react-router-dom";
import EditPost from "./pages/EditPost";

function App() {
  return (
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
      element={ <MainLayout>
        <EditPost/>
        
      </MainLayout>}
        />

      <Route
      path="/post/:postId"
      element={<PostDetails/>}
      />

      

    </Routes>
  );
}

export default App;
