import React, { useContext } from "react";
import { AuthContext } from "../authContext";
import LogoutButton from "./LogoutButton";

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white p-6 mt-10 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Hello {user?.username}!</h1>
        <p>Welcome to the dashboard.</p>
        <div className="mt-4">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
