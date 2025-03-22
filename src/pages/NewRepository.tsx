import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const NewRepository: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'public',
    initialize: true,
    gitignore: '',
    license: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        'https://api.github.com/user/repos',
        {
          name: formData.name,
          description: formData.description,
          private: formData.visibility === 'private',
          auto_init: formData.initialize,
          gitignore_template: formData.gitignore || undefined,
          license_template: formData.license || undefined,
        },
        {
          headers: {
            Authorization: `token ${localStorage.getItem('github_token')}`,
          },
        }
      );

      navigate(`/${user?.login}/${formData.name}`);
    } catch (err) {
      setError('Failed to create repository. Please try again.');
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto pt-20 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Create a new repository</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repository name
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                {user?.login}/
              </span>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-github-btn focus:ring-github-btn sm:text-sm"
                placeholder="repository-name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:border-github-btn focus:ring-github-btn sm:text-sm"
              placeholder="(optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibility
            </label>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  value="public"
                  checked={formData.visibility === 'public'}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                  className="h-4 w-4 text-github-btn focus:ring-github-btn border-gray-300"
                />
                <label className="ml-3 block text-sm font-medium text-gray-700">
                  Public
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  value="private"
                  checked={formData.visibility === 'private'}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                  className="h-4 w-4 text-github-btn focus:ring-github-btn border-gray-300"
                />
                <label className="ml-3 block text-sm font-medium text-gray-700">
                  Private
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initialize this repository with:
            </label>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.initialize}
                  onChange={(e) => setFormData({ ...formData, initialize: e.target.checked })}
                  className="h-4 w-4 text-github-btn focus:ring-github-btn border-gray-300 rounded"
                />
                <label className="ml-3 block text-sm font-medium text-gray-700">
                  Add a README file
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-github-btn focus:ring-github-btn border-gray-300 rounded"
                />
                <label className="ml-3 block text-sm font-medium text-gray-700">
                  Add .gitignore
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-github-btn focus:ring-github-btn border-gray-300 rounded"
                />
                <label className="ml-3 block text-sm font-medium text-gray-700">
                  Choose a license
                </label>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-github-btn hover:bg-github-btn-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-github-btn"
            >
              Create repository
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewRepository; 