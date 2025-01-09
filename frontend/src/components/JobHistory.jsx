import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProfilePreview from './ProfilePreview';
import LogoutButton from './LogoutButton';
import api, { downloadProfiles } from '../api';

function JobHistory() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedJobs, setExpandedJobs] = useState(new Set());

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await api.get('/api/profiles/jobs');
        setJobs(data.jobs);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const toggleJobExpansion = (jobId) => {
    setExpandedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const handleDownload = async (jobId) => {
    try {
      await downloadProfiles(jobId);
    } catch (err) {
      console.error('Failed to download profiles:', err);
      // You might want to show this error to the user in a more user-friendly way
    }
  };

  if (loading) {
    return <div className="p-4 text-white">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="absolute top-4 right-4">
        <LogoutButton />
      </div>
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Job & Balance History</h1>
          <Link 
            to="/generator" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Back to Generator
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-neutral-400">No jobs found. Start by generating some profiles!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map(job => (
              <div 
                key={job._id} 
                className="bg-neutral-800 rounded-lg shadow p-6"
              >
                <div className="border-b border-neutral-700 pb-4 mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold">
                      Job ID: {job._id}
                    </h2>
                    <button
                      onClick={() => handleDownload(job._id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Download Profiles
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm text-neutral-400">
                    <div>
                      <span className="font-medium">Created:</span>{' '}
                      {new Date(job.createdAt).toLocaleDateString()}{' '}
                      {job.startedAt ? new Date(job.startedAt).toLocaleTimeString() : 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Expires:</span>{' '}
                      {new Date(job.expiresAt).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Total Profiles:</span>{' '}
                      {job.numProfiles}
                    </div>
                    <div>
                      <span className="font-medium">With Pictures:</span>{' '}
                      {job.profilesWithPics}
                    </div>
                    <div>
                      <span className="font-medium">Balance Before:</span>{' '}
                      {job.creditsBeforeJob ?? 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Credits Used:</span>{' '}
                      {job.creditsUsed ?? 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Balance After:</span>{' '}
                      {job.creditsAfterJob ?? 'N/A'}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleJobExpansion(job._id)}
                    className="mt-4 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    {expandedJobs.has(job._id) ? 'Hide Profiles' : 'Show Profiles'}
                  </button>
                </div>

                {expandedJobs.has(job._id) && (
                  <div className="mt-4">
                    <ProfilePreview profiles={job.profiles} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default JobHistory;
