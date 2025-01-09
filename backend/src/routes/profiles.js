const express = require('express');
const router = express.Router();
const { fal } = require("@fal-ai/client");
const fs = require('fs-extra');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');
const { authenticateToken } = require('./auth');

// Configure FAL AI client
fal.config({
  credentials: process.env.FAL_API_KEY
});

// Prompts for different profile types
const FEMALE_PROMPTS = [
  'low quality grainy picture of a woman from far away in 2009.jpg',
  'close_up_woman_low_quality_selfie_casual_top_angle.jpg',
  'close_up_woman_low_quality_selfie_casual_bottom_angle.jpg',
  'close_up_woman_low_quality_selfie_casual_side_angle.jpg',
  'solo_low_quality_selfie_casual_car.jpg',
  'solo_low_quality_selfie_casual_beach_woman.jpg',
  'low quality grainy picture of a woman taken at a park in 2004 from different angles',
  'low quality grainy picture of a  woman taken at a beach in 2004.jpg',
  'low quality grainy picture of a woman taken at a hike in 2004.jpg',
  'low quality grainy picture of a woman taken at a ballroom in 2004.jpg',
  'low quality grainy picture of a young woman taken at a library in 2004.jpg',
  'low quality grainy picture of a woman taken at a library in 2004.jpg',
  'low quality grainy picture of a woman taken at a library in 2004.jpg',
  'low quality grainy picture of a woman taken at a party in 2004.jpg',
  'close_up_woman_low_quality_selfie_casual.jpg',
  'close_up_woman_low_quality_selfie.jpg',
  'akward_close_up_woman_low_quality_selfie.jpg',
  'photo_of_instagram_woman_casual_far.heic',
  'photo_of_instagram_woman_casual.heic',
  'photo_of_instagram_woman_casual_selfie.heic',
  'photo_of_instagram_woman_casual_far_glasses.heic',
  'photo_of_instagram_woman_casual_far_street_photography.heic',
  'photo_of_instagram_woman_casual_far_street_photography_black_and_white.heic'
];

const MALE_PROMPTS = [
  'low quality grainy picture of a man from far away in 2009.jpg',
  'close_up_man_low_quality_selfie_casual_top_angle.jpg',
  'close_up_man_low_quality_selfie_casual_bottom_angle.jpg',
  'close_up_man_low_quality_selfie_casual_side_angle.jpg',
  'solo_low_quality_selfie_casual_car.jpg',
  'solo_low_quality_selfie_casual_beach_man.jpg',
  'low quality grainy picture of a man taken at a park in 2004 from different angles',
  'low quality grainy picture of a  man taken at a beach in 2004.jpg',
  'low quality grainy picture of a man taken at a hike in 2004.jpg',
  'low quality grainy picture of a man taken at a ballroom in 2004.jpg',
  'low quality grainy picture of a young man taken at a library in 2004.jpg',
  'low quality grainy picture of a man taken at a library in 2004.jpg',
  'low quality grainy picture of a man taken at a library in 2004.jpg',
  'low quality grainy picture of a man taken at a party in 2004.jpg',
  'close_up_man_low_quality_selfie_casual.jpg',
  'close_up_man_low_quality_selfie.jpg',
  'akward_close_up_man_low_quality_selfie.jpg',
  'photo_of_instagram_man_casual_far.heic',
  'photo_of_instagram_man_casual.heic',
  'photo_of_instagram_man_casual_selfie.heic',
  'photo_of_instagram_man_casual_far_glasses.heic',
  'photo_of_instagram_man_casual_far_street_photography.heic',
  'photo_of_instagram_man_casual_far_street_photography_black_and_white.heic'
];

const PET_PROMPTS = [
  'pet_instagram_selfie_low_quality.jpg',
  'pet_instagram_selfie.jpg',
  'dog_instagram_selfie_low_quality.jpg',
  'cat_instagram_selfie_low_quality.jpg',
  'dog_instagram_selfie.jpg',
  'cat_instagram_selfie.jpg'
]

const PROMPTS = {
  female: () => FEMALE_PROMPTS[Math.floor(Math.random() * FEMALE_PROMPTS.length)],
  male: () => MALE_PROMPTS[Math.floor(Math.random() * MALE_PROMPTS.length)],
  pets: () => PET_PROMPTS[Math.floor(Math.random() * PET_PROMPTS.length)],
  random: 'random_instagram.jpg'
};

// Post prompts for different profile types
const POST_PROMPTS = {
  female: [
    'instagram.heic',
    'instagram_food.heic',
    'instagram_nature.heic',
    'instagram_travel.heic',
    'instagram_inside_plane_travel.heic',
    'instagram_beach.heic',
    'instagram_mountains.heic',
    'instagram_street_photography.heic',
    'instagram_woman_friends.heic',
    'instagram_woman_food.heic',
    'instagram_women_nature_no_face.heic',
    'instagram_women_facing_away.heic',
    'instagram_women_city_facing_away.jpg',
    'instagram_woman_pet.heic',
    'instagram_woman_dog.heic',
    'instagram_dog.heic',
    'instagram_dog.jpg',
    'instagram_cat.jpg',
    'instagram_cat.heic',
    'low quality grainy picture of a party taken at a library in 2004.jpg',
    'low quality grainy picture of a party taken at a park in 2004.jpg',
    'low quality grainy picture of a party taken in a ballroom in 2009.jpg',
    'low quality grainy picture of travelling in 2009.jpg',
    'low quality grainy picture of a big city in 2009.jpg',
    'low quality grainy picture of a party taken in a big city in 2009.jpg',
    'low quality grainy picture of a party taken in a bar in 2009.jpg',
    'low quality grainy picture of a group of friends having dinner in 2009.jpg',
  ],
  male: [
    'instagram.heic',
    'instagram_food.heic',
    'instagram_nature.heic',
    'instagram_travel.heic',
    'instagram_inside_plane_travel.heic',
    'instagram_beach.heic',
    'instagram_mountains.heic',
    'instagram_street_photography.heic',
    'instagram_man_friends.heic',
    'instagram_man_food.heic',
    'instagram_man_nature_no_face.heic',
    'instagram_man_facing_away.heic',
    'instagram_man_city_facing_away.jpg',
    'instagram_man_pet.heic',
    'instagram_man_dog.heic',
    'instagram_dog.heic',
    'instagram_dog.jpg',
    'instagram_cat.jpg',
    'instagram_cat.heic',
    'low quality grainy picture of a party taken at a library in 2004.jpg',
    'low quality grainy picture of a party taken at a park in 2004.jpg',
    'low quality grainy picture of a party taken in a ballroom in 2009.jpg',
    'low quality grainy picture of travelling in 2009.jpg',
    'low quality grainy picture of a big city in 2009.jpg',
    'low quality grainy picture of a party taken in a big city in 2009.jpg',
    'low quality grainy picture of a party taken in a bar in 2009.jpg',
    'low quality grainy picture of a group of friends having dinner in 2009.jpg',
  ],
  pets: [
    'instagram.heic',
    'instagram_food.heic',
    'instagram_nature.heic',
    'instagram_travel.heic',
    'instagram_inside_plane_travel.heic',
    'instagram_beach.heic',
    'instagram_mountains.heic',
    'instagram_street_photography.heic',
    'instagram_man_friends.heic',
    'instagram_man_food.heic',
    'instagram_man_nature_no_face.heic',
    'instagram_man_facing_away.heic',
    'instagram_man_city_facing_away.jpg',
    'instagram_man_pet.heic',
    'instagram_man_dog.heic',
    'instagram_woman_friends.heic',
    'instagram_woman_food.heic',
    'instagram_women_nature_no_face.heic',
    'instagram_women_facing_away.heic',
    'instagram_women_city_facing_away.jpg',
    'instagram_woman_pet.heic',
    'instagram_woman_dog.heic',
    'instagram_dog.heic',
    'instagram_dog.jpg',
    'instagram_cat.jpg',
    'instagram_cat.heic',
    'low quality grainy picture of a party taken at a library in 2004.jpg',
    'low quality grainy picture of a party taken at a park in 2004.jpg',
    'low quality grainy picture of a party taken in a ballroom in 2009.jpg',
    'low quality grainy picture of travelling in 2009.jpg',
    'low quality grainy picture of a big city in 2009.jpg',
    'low quality grainy picture of a party taken in a big city in 2009.jpg',
    'low quality grainy picture of a party taken in a bar in 2009.jpg',
    'low quality grainy picture of a group of friends having dinner in 2009.jpg',
  ],
  random: [
    'instagram.heic',
    'instagram_food.heic',
    'instagram_nature.heic',
    'instagram_travel.heic',
    'instagram_inside_plane_travel.heic',
    'instagram_beach.heic',
    'instagram_mountains.heic',
    'instagram_street_photography.heic',
    'instagram_man_friends.heic',
    'instagram_man_food.heic',
    'instagram_man_nature_no_face.heic',
    'instagram_man_facing_away.heic',
    'instagram_man_city_facing_away.jpg',
    'instagram_man_pet.heic',
    'instagram_man_dog.heic',
    'instagram_woman_friends.heic',
    'instagram_woman_food.heic',
    'instagram_women_nature_no_face.heic',
    'instagram_women_facing_away.heic',
    'instagram_women_city_facing_away.jpg',
    'instagram_woman_pet.heic',
    'instagram_woman_dog.heic',
    'instagram_dog.heic',
    'instagram_dog.jpg',
    'instagram_cat.jpg',
    'instagram_cat.heic',
    'low quality grainy picture of a party taken at a library in 2004.jpg',
    'low quality grainy picture of a party taken at a park in 2004.jpg',
    'low quality grainy picture of a party taken in a ballroom in 2009.jpg',
    'low quality grainy picture of travelling in 2009.jpg',
    'low quality grainy picture of a big city in 2009.jpg',
    'low quality grainy picture of a party taken in a big city in 2009.jpg',
    'low quality grainy picture of a party taken in a bar in 2009.jpg',
    'low quality grainy picture of a group of friends having dinner in 2009.jpg',
  ]
};

// Helper function to get a random prompt based on profile type
function getRandomPostPrompt(picType) {
  // If no picType is provided (when skipProfilePictures is true), use random prompts
  const prompts = picType ? POST_PROMPTS[picType] : POST_PROMPTS.random;
  const randomIndex = Math.floor(Math.random() * prompts.length);
  return prompts[randomIndex];
}

// Generate and save image (profile picture or post)
async function generateImage(picType, username, profileId, imageIndex, isPost = false) {
  try {
    console.log('Starting profile picture generation...');
    console.log('Current directory:', __dirname);
    
    // Create absolute paths
    const uploadsDir = path.resolve('/app/uploads');
    const profilePicsDir = path.join(uploadsDir, 'profile_pictures');
    const userDir = path.join(profilePicsDir, username);
    const profileDir = path.join(userDir, profileId.toString());

    console.log('Directories to create:');
    console.log('- Uploads:', uploadsDir);
    console.log('- Profile Pictures:', profilePicsDir);
    console.log('- User Directory:', userDir);
    console.log('- Profile Directory:', profileDir);

    // Create directories one by one
    try {
      await fs.ensureDir(uploadsDir);
      console.log('Created uploads directory');
      
      await fs.ensureDir(profilePicsDir);
      console.log('Created profile_pictures directory');
      
      await fs.ensureDir(userDir);
      console.log('Created user directory');
      
      await fs.ensureDir(profileDir);
      console.log('Created profile directory');
    } catch (dirError) {
      console.error('Directory creation error:', dirError);
      throw dirError;
    }

    // Generate image via FAL AI
    const prompt = isPost ? getRandomPostPrompt(picType) : (typeof PROMPTS[picType] === 'function' ? PROMPTS[picType]() : PROMPTS[picType]);
    console.log(`Generating ${isPost ? 'post' : 'profile picture'} with prompt: ${prompt}`);
    
    try {
      console.log('Making API request to FAL AI...');
      const result = await fal.subscribe("fal-ai/flux-pro/v1.1", {
        input: {
          prompt: prompt,
          image_size: "square_hd",
          num_images: 1,
          enable_safety_checker: true,
          safety_tolerance: "2",
          output_format: "jpeg"
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      });

      console.log('FAL AI Response:', result);

      if (!result.data || !result.data.images || !result.data.images[0]) {
        console.error('Invalid API response:', result);
        throw new Error('Invalid response from FAL AI API');
      }

      // Save image to filesystem
      const prefix = isPost ? 'post' : 'profile';
      const filename = `${prefix}_${picType}_${imageIndex}.jpg`;
      const imagePath = path.join(profileDir, filename);
      console.log('Saving image to:', imagePath);
      
      // Get image data from URL
      const imageResponse = await fetch(result.data.images[0].url);
      const imageBuffer = await imageResponse.arrayBuffer();
      await fs.writeFile(imagePath, Buffer.from(imageBuffer));
      console.log('Image saved successfully');

      // Return image data
      return {
        path: imagePath,
        url: `/uploads/profile_pictures/${username}/${profileId}/${filename}`,
        type: picType,
        index: imageIndex,
        isPost: isPost,
        prompt: prompt,
        generatedAt: new Date()
      };
    } catch (apiError) {
      console.error('FAL AI API error:', apiError);
      throw new Error(`FAL AI API error: ${apiError.message}`);
    }
  } catch (error) {
    console.error('Detailed error in generateProfilePicture:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

// Profile generation endpoint
router.get('/generate', authenticateToken, async (req, res) => {
  // Disable request timeout
  req.socket.setTimeout(0);
  res.socket.setTimeout(0);

  try {
    console.log('Starting profile generation...');
    const { 
      numProfiles, 
      profilesWithPics, 
      picTypeDistribution: picTypeDistributionStr, 
      profilesWithPosts,
      minPostsPerProfile,
      maxPostsPerProfile
    } = req.query;

    // Parse the parameters
    const parsedData = {
      numProfiles: parseInt(numProfiles),
      profilesWithPics: parseInt(profilesWithPics),
      picTypeDistribution: picTypeDistributionStr ? JSON.parse(picTypeDistributionStr) : {},
      profilesWithPosts: parseInt(profilesWithPosts),
      minPostsPerProfile: parseInt(minPostsPerProfile),
      maxPostsPerProfile: parseInt(maxPostsPerProfile)
    };

    // Input validation
    if (!parsedData.numProfiles || parsedData.numProfiles < 1) {
      return res.status(400).json({ message: 'Invalid number of profiles' });
    }

    // Only validate profile picture count if pictures are not skipped
    if (parsedData.profilesWithPics > 0 && parsedData.profilesWithPics !== parsedData.numProfiles) {
      return res.status(400).json({ 
        message: 'When profile pictures are enabled, all profiles must have pictures' 
      });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user.username);

    // Create the job
    const jobId = new mongoose.Types.ObjectId();
    const job = {
      _id: jobId,
      numProfiles: parsedData.numProfiles,
      profilesWithPics: parsedData.profilesWithPics,
      profilesWithPosts: parsedData.profilesWithPosts,
      minPostsPerProfile: parsedData.minPostsPerProfile,
      maxPostsPerProfile: parsedData.maxPostsPerProfile,
      picTypeDistribution: parsedData.picTypeDistribution,
      creditsBeforeJob: user.credits,
      startedAt: new Date()
    };
    
    // Calculate picture type distribution
    const picTypes = [];
    const entries = parsedData.profilesWithPics > 0 
      ? Object.entries(parsedData.picTypeDistribution)
          .filter(([_, quantity]) => quantity > 0)
      : [['random', parsedData.profilesWithPics]]; // Default to random if no profile pictures
    
    // Distribute profiles based on quantities
    for (const [type, quantity] of entries) {
      picTypes.push(...Array(quantity).fill(type));
    }

    console.log('Picture types distribution:', picTypes);

    // Only validate picture types if we're generating pictures
    if (parsedData.profilesWithPics > 0 && picTypes.length !== parsedData.profilesWithPics) {
      return res.status(400).json({ 
        message: 'Picture type distribution must match number of profiles with pictures' 
      });
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering
    
    // Add CORS headers for SSE
    res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://my-prod-domain.com');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    let currentPicIndex = user.profiles.length;
    const generatedProfiles = [];

    // Helper function to send SSE updates
    const sendUpdate = (profile, progress) => {
      res.write(`data: ${JSON.stringify({ profile, progress })}\n\n`);
    };

    // Generate profiles one by one
    for (let i = 0; i < parsedData.numProfiles; i++) {
      console.log(`Generating profile ${i + 1} of ${numProfiles}`);
      const hasProfilePic = i < parsedData.profilesWithPics;
      const hasPosts = i < parsedData.profilesWithPosts;
      
      // Create profile with MongoDB ObjectId
      const profileId = new mongoose.Types.ObjectId();
      const profile = {
        _id: profileId,
        jobId: job._id,
        picType: hasProfilePic ? picTypes[i] : 'random', // Use 'random' when no profile picture
        posts: hasPosts ? Math.floor(Math.random() * (parsedData.maxPostsPerProfile - parsedData.minPostsPerProfile + 1)) + parsedData.minPostsPerProfile : 0,
        images: [],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      };

      if (hasProfilePic) {
        try {
          console.log(`Generating picture for profile ${i + 1}`);
          // Generate profile picture
          const imageData = await generateImage(
            picTypes[i],
            user.username,
            profileId,
            currentPicIndex++,
            false // profile picture
          );

          profile.images.push(imageData);
          console.log('Picture generated successfully');
        } catch (imageError) {
          console.error(`Failed to generate image for profile ${i + 1}:`, imageError);
          res.write(`data: ${JSON.stringify({ error: imageError.message })}\n\n`);
          res.end();
          return;
        }
      }

      // Generate posts if needed
      if (hasPosts) {
        // Generate a random number of posts for this profile
        const numPosts = Math.floor(Math.random() * (parsedData.maxPostsPerProfile - parsedData.minPostsPerProfile + 1)) + parsedData.minPostsPerProfile;
        profile.posts = numPosts;
        console.log(`Generating ${numPosts} posts for profile ${i + 1}`);
        for (let j = 0; j < numPosts; j++) {
          try {
            console.log(`Generating post ${j + 1} for profile ${i + 1}`);
            const postData = await generateImage(
              picTypes[i],
              user.username,
              profileId,
              currentPicIndex++,
              true // post
            );
            profile.images.push(postData);
            console.log('Post generated successfully');
          } catch (postError) {
            console.error(`Failed to generate post ${j + 1} for profile ${i + 1}:`, postError);
            res.write(`data: ${JSON.stringify({ error: postError.message })}\n\n`);
            res.end();
            return;
          }
        }
      }

      generatedProfiles.push(profile);
      
    // Calculate total expected pictures for all profiles
    const totalPictures = parsedData.profilesWithPics + 
      (parsedData.profilesWithPosts * parsedData.maxPostsPerProfile);

    // Calculate current picture progress
    const currentPictureCount = generatedProfiles.reduce((total, p) => {
      return total + (p.images ? p.images.length : 0);
    }, 0);

    // Calculate overall progress percentage
    const progress = Math.round((currentPictureCount / totalPictures) * 100);

      // Send progress update for this image
      const progressData = {
        progress,
        currentPicture: currentPictureCount,
        totalPictures,
        currentProfile: i + 1,
        totalProfiles: parsedData.numProfiles,
        remainingProfiles: parsedData.numProfiles - (i + 1),
        remainingPictures: totalPictures - currentPictureCount
      };

      // Send the full profile with all images
      const partialProfile = {
        _id: profile._id,
        jobId: profile.jobId,
        picType: profile.picType,
        posts: profile.posts,
        images: profile.images, // Send all images
        expiresAt: profile.expiresAt
      };

      console.log('Sending progress update:', progressData);
      sendUpdate(partialProfile, progressData);
    }

    try {
      // Calculate actual credits used based on images generated
      const totalImagesGenerated = generatedProfiles.reduce((total, profile) => {
        return total + profile.images.length;
      }, 0);

      // Now that all profiles are generated successfully, save everything at once
      job.creditsUsed = totalImagesGenerated;
      job.creditsAfterJob = user.credits - totalImagesGenerated;
      user.jobs.push(job);
      user.profiles.push(...generatedProfiles);
      user.credits = job.creditsAfterJob; // Deduct actual credits used
      await user.save();
      console.log(`All profiles and job saved successfully. Deducted ${totalImagesGenerated} credits for actual images generated.`);
      res.write(`data: ${JSON.stringify({ complete: true })}\n\n`);
      res.end();
    } catch (saveError) {
      console.error('Failed to save profiles and job:', saveError);
      // Clean up any generated images
      for (const profile of generatedProfiles) {
        if (profile.images.length > 0) {
          try {
            await fs.remove(path.dirname(profile.images[0].path));
          } catch (cleanupError) {
            console.error('Failed to clean up images:', cleanupError);
          }
        }
      }
      res.write(`data: ${JSON.stringify({ error: 'Failed to save profiles' })}\n\n`);
      res.end();
    }
  } catch (error) {
    console.error('Profile generation error:', error);
    res.status(500).json({ 
      message: 'Error generating profiles', 
      error: error.message 
    });
  }
});

// Get user jobs with their profiles
router.get('/jobs', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('jobs profiles');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out expired jobs and their profiles
    const now = new Date();
    const activeJobs = user.jobs
      .filter(job => job.expiresAt > now)
      .map(job => {
        const jobProfiles = user.profiles.filter(profile => {
          // Check if profile has jobId before comparing
          return profile.jobId && 
                 profile.jobId.toString() === job._id.toString() && 
                 profile.expiresAt > now;
        });
        return {
          ...job.toObject(),
          profiles: jobProfiles
        };
      });

    res.json({ jobs: activeJobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

// Get user profiles
// Download profiles for a job
router.get('/download/:jobId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const job = user.jobs.find(j => j._id.toString() === req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Get profiles for this job
    const jobProfiles = user.profiles.filter(p => 
      p.jobId && p.jobId.toString() === job._id.toString()
    );

    // Create a zip file
    const archiver = require('archiver');
    const archive = archiver('zip');

    // Set response headers
    res.attachment(`profiles-${job._id}.zip`);
    archive.pipe(res);

    // Add files to the zip
    for (let i = 0; i < jobProfiles.length; i++) {
      const profile = jobProfiles[i];
      const profileFolder = `profile${i + 1}`;
      
      // Add profile picture if exists
      if (profile.images && profile.images.length > 0) {
        const profilePicPath = path.join('/app', profile.images[0].url);
        archive.file(profilePicPath, { name: `${profileFolder}/profile_picture.jpg` });
      }

      // Add post images if they exist
      const posts = profile.images.filter(img => img.isPost);
      posts.forEach((post, j) => {
        archive.file(path.join('/app', post.url), { name: `${profileFolder}/post${j + 1}.jpg` });
      });
    }

    archive.finalize();
  } catch (error) {
    console.error('Error downloading profiles:', error);
    res.status(500).json({ message: 'Error downloading profiles' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('profiles');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out expired profiles
    const now = new Date();
    const activeProfiles = user.profiles.filter(profile => profile.expiresAt > now);

    res.json({ profiles: activeProfiles });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ message: 'Error fetching profiles' });
  }
});

module.exports = router;
