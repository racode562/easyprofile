import React from 'react';

const API_URL = process.env.REACT_APP_API_URL;

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

const LoadingImage = () => (
  <div className="animate-pulse bg-neutral-700 w-full h-full flex items-center justify-center">
    <svg className="animate-spin h-8 w-8 text-neutral-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  </div>
);

const InitialLoadingState = () => (
  <div className="flex items-center justify-center p-12">
    <div className="animate-spin h-16 w-16 text-neutral-500">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  </div>
);

const LoadingProfile = () => (
  <div className="bg-neutral-800 rounded-lg p-6 space-y-4 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0">
        <div className="w-16 h-16 rounded-full overflow-hidden">
          <LoadingImage />
        </div>
      </div>
      <div>
        <div className="h-5 bg-neutral-700 rounded w-24"></div>
        <div className="h-4 bg-neutral-700 rounded w-32 mt-2"></div>
      </div>
    </div>
  </div>
);

const ProfilePreview = ({ profiles = [], showHeading = false, className = '', generationProgress = {} }) => {
  // Handle both single profile and array of profiles
  const profilesArray = Array.isArray(profiles) ? profiles : [profiles];

  if (!profilesArray || profilesArray.length === 0) {
    return (
      <div className={className}>
        {showHeading && (
          <h3 className="text-xl font-bold mb-6">Generated Profiles Preview</h3>
        )}
        <InitialLoadingState />
      </div>
    );
  }

  return (
    <div className={className}>
      {showHeading && (
        <h3 className="text-xl font-bold mb-6">Generated Profiles Preview</h3>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Show existing profiles */}
        {profilesArray.map((profile, index) => {
          // Get profile picture (first non-post image)
          const profilePic = profile.images?.find(img => !img.isPost);
          // Get post images
          const posts = profile.images?.filter(img => img.isPost) || [];

          return (
            <div key={profile._id || index} className="bg-neutral-800 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {profilePic ? (
                    <div className="w-16 h-16 rounded-full bg-neutral-700 flex items-center justify-center overflow-hidden">
                      <img 
                        crossOrigin="anonymous" 
                        src={`${API_URL}${profilePic.url}`}
                        alt={`${profile.picType} Profile`} 
                        className="w-full h-full object-cover rounded-full" 
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full overflow-hidden">
                      <LoadingImage />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium">Profile {index + 1}</h4>
                  <p className="text-sm text-neutral-400">
                    {profilePic
                      ? `${profile.picType} profile picture`
                      : 'No profile picture'}
                  </p>
                </div>
              </div>

              {posts.length > 0 && (
                <div className="space-y-3">
                  <div className="h-px bg-neutral-700" />
                  <h5 className="text-sm font-medium flex items-center gap-2">
                    <FileTextIcon className="w-4 h-4" />
                    Posts ({posts.length})
                  </h5>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Show loading placeholders for remaining posts */}
                    {Array.from({ length: profile.posts }).map((_, postIndex) => (
                      <div
                        key={postIndex}
                        className="aspect-square bg-neutral-700 rounded overflow-hidden"
                      >
                        {posts[postIndex] ? (
                          <img
                            crossOrigin="anonymous"
                            src={`${API_URL}${posts[postIndex].url}`}
                            alt={`Post ${postIndex + 1}`}
                            className="w-full h-full object-cover"
                            title={posts[postIndex].prompt}
                          />
                        ) : (
                          <LoadingImage />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {/* Show loading profile if more profiles are coming */}
        {generationProgress.totalProfiles > 0 && 
         generationProgress.currentProfile < generationProgress.totalProfiles && (
          <LoadingProfile />
        )}
      </div>
    </div>
  );
};

export default ProfilePreview;
