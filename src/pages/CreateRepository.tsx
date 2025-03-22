import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMutation } from '@tanstack/react-query';

export default function CreateRepository() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
    hasReadme: false,
    gitignoreTemplate: 'None',
    license: 'None',
    template: 'No template'
  });

  useEffect(() => {
    if (!user?.token) {
      navigate('/login');
    }
  }, [user, navigate]);

  const createRepoMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user?.token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          private: data.isPrivate,
          auto_init: data.hasReadme,
          gitignore_template: data.gitignoreTemplate === 'None' ? null : data.gitignoreTemplate,
          license_template: data.license === 'None' ? null : data.license,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create repository');
      }

      return response.json();
    },
    onSuccess: (data) => {
      navigate(`/${user?.login}/${data.name}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createRepoMutation.mutate(formData);
  };

  return (
    <div className="max-w-[1012px] mx-auto px-4 py-6 mt-[64px]">
      <h1 className="text-2xl font-semibold mb-4">Create a new repository</h1>
      <p className="text-sm text-[#57606a] mb-4">
        A repository contains all project files, including the revision history. Already have a project repository elsewhere?{' '}
        <a href="#" className="text-[#0969da] hover:underline">Import a repository</a>.
      </p>

      <div className="border-b border-[#d0d7de] my-4" />

      <form onSubmit={handleSubmit}>
        <p className="text-sm mb-4 text-[#57606a]">Required fields are marked with an asterisk (*).</p>

        {/* Repository template */}
        <div className="mb-4">
          <label className="font-semibold block mb-2">Repository template</label>
          <select 
            className="w-48 border border-[#d0d7de] rounded-md px-3 py-1.5"
            value={formData.template}
            onChange={(e) => setFormData({ ...formData, template: e.target.value })}
          >
            <option>No template</option>
          </select>
          <p className="text-xs text-[#57606a] mt-1">
            Start your repository with a template repository's contents.
          </p>
        </div>

        {/* Owner / Repository name */}
        <div className="grid grid-cols-[200px,1fr] gap-4 mb-4">
          <div>
            <label className="font-semibold block mb-2">Owner *</label>
            <select 
              className="w-full border border-[#d0d7de] rounded-md px-3 py-1.5"
              value={user?.login}
              onChange={() => {}} // Read-only
            >
              <option>{user?.login}</option>
            </select>
          </div>
          <div>
            <label className="font-semibold block mb-2">
              Repository name *
              <span className="text-red-600 ml-1">*</span>
            </label>
            <input
              type="text"
              className="w-full border border-[#d0d7de] rounded-md px-3 py-1.5"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <p className="text-xs text-[#57606a] mt-1">
              Great repository names are short and memorable. Need inspiration? How about{' '}
              <span className="text-[#0969da]">super-duper-app</span>?
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="font-semibold block mb-2">Description (optional)</label>
          <input
            type="text"
            className="w-full border border-[#d0d7de] rounded-md px-3 py-1.5"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Public/Private */}
        <div className="mb-4 border border-[#d0d7de] rounded-md p-4">
          <div className="flex items-start gap-3 mb-4">
            <input
              type="radio"
              id="public"
              name="visibility"
              checked={!formData.isPrivate}
              onChange={() => setFormData({ ...formData, isPrivate: false })}
              className="mt-1"
            />
            <div>
              <label htmlFor="public" className="font-semibold block">Public</label>
              <p className="text-sm text-[#57606a]">
                Anyone on the internet can see this repository. You choose who can commit.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <input
              type="radio"
              id="private"
              name="visibility"
              checked={formData.isPrivate}
              onChange={() => setFormData({ ...formData, isPrivate: true })}
              className="mt-1"
            />
            <div>
              <label htmlFor="private" className="font-semibold block">Private</label>
              <p className="text-sm text-[#57606a]">
                You choose who can see and commit to this repository.
              </p>
            </div>
          </div>
        </div>

        {/* Initialize options */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Initialize this repository with:</h3>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="readme"
              checked={formData.hasReadme}
              onChange={(e) => setFormData({ ...formData, hasReadme: e.target.checked })}
            />
            <label htmlFor="readme">Add a README file</label>
          </div>
          <p className="text-xs text-[#57606a] ml-6 mb-4">
            This is where you can write a long description for your project.{' '}
            <a href="#" className="text-[#0969da] hover:underline">Learn more about READMEs</a>.
          </p>

          <div className="mb-4">
            <label className="font-semibold block mb-2">Add .gitignore</label>
            <select 
              className="w-48 border border-[#d0d7de] rounded-md px-3 py-1.5"
              value={formData.gitignoreTemplate}
              onChange={(e) => setFormData({ ...formData, gitignoreTemplate: e.target.value })}
            >
              <option>None</option>
              <option>Node</option>
              <option>Python</option>
              <option>Java</option>
              <option>Ruby</option>
            </select>
          </div>

          <div>
            <label className="font-semibold block mb-2">Choose a license</label>
            <select 
              className="w-48 border border-[#d0d7de] rounded-md px-3 py-1.5"
              value={formData.license}
              onChange={(e) => setFormData({ ...formData, license: e.target.value })}
            >
              <option>None</option>
              <option>MIT</option>
              <option>Apache-2.0</option>
              <option>GPL-3.0</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={createRepoMutation.isPending}
          className="px-4 py-2 bg-[#2da44e] text-white rounded-md hover:bg-[#2c974b] font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {createRepoMutation.isPending ? 'Creating repository...' : 'Create repository'}
        </button>

        {createRepoMutation.isError && (
          <p className="mt-4 text-red-600">
            {createRepoMutation.error.message}
          </p>
        )}
      </form>
    </div>
  );
} 