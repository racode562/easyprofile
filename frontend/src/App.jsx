import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./authContext";
import Login from "./components/Login";
import Generator from "./components/Generator"; // Import the new component
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/generator"
            element={
              <ProtectedRoute>
                <Generator />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Login />} /> {/* Redirect all unmatched routes to login */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
