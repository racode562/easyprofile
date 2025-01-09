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
  const [sortBy, setSortBy] = useState('newest');

  const sortJobs = (jobsToSort, sortType) => {
    const sortedJobs = [...jobsToSort];
    switch (sortType) {
      case 'newest':
        return sortedJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return sortedJobs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'most-pictures':
        return sortedJobs.sort((a, b) => {
          const totalPicsA = b.profiles.reduce((total, profile) => total + profile.images.length, 0);
          const totalPicsB = a.profiles.reduce((total, profile) => total + profile.images.length, 0);
          return totalPicsA - totalPicsB;
        });
      default:
        return sortedJobs;
    }
  };

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
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Job & Balance History</h1>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most-pictures">Most Pictures</option>
            </select>
          </div>
          <Link 
            to="/generator" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Create new profiles job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12 bg-neutral-800 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-neutral-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">No Jobs Found</h3>
            <p className="text-neutral-400 mb-6">Ready to start generating profiles? Click the button above to create your first job!</p>
            <Link 
              to="/generator" 
              className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create new profiles job
              <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {sortJobs(jobs, sortBy).map(job => (
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
                  {new Date(job.expiresAt) > new Date() && (
                    <div className="mb-4 p-3 bg-yellow-600/20 text-yellow-200 rounded-lg text-sm">
                      ⚠️ Warning: This job will expire on {new Date(job.expiresAt).toLocaleDateString()}. Please download your profiles before they expire, or you won't be able to access the pictures.
                    </div>
                  )}
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
                      <span className="font-medium">Total Pictures:</span>{' '}
                      {job.profiles.reduce((total, profile) => total + profile.images.length, 0)}
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
