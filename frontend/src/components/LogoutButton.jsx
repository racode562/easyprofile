import React, { useContext } from "react";
import { AuthContext } from "../authContext";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <button
      className="bg-red-500 text-white px-4 py-2 rounded"
      onClick={handleLogout}
    >
      Logout
    </button>
  );
};

export default LogoutButton;
