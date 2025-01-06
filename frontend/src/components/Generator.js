import React, { useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, LogOut } from "lucide-react";

function Generator() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    numProfiles: 1,
    profilesWithPics: 0,
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

  const adminBalance = 100;

  // Existing handlers remain the same
  const handleNext = () => {
    if (step < 5) setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const handleRedo = () => {
    setStep(1);
    setFormData({
      numProfiles: 1,
      profilesWithPics: 0,
      picTypeDistribution: { female: 0, male: 0, pets: 0, random: 0 },
      profilesWithPosts: 0,
      postsPerProfile: 0,
    });
    setProgressSummary("1 profiles will be set up");
    setCreditsRequired(0);
    setErrorMessage("");
  };

  // Your existing handlers (handleInputChange, handlePicTypeChange, calculateCredits, updateProgressSummary)
  const handleInputChange = (field, value) => {
    const updatedFormData = { ...formData, [field]: value };
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

  const Input = ({ value, onChange, max, placeholder }) => (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Math.max(0, Math.min(max || 100, Number(e.target.value))))}
      className="w-full p-3 border border-neutral-600 rounded-lg bg-neutral-700 text-white 
                 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                 placeholder-neutral-400"
      placeholder={placeholder}
    />
  );

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
      {[1, 2, 3, 4, 5].map((num) => (
        <div key={num} className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center
                          ${step === num ? "bg-blue-500" : 
                            step > num ? "bg-green-500" : "bg-neutral-700"}`}>
            {step > num ? "✓" : num}
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">How many profiles do you want to set up?</h2>
            <Input
              value={formData.numProfiles}
              onChange={(value) => handleInputChange("numProfiles", value)}
              max={100}
              placeholder="Enter number of profiles"
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">How many profiles should have a profile picture?</h2>
            <Input
              value={formData.profilesWithPics}
              onChange={(value) => handleInputChange("profilesWithPics", value)}
              max={formData.numProfiles}
              placeholder="Enter number of profiles with pictures"
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Set the distribution of profile picture types</h2>
            <div className="grid grid-cols-2 gap-6">
              {["female", "male", "pets", "random"].map((type) => (
                <div key={type} className="space-y-2">
                  <label className="block font-medium capitalize">{type}</label>
                  <Input
                    value={formData.picTypeDistribution[type]}
                    onChange={(value) => handlePicTypeChange(type, value)}
                    placeholder={`${type} %`}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Posts Configuration</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block font-medium">Profiles with posts</label>
                <Input
                  value={formData.profilesWithPosts}
                  onChange={(value) => handleInputChange("profilesWithPosts", value)}
                  max={formData.numProfiles}
                  placeholder="Number of profiles"
                />
              </div>
              <div className="space-y-2">
                <label className="block font-medium">Posts per profile</label>
                <Input
                  value={formData.postsPerProfile}
                  onChange={(value) => handleInputChange("postsPerProfile", value)}
                  max={20}
                  placeholder="Max 20 posts"
                />
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Review and Confirm</h2>
            {errorMessage && (
              <div className="bg-red-900/50 text-red-200 p-4 rounded-lg border border-red-500">
                {errorMessage}
              </div>
            )}
            <div className="bg-neutral-700/50 p-6 rounded-lg space-y-4">
              <p className="text-neutral-200">{progressSummary}</p>
              <div className="flex justify-between text-lg">
                <p className="text-green-400">Balance: {adminBalance}</p>
                <p className="text-red-400">Credits Required: {creditsRequired}</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-neutral-800 rounded-2xl shadow-xl p-8 space-y-8">
          <ProgressIndicator />
          
          {renderStep()}

          <div className="flex justify-between items-center pt-8">
            <Button variant="danger" onClick={handleRedo}>
              <RotateCcw size={18} />
              Reset
            </Button>
            
            <div className="flex gap-4">
              {step > 1 && (
                <Button variant="secondary" onClick={handleBack}>
                  <ArrowLeft size={18} />
                  Back
                </Button>
              )}
              
              {step < 5 ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight size={18} />
                </Button>
              ) : (
                <Button 
                  variant="success"
                  onClick={() => alert("Profiles are being created!")}
                  disabled={creditsRequired > adminBalance}
                >
                  Confirm
                </Button>
              )}
            </div>
          </div>

          {step !== 5 && progressSummary && (
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
    </div>
  );
}

export default Generator;