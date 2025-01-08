import React, { useState } from "react";
import LogoutButton from "./LogoutButton";
import ProfilePreview from "./ProfilePreview";

function Generator() {
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
    profilesWithPics: 1, // Default to matching number of profiles
    picTypeDistribution: {
      female: 0,
      male: 0,
      pets: 0,
      random: 0,
    },
    profilesWithPosts: 0,
    postsPerProfile: 0,
  });
  const [progressSummary, setProgressSummary] = useState("1 profiles will be set up");
  const [creditsRequired, setCreditsRequired] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [generatedProfiles, setGeneratedProfiles] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const adminBalance = 100;

  const handleNext = () => {
    // Clear any previous error messages
    setErrorMessage("");
    
    if (step < 4) setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleRedo = () => {
    setStep(1);
    setFormData({
      numProfiles: 1,
      profilesWithPics: 1,
      picTypeDistribution: { female: 0, male: 0, pets: 0, random: 0 },
      profilesWithPosts: 0,
      postsPerProfile: 0,
    });
    setProgressSummary("1 profiles will be set up");
    setCreditsRequired(0);
    setErrorMessage("");
    setShowPreview(false);
    setGeneratedProfiles([]);
    setIsCompleted(false);
  };

  const handleInputChange = (field, value) => {
    const updatedFormData = { 
      ...formData, 
      [field]: value,
      // Always set profilesWithPics to match numProfiles when numProfiles changes
      ...(field === "numProfiles" ? { profilesWithPics: value } : {})
    };
    
    if (field === "profilesWithPosts" && value > 0 && formData.profilesWithPosts === 0) {
      updatedFormData.postsPerProfile = 1;
    }
    if (field === "profilesWithPosts" && value === 0) {
      updatedFormData.postsPerProfile = 0;
    }

    setFormData(updatedFormData);
    updateProgressSummary(updatedFormData);
    calculateCredits(updatedFormData);
  };

  const handlePicTypeChange = (type, value) => {
    const updatedDistribution = {
      ...formData.picTypeDistribution,
      [type]: Math.max(0, Math.min(100, value)),
    };

    const totalPercentage = Object.values(updatedDistribution).reduce(
      (sum, val) => sum + val,
      0
    );

    if (totalPercentage <= 100) {
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
    const { profilesWithPics, profilesWithPosts, postsPerProfile } = data;
    const pictureCredits = profilesWithPics;
    const postCredits = profilesWithPosts * postsPerProfile;
    const totalCredits = pictureCredits + postCredits;

    setCreditsRequired(totalCredits);

    if (totalCredits > adminBalance) {
      setErrorMessage(
        `You need ${totalCredits - adminBalance} more credits to submit this request. Please adjust your selections.`
      );
    } else {
      setErrorMessage("");
    }
  };

  const updateProgressSummary = (data) => {
    const {
      numProfiles,
      profilesWithPics,
      picTypeDistribution,
      profilesWithPosts,
      postsPerProfile,
    } = data;

    let summary = `${numProfiles} profiles will be set up`;

    if (profilesWithPics > 0) {
      const distStrings = Object.entries(picTypeDistribution)
        .filter(([_, percent]) => percent > 0)
        .map(([type, percent]) => `${percent}% ${type}`);
      summary += `, and ${profilesWithPics} out of ${numProfiles} profiles will have profile pictures distributed as: ${distStrings.join(", ")}.`;
    }

    if (profilesWithPosts > 0) {
      summary += ` Additionally, ${profilesWithPosts} profiles will have posts, with ${postsPerProfile} posts per profile.`;
    }

    setProgressSummary(summary);
  };

  const Select = ({ value, onChange, max, placeholder, minValue = 0, disabled = false }) => {
    const options = Array.from(
      { length: (max || 100) - minValue + 1 }, 
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
      {[1, 2, 3, 4].map((num) => (
        <div key={num} className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center
                          ${step === num && !isCompleted ? "bg-blue-500" : 
                            step > num || (step === num && isCompleted) ? "bg-green-500" : "bg-neutral-700"}`}>
            {step > num || (step === num && isCompleted) ? "✓" : num}
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="relative" style={{ minHeight: '200px' }}>
            <AnimatedStep>
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center">How many profiles do you want to set up?</h2>
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
                <div className="bg-neutral-700/50 p-4 rounded-lg text-center text-neutral-300">
                  <p>🖼️ All {formData.numProfiles} profiles will have a unique profile picture</p>
                </div>
              </div>
            </AnimatedStep>
          </div>
        );

      case 2:
        const totalPercentage = Object.values(formData.picTypeDistribution).reduce(
          (sum, val) => sum + val,
          0
        );

        const canProceed = totalPercentage === 100;

        return (
          <div className="relative" style={{ minHeight: '300px' }}>
            <AnimatedStep>
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">Set the distribution of profile picture types</h2>
                  <p className="text-neutral-400">
                    Allocate percentages across different types (must total 100%)
                  </p>
                  <div className={`text-lg font-medium ${canProceed ? 'text-green-400' : 'text-yellow-400'}`}>
                    Current Total: {totalPercentage}%
                    {!canProceed && 
                      <span className="block text-sm mt-1">
                        {totalPercentage < 100 ? `(Need ${100 - totalPercentage}% more)` : `(${totalPercentage - 100}% over limit)`}
                      </span>
                    }
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {["female", "male", "pets", "random"].map((type) => (
                    <div key={type} className="space-y-2">
                      <label className="block font-medium capitalize flex justify-between">
                        <span>{type}</span>
                        <span className="text-neutral-400">{formData.picTypeDistribution[type]}%</span>
                      </label>
                      <Select
                        value={formData.picTypeDistribution[type]}
                        onChange={(value) => handlePicTypeChange(type, value)}
                        max={100}
                        placeholder={`${type} %`}
                      />
                    </div>
                  ))}
                </div>
                {!canProceed && (
                  <div className="mt-4 p-3 bg-yellow-400/20 text-yellow-200 rounded-lg text-sm text-center">
                    Please adjust the percentages to total exactly 100% to continue
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
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block font-medium">Profiles with posts</label>
                    <Select
                      value={formData.profilesWithPosts}
                      onChange={(value) => handleInputChange("profilesWithPosts", value)}
                      max={formData.numProfiles}
                      placeholder="Number of profiles"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-medium">Posts per profile</label>
                    <Select
                      value={formData.postsPerProfile}
                      onChange={(value) => handleInputChange("postsPerProfile", value)}
                      max={20}
                      minValue={1}
                      disabled={formData.profilesWithPosts === 0}
                      placeholder="Max 20 posts"
                    />
                  </div>
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
                  {isCompleted ? "Profiles Generated Successfully!" : "Review and Confirm"}
                </h2>
                {errorMessage && (
                  <div className="bg-red-900/50 text-red-200 p-4 rounded-lg border border-red-500">
                    {errorMessage}
                  </div>
                )}
                <div className="bg-neutral-700/50 p-6 rounded-lg space-y-4">
                  <p className="text-neutral-200">{progressSummary}</p>
                  <div className="flex justify-between text-lg">
                    <p className="text-green-400">
                      Balance: {isCompleted ? adminBalance - creditsRequired : adminBalance}
                    </p>
                    <p className="text-red-400">Credits Required: {creditsRequired}</p>
                  </div>
                  {isCompleted && (
                    <div className="mt-4 p-3 bg-green-900/50 text-green-200 rounded-lg">
                      ✓ Generation completed successfully! Your new balance is {adminBalance - creditsRequired} credits.
                      Scroll down to see the generated profiles.
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
    if (step === 2) {
      const totalPercentage = Object.values(formData.picTypeDistribution).reduce(
        (sum, val) => sum + val,
        0
      );
      return totalPercentage !== 100;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="absolute top-4 right-4">
        <LogoutButton />
      </div>
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-neutral-800 rounded-2xl shadow-xl p-8 space-y-8">
          <ProgressIndicator />
          
          <div className="relative" style={{ minHeight: step === 1 ? '200px' : '300px' }}>
            {renderStep()}
          </div>

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
                  onClick={() => {
                    const profiles = [];
                    let picTypeIndex = 0;
                    const picTypes = Object.entries(formData.picTypeDistribution)
                    .filter(([_, percent]) => percent > 0)
                    .flatMap(([type, percent]) => {
                      const count = Math.round((percent / 100) * formData.profilesWithPics);
                      return Array(count).fill(type);
                    });
                            
                    for (let i = 0; i < formData.numProfiles; i++) {
                      const hasProfilePic = i < formData.profilesWithPics;
                      const hasPosts = i < formData.profilesWithPosts;
                      
                      profiles.push({
                        hasProfilePic,
                        picType: hasProfilePic ? picTypes[picTypeIndex++] : null,
                        posts: hasPosts ? formData.postsPerProfile : 0
                      });
                    }
                    
                    setGeneratedProfiles(profiles);
                    setShowPreview(true);
                    setIsCompleted(true);
                  }}
                  disabled={creditsRequired > adminBalance}
                >
                  Confirm
                </Button>
              )}
            </div>
          </div>

          {step !== 4 && progressSummary && (
            <div className="mt-8 p-4 bg-neutral-700/30 rounded-lg space-y-2">
              <p className="text-neutral-400">Progress so far:</p>
              <p className="text-neutral-200">{progressSummary}</p>
              <div className="flex justify-between text-sm">
                <p className="text-green-400">Balance: {adminBalance}</p>
                <p className="text-red-400">Credits Required: {creditsRequired}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {showPreview && <ProfilePreview profiles={generatedProfiles} />}
    </div>
  );
}

export default Generator;
