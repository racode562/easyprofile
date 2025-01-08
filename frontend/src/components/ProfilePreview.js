import React from 'react';

// SVG Icons as components
const UserIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ImageIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

const FileTextIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const ProfilePreview = ({ profiles = [] }) => {
  if (!profiles || profiles.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 space-y-6 px-[100px]">
      <h3 className="text-xl font-bold">Generated Profiles Preview</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile, index) => (
          <div key={index} className="bg-neutral-800 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {profile.hasProfilePic ? (
                  <div className="w-16 h-16 rounded-full bg-neutral-700 flex items-center justify-center">
                    {profile.picType === 'female' && (
                      <img src="/api/placeholder/64/64" alt="Female Profile" className="rounded-full" />
                    )}
                    {profile.picType === 'male' && (
                      <img src="/api/placeholder/64/64" alt="Male Profile" className="rounded-full" />
                    )}
                    {profile.picType === 'pets' && (
                      <img src="/api/placeholder/64/64" alt="Pet Profile" className="rounded-full" />
                    )}
                    {profile.picType === 'random' && (
                      <img src="/api/placeholder/64/64" alt="Random Profile" className="rounded-full" />
                    )}
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-neutral-700 flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-neutral-500" />
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-medium">Profile {index + 1}</h4>
                <p className="text-sm text-neutral-400">
                  {profile.hasProfilePic 
                    ? `${profile.picType} profile picture`
                    : 'No profile picture'}
                </p>
              </div>
            </div>

            {(profile.posts > 0 || profile.hasProfilePic) && (
              <div className="space-y-3">
                <div className="h-px bg-neutral-700" />
                <h5 className="text-sm font-medium flex items-center gap-2">
                  <FileTextIcon className="w-4 h-4" />
                  Posts ({profile.posts})
                </h5>
                <div className="grid grid-cols-3 gap-2">
                  {profile.posts > 0 
                    ? Array.from({ length: profile.posts }).map((_, postIndex) => (
                        <div
                          key={postIndex}
                          className="aspect-square bg-neutral-700 rounded flex items-center justify-center"
                        >
                          <ImageIcon className="w-6 h-6 text-neutral-500" />
                        </div>
                      ))
                    : Array.from({ length: 3 }).map((_, postIndex) => (
                        <div
                          key={postIndex}
                          className="aspect-square bg-neutral-700 rounded opacity-30 flex items-center justify-center"
                        >
                          <ImageIcon className="w-6 h-6 text-neutral-500" />
                        </div>
                      ))
                  }
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfilePreview;
