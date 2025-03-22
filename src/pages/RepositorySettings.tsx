import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMutation, useQuery } from '@tanstack/react-query';

export default function RepositorySettings() {
  const { owner, repo } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [newName, setNewName] = useState(repo);

  const { data: repository } = useQuery({
    queryKey: ['repository', owner, repo],
    queryFn: async () => {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });
      return response.json();
    },
  });

  const renameMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });
      if (!response.ok) throw new Error('Failed to rename repository');
      return response.json();
    },
    onSuccess: (data) => {
      navigate(`/${owner}/${data.name}/settings`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete repository');
      return response;
    },
    onSuccess: () => {
      navigate(`/${owner}`);
    },
  });

  const visibilityMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ private: !repository?.private }),
      });
      if (!response.ok) throw new Error('Failed to change visibility');
      return response.json();
    },
  });

  return (
    <div className="max-w-[1012px] mx-auto px-4 py-6">
      <div className="grid grid-cols-[240px,1fr] gap-8">
        {/* Left sidebar */}
        <div className="space-y-1">
          <button className="w-full text-left px-4 py-1.5 rounded-md hover:bg-[#f3f4f6] font-semibold">
            General
          </button>
          <button className="w-full text-left px-4 py-1.5 rounded-md hover:bg-[#f3f4f6]">
            Access
          </button>
          <button className="w-full text-left px-4 py-1.5 rounded-md hover:bg-[#f3f4f6]">
            Branches
          </button>
          <button className="w-full text-left px-4 py-1.5 rounded-md hover:bg-[#f3f4f6]">
            Tags
          </button>
          {/* Add more sidebar items as needed */}
        </div>

        {/* Main content */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">General</h2>

          {/* Repository name */}
          <div className="border-b border-[#d0d7de] pb-6 mb-6">
            <label className="font-semibold block mb-2">Repository name</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="border border-[#d0d7de] rounded-md px-3 py-1.5"
              />
              <button
                onClick={() => renameMutation.mutate()}
                disabled={newName === repo || renameMutation.isPending}
                className="px-3 py-1.5 border border-[#d0d7de] rounded-md hover:bg-[#f3f4f6] disabled:opacity-60"
              >
                Rename
              </button>
            </div>
          </div>

          {/* Default branch */}
          <div className="border-b border-[#d0d7de] pb-6 mb-6">
            <h3 className="font-semibold mb-2">Default branch</h3>
            <p className="text-sm text-[#57606a] mb-2">
              The default branch is considered the "base" branch in your repository, against which all pull requests and code commits are automatically made, unless you specify a different branch.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value="main"
                readOnly
                className="border border-[#d0d7de] rounded-md px-3 py-1.5"
              />
              <button className="px-3 py-1.5 border border-[#d0d7de] rounded-md hover:bg-[#f3f4f6]">
                Update
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border border-[#f85149] rounded-md mt-8">
            <h3 className="px-4 py-2 bg-[#ffebe9] text-[#cf222e] font-semibold border-b border-[#f85149]">
              Danger Zone
            </h3>
            <div className="p-4 space-y-4">
              {/* Change visibility */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Change repository visibility</h4>
                  <p className="text-sm text-[#57606a]">
                    This repository is currently {repository?.private ? 'private' : 'public'}.
                  </p>
                </div>
                <button
                  onClick={() => visibilityMutation.mutate()}
                  className="px-3 py-1.5 border border-[#f85149] text-[#cf222e] rounded-md hover:bg-[#ffebe9]"
                >
                  Change visibility
                </button>
              </div>

              {/* Delete repository */}
              <div className="flex items-center justify-between pt-4 border-t border-[#f85149]">
                <div>
                  <h4 className="font-semibold">Delete this repository</h4>
                  <p className="text-sm text-[#57606a]">
                    Once you delete a repository, there is no going back. Please be certain.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this repository? This action cannot be undone.')) {
                      deleteMutation.mutate();
                    }
                  }}
                  className="px-3 py-1.5 border border-[#f85149] text-[#cf222e] rounded-md hover:bg-[#ffebe9]"
                >
                  Delete this repository
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 