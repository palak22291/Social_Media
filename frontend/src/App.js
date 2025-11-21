import Feed from "./pages/Feed";
import CreatePost from "./pages/CreatePost";

import Register from "./components/Register";
import Login from "./components/Login";
import React from "react";
import { Routes,Route } from "react-router-dom";


function App() {
  return (
    <Routes>
    <Route path="/register" element={<Register />} />
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<Feed/>}/>
    <Route path="/create" element={<CreatePost />} />

    
  </Routes>
  );
}

export default App;

