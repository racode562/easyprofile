import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import ProfilePreview from "./ProfilePreview";
import api from "../api";

function Generator() {
  const navigate = useNavigate();
  // AnimatedStep component - single definition at the top
  const AnimatedStep = ({ children }) => {
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }, []);

    return (
      <div
        className={`transition-all duration-500 ease-in-out transform
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        {children}
      </div>
    );
  };

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    numProfiles: 1,
    skipProfilePictures: false,
    profilesWithPics: 1,
    picTypeDistribution: {
      female: 0,
      male: 0,
      pets: 0,
      random: 0,
    }, // These now store quantities instead of percentages
    profilesWithPosts: 0,
    minPostsPerProfile: 1,
    maxPostsPerProfile: 3,
  });
  const [progressSummary, setProgressSummary] = useState("1 profiles will be set up");
  const [creditsRequired, setCreditsRequired] = useState(0);
  const [actualCreditsUsed, setActualCreditsUsed] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [generatedProfiles, setGeneratedProfiles] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({
    progress: 0,
    currentPicture: 0,
    totalPictures: 0,
    currentProfile: 0,
    totalProfiles: 0,
    remainingProfiles: 0,
    remainingPictures: 0
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [userCredits, setUserCredits] = useState(0);

  // Fetch user credits on component mount
  React.useEffect(() => {
    const fetchUserCredits = async () => {
      try {
        const response = await api.get('/api/auth/me');
        setUserCredits(Number(response.data.credits) || 0);
      } catch (error) {
        console.error('Failed to fetch user credits:', error);
        setUserCredits(0);
      }
    };
    fetchUserCredits();
  }, []);

  const handleNext = () => {
    setErrorMessage("");
    if (step === 1 && formData.skipProfilePictures) {
      setStep(3);
    } else if (step < 4) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      if (step === 3 && formData.skipProfilePictures) {
        setStep(1);
      } else {
        setStep((prev) => prev - 1);
      }
    }
  };

  const handleRedo = async () => {
    try {
      const response = await api.get('/api/auth/me');
      setUserCredits(Number(response.data.credits) || 0);
      
      setStep(1);
      setFormData({
        numProfiles: 1,
        skipProfilePictures: false,
        profilesWithPics: 1,
        picTypeDistribution: { female: 0, male: 0, pets: 0, random: 0 },
        profilesWithPosts: 0,
        minPostsPerProfile: 1,
        maxPostsPerProfile: 3,
      });
      setProgressSummary("1 profiles will be set up");
      setCreditsRequired(0);
      setActualCreditsUsed(0);
      setErrorMessage("");
      setShowPreview(false);
      setGeneratedProfiles([]);
      setIsCompleted(false);
      setGenerationProgress({
        progress: 0,
        currentPicture: 0,
        totalPictures: 0,
        currentProfile: 0,
        totalProfiles: 0,
        remainingProfiles: 0,
        remainingPictures: 0
      });
      setIsGenerating(false);
    } catch (error) {
      console.error('Failed to fetch user credits:', error);
    }
  };

  const handleInputChange = (field, value) => {
    const updatedFormData = { 
      ...formData, 
      [field]: value,
      ...(field === "numProfiles" ? { 
        profilesWithPics: formData.skipProfilePictures ? 0 : value,
        profilesWithPosts: formData.skipProfilePictures ? value : formData.profilesWithPosts,
        picTypeDistribution: { female: 0, male: 0, pets: 0, random: 0 } // Reset distribution when number changes
      } : {}),
      ...(field === "skipProfilePictures" ? {
        profilesWithPics: value ? 0 : formData.numProfiles,
        profilesWithPosts: value ? formData.numProfiles : 0,
        minPostsPerProfile: value ? 1 : formData.minPostsPerProfile,
        maxPostsPerProfile: value ? 3 : formData.maxPostsPerProfile,
        picTypeDistribution: value ? {
          female: 0,
          male: 0,
          pets: 0,
          random: 0,
        } : formData.picTypeDistribution
      } : {})
    };
    
    if (!formData.skipProfilePictures) {
      if (field === "profilesWithPosts" && value > 0 && formData.profilesWithPosts === 0) {
        updatedFormData.minPostsPerProfile = 1;
        updatedFormData.maxPostsPerProfile = 3;
      }
      if (field === "profilesWithPosts" && value === 0) {
        updatedFormData.minPostsPerProfile = 1;
        updatedFormData.maxPostsPerProfile = 3;
      }
    }

    setFormData(updatedFormData);
    updateProgressSummary(updatedFormData);
    calculateCredits(updatedFormData);
  };

  const handlePicTypeChange = (type, value) => {
    const updatedDistribution = {
      ...formData.picTypeDistribution,
      [type]: Math.max(0, Math.min(formData.numProfiles, value)),
    };

    const totalQuantity = Object.values(updatedDistribution).reduce(
      (sum, val) => sum + val,
      0
    );

    if (totalQuantity <= formData.numProfiles) {
      const updatedFormData = {
        ...formData,
        picTypeDistribution: updatedDistribution,
      };
      setFormData(updatedFormData);
      calculateCredits(updatedFormData);
      updateProgressSummary(updatedFormData);
    }
  };

  const calculateCredits = (data) => {
    const { skipProfilePictures, profilesWithPics, profilesWithPosts, maxPostsPerProfile } = data;
    const pictureCredits = skipProfilePictures ? 0 : Number(profilesWithPics);
    const postCredits = Number(profilesWithPosts) * Number(maxPostsPerProfile);
    const totalCredits = pictureCredits + postCredits;

    setCreditsRequired(totalCredits);

    if (totalCredits > userCredits) {
      setErrorMessage(
        `You need ${totalCredits - userCredits} more credits to submit this request. This is calculated using the maximum possible posts (${maxPostsPerProfile} per profile) to ensure you have enough balance. You can either add more credits or reduce the maximum posts per profile.`
      );
    } else {
      setErrorMessage("");
    }
  };

  const updateProgressSummary = (data) => {
    const {
      numProfiles,
      skipProfilePictures,
      profilesWithPics,
      picTypeDistribution,
      profilesWithPosts,
      minPostsPerProfile,
      maxPostsPerProfile,
    } = data;

    let summary;
    
    if (skipProfilePictures) {
      summary = `${numProfiles} profiles will be created with ${minPostsPerProfile}-${maxPostsPerProfile} posts each (no profile pictures)`;
    } else {
      summary = `${numProfiles} profiles will be set up`;
      
      if (profilesWithPics > 0) {
        const distStrings = Object.entries(picTypeDistribution)
          .filter(([_, quantity]) => quantity > 0)
          .map(([type, quantity]) => `${quantity} ${type}`);
        summary += `, and ${profilesWithPics} out of ${numProfiles} profiles will have profile pictures distributed as: ${distStrings.join(", ")}.`;
      }

      if (profilesWithPosts > 0) {
        summary += ` Additionally, ${profilesWithPosts} profiles will have posts, with ${minPostsPerProfile}-${maxPostsPerProfile} posts per profile.`;
      }
    }

    setProgressSummary(summary);
  };

  const generateProfiles = async () => {
    setIsGenerating(true);
    setGenerationProgress({
      progress: 0,
      currentPicture: 0,
      totalPictures: 0,
      currentProfile: 0,
      totalProfiles: 0,
      remainingProfiles: 0,
      remainingPictures: 0
    });
    setGeneratedProfiles([]);
    setShowPreview(true);
    setActualCreditsUsed(0);
    
    try {
      const params = new URLSearchParams({
        ...formData,
        picTypeDistribution: JSON.stringify(
          Object.fromEntries(
            Object.entries(formData.picTypeDistribution).filter(([_, v]) => v > 0)
          )
        )
      });

      const eventSource = new EventSource(
        `${process.env.REACT_APP_API_URL}/api/profiles/generate?${params}`,
        { withCredentials: true }
      );

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.error) {
          setErrorMessage(data.error);
          setIsGenerating(false);
          eventSource.close();
          return;
        }

        if (data.complete) {
          setIsCompleted(true);
          setIsGenerating(false);
          eventSource.close();
          return;
        }

        if (data.profile && data.progress) {
          console.log('Received progress data:', data.progress);
          if (typeof data.progress === 'object') {
            setGenerationProgress(data.progress);
          } else {
            // Handle legacy format or incorrect data
            console.warn('Received invalid progress format:', data.progress);
            setGenerationProgress(prev => ({
              ...prev,
              progress: data.progress
            }));
          }
          setGeneratedProfiles(prev => {
            // Find if we already have this profile
            const existingProfileIndex = prev.findIndex(p => p._id === data.profile._id);
            
            if (existingProfileIndex === -1) {
              // New profile - add it with jobId
              return [...prev, {
                ...data.profile,
                jobId: data.profile.jobId // Ensure jobId is included
              }];
            } else {
              // Existing profile - merge the new image
              const updatedProfiles = [...prev];
              const existingProfile = updatedProfiles[existingProfileIndex];
              
              // Add the new image to existing profile's images
              updatedProfiles[existingProfileIndex] = {
                ...existingProfile,
                jobId: data.profile.jobId, // Ensure jobId is included
                images: [...existingProfile.images, ...data.profile.images]
              };
              
              return updatedProfiles;
            }
          });
          
          // Calculate credits used for this profile
          console.log('Profile data:', data.profile);
          
          // Handle profile pictures
          const images = Array.isArray(data.profile.images) ? data.profile.images : [];
          const profilePicCredits = images.length;
          
          // Handle posts
          const posts = Array.isArray(data.profile.posts) ? data.profile.posts : [];
          const postCredits = posts.length;
          
          // Calculate total credits for this profile
          const profileCredits = profilePicCredits + postCredits;
          
          console.log('Credit calculation:', {
            profile: data.profile,
            hasImages: !!data.profile.images,
            hasPosts: !!data.profile.posts,
            imagesLength: images.length,
            postsLength: posts.length,
            profilePicCredits,
            postCredits,
            profileCredits
          });
          
          // Update total credits used and user balance in real-time
          setActualCreditsUsed(prev => {
            const prevNum = Number(prev || 0);
            const newTotal = prevNum + profileCredits;
            console.log('Credits update:', { 
              prevCredits: prevNum, 
              addedCredits: profileCredits, 
              newTotal,
              actualCreditsUsed
            });
            return newTotal;
          });
          
          setUserCredits(prev => {
            const prevNum = Number(prev || 0);
            const newBalance = prevNum - profileCredits;
            console.log('Balance update:', { 
              prevBalance: prevNum, 
              deductedCredits: profileCredits, 
              newBalance,
              userCredits
            });
            return newBalance;
          });
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        setErrorMessage('Connection error occurred');
        setIsGenerating(false);
        eventSource.close();
      };

    } catch (error) {
      console.error('Profile generation error:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to generate profiles');
      setIsGenerating(false);
    }
  };

  const Select = ({ value, onChange, max, placeholder, minValue = 0, disabled = false, remainingProfiles = null }) => {
    const effectiveMax = remainingProfiles !== null ? Math.min(max, value + remainingProfiles) : max;
    const options = Array.from(
      { length: (effectiveMax || 100) - minValue + 1 }, 
      (_, i) => i + minValue
    );

    return (
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        disabled={disabled}
        className="w-full p-3 border border-neutral-600 rounded-lg bg-neutral-700 text-white 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                   placeholder-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {options.map((num) => (
          <option key={num} value={num}>
            {num}
          </option>
        ))}
      </select>
    );
  };

  const Button = ({ onClick, disabled, variant = "primary", children, className = "" }) => {
    const baseStyles = "px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2";
    const variants = {
      primary: `${disabled ? "bg-neutral-600" : "bg-blue-600 hover:bg-blue-500"} text-white`,
      secondary: "bg-neutral-700 text-white hover:bg-neutral-600",
      danger: "bg-red-600 hover:bg-red-500 text-white",
      success: "bg-green-600 hover:bg-green-500 text-white"
    };

    return (
      <button 
        onClick={onClick}
        disabled={disabled}
        className={`${baseStyles} ${variants[variant]} ${className}`}
      >
        {children}
      </button>
    );
  };

  const ProgressIndicator = () => (
    <div className="flex justify-between mb-8 px-4">
      {[1, 2, 3, 4].map((num) => {
        if (num === 2 && formData.skipProfilePictures) {
          return null;
        }
        return (
          <div key={num} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center
                            ${step === num && !isCompleted ? "bg-blue-500" : 
                              step > num || (step === num && isCompleted) ? "bg-green-500" : "bg-neutral-700"}`}>
              {step > num || (step === num && isCompleted) ? "✓" : 
               formData.skipProfilePictures && num > 2 ? num - 1 : num}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="relative" style={{ minHeight: '200px' }}>
            <AnimatedStep>
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center">
                  {formData.skipProfilePictures 
                    ? "How many profiles with posts do you want to set up?" 
                    : "How many profiles do you want to set up?"}
                </h2>
                <div className="flex justify-center">
                  <div className="w-1/2">
                    <Select
                      value={formData.numProfiles}
                      onChange={(value) => handleInputChange("numProfiles", value)}
                      max={100}
                      minValue={1}
                      placeholder="Enter number of profiles"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 bg-neutral-700/50 p-4 rounded-lg">
                    <input
                      type="checkbox"
                      id="skipProfilePictures"
                      checked={formData.skipProfilePictures}
                      onChange={(e) => handleInputChange("skipProfilePictures", e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-600"
                    />
                    <label htmlFor="skipProfilePictures" className="text-neutral-300">
                      Skip profile pictures for this job only do posts
                    </label>
                  </div>
                  {!formData.skipProfilePictures && (
                    <div className="bg-neutral-700/50 p-4 rounded-lg text-center text-neutral-300">
                      <p>🖼️ All {formData.numProfiles} profiles will have a unique profile picture</p>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedStep>
          </div>
        );

      case 2:
        if (formData.skipProfilePictures) {
          return null;
        }

        const totalQuantity = Object.values(formData.picTypeDistribution).reduce(
          (sum, val) => sum + val,
          0
        );

        const canProceed = totalQuantity === formData.numProfiles;

        const remainingToAllocate = formData.numProfiles - totalQuantity;

        return (
          <div className="relative" style={{ minHeight: '300px' }}>
            <AnimatedStep>
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">Set the distribution of profile picture types</h2>
                  <p className="text-neutral-400">
                    Allocate quantities across different types (must total {formData.numProfiles})
                  </p>
                  <div className={`text-lg font-medium ${canProceed ? 'text-green-400' : 'text-yellow-400'}`}>
                    Current Total: {totalQuantity} profiles
                    {!canProceed && 
                      <span className="block text-sm mt-1">
                        {remainingToAllocate > 0 ? 
                          `(${remainingToAllocate} profiles left to allocate)` : 
                          `(${Math.abs(remainingToAllocate)} over limit)`}
                      </span>
                    }
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {["female", "male", "pets", "random"].map((type) => {
                    const currentValue = formData.picTypeDistribution[type];
                    const isDisabled = remainingToAllocate === 0 && currentValue === 0;
                    
                    return (
                      <div key={type} className="space-y-2">
                        <label className="block font-medium capitalize flex justify-between">
                          <span>{type}</span>
                          <span className="text-neutral-400">{currentValue} profiles</span>
                        </label>
                        <Select
                          value={currentValue}
                          onChange={(value) => handlePicTypeChange(type, value)}
                          max={formData.numProfiles}
                          placeholder={`${type} profiles`}
                          disabled={isDisabled}
                          remainingProfiles={remainingToAllocate}
                        />
                      </div>
                    );
                  })}
                </div>
                {!canProceed && (
                  <div className="mt-4 p-3 bg-yellow-400/20 text-yellow-200 rounded-lg text-sm text-center">
                    Please adjust the quantities to total exactly {formData.numProfiles} to continue
                  </div>
                )}
              </div>
            </AnimatedStep>
          </div>
        );

      case 3:
        return (
          <div className="relative" style={{ minHeight: '300px' }}>
            <AnimatedStep>
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center">Posts Configuration</h2>
                <div className={formData.skipProfilePictures ? "space-y-6" : "grid grid-cols-2 gap-6"}>
                  {!formData.skipProfilePictures && (
                    <div className="space-y-2">
                      <label className="block font-medium">Profiles with posts</label>
                      <Select
                        value={formData.profilesWithPosts}
                        onChange={(value) => handleInputChange("profilesWithPosts", value)}
                        max={formData.numProfiles}
                        placeholder="Number of profiles"
                      />
                    </div>
                  )}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block font-medium">Minimum posts per profile</label>
                      <Select
                        value={formData.minPostsPerProfile}
                        onChange={(value) => {
                          const updatedFormData = {
                            ...formData,
                            minPostsPerProfile: value,
                            maxPostsPerProfile: Math.max(value, formData.maxPostsPerProfile)
                          };
                          setFormData(updatedFormData);
                          calculateCredits(updatedFormData);
                          updateProgressSummary(updatedFormData);
                        }}
                        max={20}
                        minValue={1}
                        disabled={!formData.skipProfilePictures && formData.profilesWithPosts === 0}
                        placeholder="Min posts"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block font-medium">Maximum posts per profile</label>
                      <Select
                        value={formData.maxPostsPerProfile}
                        onChange={(value) => {
                          const updatedFormData = {
                            ...formData,
                            maxPostsPerProfile: value,
                            minPostsPerProfile: Math.min(value, formData.minPostsPerProfile)
                          };
                          setFormData(updatedFormData);
                          calculateCredits(updatedFormData);
                          updateProgressSummary(updatedFormData);
                        }}
                        max={20}
                        minValue={formData.minPostsPerProfile}
                        disabled={!formData.skipProfilePictures && formData.profilesWithPosts === 0}
                        placeholder="Max posts"
                      />
                    </div>
                  </div>
                </div>
                <div className="text-sm text-neutral-400 text-center">
                  Note: Each profile will randomly receive between {formData.minPostsPerProfile} and {formData.maxPostsPerProfile} posts.
                  Credits are calculated using the maximum to ensure sufficient balance.
                </div>
              </div>
            </AnimatedStep>
          </div>
        );

      case 4:
        return (
          <div className="relative" style={{ minHeight: '300px' }}>
            <AnimatedStep>
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center">
                  {isGenerating ? "Generating Profiles..." : 
                   isCompleted ? "Profiles Generated Successfully!" : 
                   "Review and Confirm"}
                </h2>
                {errorMessage && (
                  <div className="bg-red-900/50 text-red-200 p-4 rounded-lg border border-red-500">
                    {errorMessage}
                  </div>
                )}
                {isGenerating && (
                  <div className="bg-yellow-900/50 text-yellow-200 p-4 rounded-lg border border-yellow-500 mb-4">
                    ⚠️ Please do not refresh the page while your profiles are being generated. You can monitor the progress below.
                  </div>
                )}
                {isGenerating && (
                  <div className="space-y-4">
                    <div className="w-full bg-neutral-700 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${generationProgress.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-neutral-300 space-y-2">
                      <p>Overall Progress: {generationProgress.progress}%</p>
                      <p>Pictures Created: {generationProgress.currentPicture} / {generationProgress.totalPictures}</p>
                      <p>Profiles Created: {generationProgress.currentProfile} / {generationProgress.totalProfiles}</p>
                      <p>Remaining: {generationProgress.remainingProfiles} profiles ({generationProgress.remainingPictures} pictures)</p>
                    </div>
                  </div>
                )}
                <div className="bg-neutral-700/50 p-6 rounded-lg space-y-4">
                  <p className="text-neutral-200">{progressSummary}</p>
                  <div className="flex justify-between text-lg">
                    <p className="text-green-400">
                      Balance: {userCredits}
                    </p>
                    <p className="text-red-400">Maximum Credits Required: {creditsRequired} (actual usage may be lower)</p>
                  </div>
                  {isCompleted && (
                    <div className="mt-4 space-y-3">
                      <div className="p-3 bg-green-900/50 text-green-200 rounded-lg">
                        ✓ Generation completed successfully! {actualCreditsUsed} credits were used. Your new balance is {userCredits} credits.
                        Scroll down to see the generated profiles.
                      </div>
                      <div className="p-3 bg-blue-900/50 text-blue-200 rounded-lg">
                        💡 Tip: Click the "View & Download Previous Jobs" button in the top right corner to access this job and previous jobs' details, where you can also download your generated images.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedStep>
          </div>
        );
      default:
        return null;
    }
  };

  const isNextButtonDisabled = () => {
    if (step === 2 && !formData.skipProfilePictures) {
      const totalQuantity = Object.values(formData.picTypeDistribution).reduce(
        (sum, val) => sum + val,
        0
      );
      return totalQuantity !== formData.numProfiles;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="absolute top-4 right-4 flex gap-4">
        <Link 
          to="/jobs"
          className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          📋⬇️ View & Download Previous Jobs
        </Link>
        <LogoutButton />
      </div>
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-neutral-800 rounded-2xl shadow-xl p-8 space-y-8">
          <ProgressIndicator />
          
          <div className="relative" style={{ minHeight: step === 1 ? '200px' : '300px' }}>
            {renderStep()}
          </div>

          {(!isGenerating && !isCompleted) && (
            <div className="flex justify-between items-center pt-8">
              <Button variant="danger" onClick={handleRedo}>
                ↺ Reset
              </Button>
              
              <div className="flex gap-4">
                {step > 1 && (
                  <Button variant="secondary" onClick={handleBack}>
                    ← Back
                  </Button>
                )}
                
                {step < 4 ? (
                  <Button 
                    onClick={handleNext}
                    disabled={isNextButtonDisabled()}
                  >
                    Next →
                  </Button>
                ) : (
                  <Button 
                    variant="success"
                    onClick={generateProfiles}
                    disabled={creditsRequired > userCredits || isGenerating}
                  >
                    Confirm
                  </Button>
                )}
              </div>
            </div>
          )}
          {isCompleted && (
            <div className="flex justify-center pt-8">
              <Button variant="primary" onClick={handleRedo}>
                Create New Job
              </Button>
            </div>
          )}

          {step !== 4 && progressSummary && (
            <div className="mt-8 p-4 bg-neutral-700/30 rounded-lg space-y-2">
              <p className="text-neutral-400">Progress so far:</p>
              <p className="text-neutral-200">{progressSummary}</p>
              <div className="flex justify-between text-sm">
                <p className="text-green-400">Balance: {userCredits}</p>
                <p className="text-red-400">Maximum Credits Required: {creditsRequired} (actual usage may be lower)</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {showPreview && (
        <ProfilePreview 
          profiles={generatedProfiles} 
          showHeading={true}
          className="mt-8 space-y-6 px-[100px]"
          generationProgress={generationProgress}
          isCompleted={isCompleted}
        />
      )}
    </div>
  );
}

export default Generator;
