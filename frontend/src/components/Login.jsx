import React, { useState, useContext } from "react";
import { AuthContext } from "../authContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Simple client-side input validation
  const isValidInput = (input) => {
    const regex = /^[a-zA-Z0-9_]{3,20}$/;
    return regex.test(input);
  };

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      navigate("/jobs");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidInput(username) || !isValidInput(password)) {
      alert("Invalid input. Use 3-20 characters: letters, numbers, underscores.");
      return;
    }
    try {
      await login(username, password);
      navigate("/jobs");
    } catch {
      alert("Login failed. Check console or backend logs.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Username</label>
            <input
              type="text"
              className="border rounded w-full p-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              pattern="^[a-zA-Z0-9_]{3,20}$"
              title="3-20 characters: letters, numbers, underscores."
            />
          </div>
          <div>
            <label className="block mb-1">Password</label>
            <input
              type="password"
              className="border rounded w-full p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              pattern="^[a-zA-Z0-9_]{3,20}$"
              title="3-20 characters: letters, numbers, underscores."
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 w-full text-white py-2 rounded"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
