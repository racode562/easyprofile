import React, { useState } from "react";
import LogoutButton from "./LogoutButton";

function Generator() {
  const [apiToken, setApiToken] = useState("");
  const [profileImage, setProfileImage] = useState(
    "https://via.placeholder.com/150/000000/FFFFFF?text=Profile"
  );
  const [posts, setPosts] = useState([
    "https://via.placeholder.com/500/111111/FFFFFF?text=Post+1",
    "https://via.placeholder.com/500/222222/FFFFFF?text=Post+2",
    "https://via.placeholder.com/500/333333/FFFFFF?text=Post+3",
    "https://via.placeholder.com/500/444444/FFFFFF?text=Post+4",
    "https://via.placeholder.com/500/555555/FFFFFF?text=Post+5",
    "https://via.placeholder.com/500/666666/FFFFFF?text=Post+6",
  ]);

  const handleGenerate = () => {
    console.log("Using API token:", apiToken);
    // TODO: Call your AI generation backend here, then update:
    // setProfileImage(...)
    // setPosts([...]);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex justify-center items-center relative">
      {/* Logout Button */}
      <div className="absolute top-4 right-4">
        <LogoutButton />
      </div>

      <div className="transform scale-125">
        {/* Title/Logo */}
        <h1 className="text-2xl font-bold mb-4 text-center">AI Image Generator</h1>

        {/* API Token + Generate Button */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <input
            type="text"
            placeholder="Enter API Token..."
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-black"
          />
          <button
            onClick={handleGenerate}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
          >
            Generate
          </button>
        </div>

        {/* Profile Photo (centered) */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={profileImage}
            alt="Profile"
            className="w-36 h-36 rounded-full object-cover border border-gray-300"
          />
        </div>

        {/* Posts Grid (3 across, minimal spacing, centered) */}
        <div className="grid grid-cols-3 gap-[2px] max-w-xl mx-auto">
          {posts.map((postUrl, idx) => (
            <div key={idx} className="w-full aspect-square">
              <img
                src={postUrl}
                alt={`Post ${idx}`}
                className="object-cover w-full h-full"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Generator;
