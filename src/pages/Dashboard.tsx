import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  StarIcon, 
  BookOpenIcon,
  EyeIcon,
  ChatBubbleLeftEllipsisIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
  visibility: string;
}

interface Activity {
  id: string;
  type: string;
  actor: {
    login: string;
    avatar_url: string;
    display_login: string;
  };
  repo: {
    name: string;
  };
  payload: {
    action?: string;
    ref_type?: string;
    ref?: string;
    description?: string;
    issue?: {
      title: string;
      number: number;
    };
    comment?: {
      body: string;
    };
  };
  created_at: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: repositories } = useQuery<Repository[]>({
    queryKey: ['repositories', user?.login],
    queryFn: async () => {
      const { data } = await axios.get(`https://api.github.com/users/${user?.login}/repos?sort=updated&per_page=6`, {
        headers: {
          Authorization: `token ${localStorage.getItem('github_token')}`,
        },
      });
      return data;
    },
    enabled: !!user,
  });

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ['activities', user?.login],
    queryFn: async () => {
      const { data } = await axios.get(`https://api.github.com/users/${user?.login}/received_events`, {
        headers: {
          Authorization: `token ${localStorage.getItem('github_token')}`,
        },
      });
      return data;
    },
    enabled: !!user,
  });

  const formatActivityMessage = (activity: Activity) => {
    switch (activity.type) {
      case 'WatchEvent':
        return `starred ${activity.repo.name}`;
      case 'ForkEvent':
        return `forked ${activity.repo.name}`;
      case 'CreateEvent':
        return `created ${activity.payload.ref_type} ${activity.payload.ref} in ${activity.repo.name}`;
      case 'IssueCommentEvent':
        return `commented on issue #${activity.payload.issue?.number} in ${activity.repo.name}`;
      case 'IssuesEvent':
        return `${activity.payload.action} issue #${activity.payload.issue?.number} in ${activity.repo.name}`;
      default:
        return `interacted with ${activity.repo.name}`;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6 mt-[64px]">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-3 relative">
          <div className="absolute right-[-1rem] top-0 bottom-0 w-[1px] bg-[#d0d7de]"></div>
          <div className="mb-6">
            <h2 className="flex items-center text-sm font-semibold mb-2">
              Top repositories
              <Link
                to="/new"
                className="ml-auto px-2 py-[3px] text-xs font-medium text-white bg-[#2da44e] rounded-md hover:bg-[#2c974b] flex items-center gap-1"
              >
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" className="octicon octicon-repo mr-1" fill="currentColor">
                  <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
                </svg>
                New
              </Link>
            </h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Find a repository..."
                className="w-full px-3 py-1.5 text-sm border border-[#d0d7de] rounded-md focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] bg-[#f6f8fa]"
              />
            </div>
          </div>

          <div className="space-y-1">
            {repositories?.map((repo) => (
              <Link
                key={repo.id}
                to={`/${user?.login}/${repo.name}`}
                className="flex items-center p-2 text-sm text-[#24292f] hover:bg-[#f6f8fa] rounded-md"
              >
                <img
                  src={user?.avatar_url}
                  alt={user?.login}
                  className="h-4 w-4 rounded-full mr-2"
                />
                <span className="truncate">{user?.login}/{repo.name}</span>
              </Link>
            ))}
          </div>

          <Link
            to={`/${user?.login}?tab=repositories`}
            className="mt-4 block text-sm text-[#0969da] hover:underline"
          >
            Show more
          </Link>
        </div>

        <div className="col-span-6">
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Ask Copilot"
                className="w-full px-3 py-2 text-sm border border-[#d0d7de] rounded-md focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] bg-white pr-8"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#57606a]">
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" className="octicon octicon-paper-airplane Button-visual">
                  <path d="M.989 8 .064 2.68a1.342 1.342 0 0 1 1.85-1.462l13.402 5.744a1.13 1.13 0 0 1 0 2.076L1.913 14.782a1.343 1.343 0 0 1-1.85-1.463L.99 8Zm.603-5.288L2.38 7.25h4.87a.75.75 0 0 1 0 1.5H2.38l-.788 4.538L13.929 8Z"></path>
                </svg>
              </div>
            </div>

            <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
              <button className="flex items-center px-3 py-1 text-sm border border-[#d0d7de] rounded-full bg-white hover:bg-[#f6f8fa]">
                <code className="mr-2">{'<>'}</code>
                Explore JS
              </button>
              <button className="flex items-center px-3 py-1 text-sm border border-[#d0d7de] rounded-full bg-white hover:bg-[#f6f8fa]">
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" className="octicon octicon-git-pull-request">
                  <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z"></path>
                </svg>
                Compare Java password types
              </button>
              <button className="flex items-center px-3 py-1 text-sm border border-[#d0d7de] rounded-full bg-white hover:bg-[#f6f8fa]">
                <code className="mr-2">{'<>'}</code>
                How to merge Python dicts
              </button>
            </div>
          </div>

          <div className="flex items-center mb-4">
            <h2 className="text-sm font-semibold">Home</h2>
            <button className="ml-auto px-3 py-1 text-xs font-medium text-[#24292f] border border-[#d0d7de] rounded-md hover:bg-[#f6f8fa] flex items-center">
              <svg className="h-3 w-3 mr-1" viewBox="0 0 16 16" fill="currentColor">
                <path d="M.75 3h14.5a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1 0-1.5ZM3 7.75A.75.75 0 0 1 3.75 7h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 3 7.75Zm3 4a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z" />
              </svg>
              Filter
            </button>
          </div>

          <div className="space-y-4">
            {activities?.map((activity) => (
              <div key={activity.id} className="p-4 border border-[#d0d7de] rounded-md bg-white">
                <div className="flex items-start">
                  <img
                    src={activity.actor.avatar_url}
                    alt={activity.actor.display_login}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="ml-2 flex-1 min-w-0">
                    <div className="flex items-center text-sm">
                      <Link 
                        to={`/${activity.actor.login}`} 
                        className="font-semibold text-[#24292f] hover:text-[#0969da] truncate"
                      >
                        {activity.actor.display_login}
                      </Link>
                      <span className="ml-1 text-[#57606a]">
                        {formatActivityMessage(activity)}
                      </span>
                      <span className="ml-auto text-xs text-[#57606a] whitespace-nowrap">
                        {formatTimeAgo(activity.created_at)}
                      </span>
                    </div>
                    {activity.payload.comment && (
                      <div className="mt-2 text-sm text-[#57606a] border-l-2 border-[#d0d7de] pl-2">
                        {activity.payload.comment.body}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-3">
          <div className="block p-3 border border-[#d0d7de] rounded-md hover:bg-[#f6f8fa]">
            <h2 className="text-sm font-semibold mb-2">Latest changes</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="mt-1 mr-2 w-1 h-1 rounded-full bg-[#6e7781]"></div>
                <div>
                  <Link to="#" className="block text-sm text-[#24292f] hover:text-[#0969da]">
                    GitHub Actions now supports a digest for validating your artifacts at runtime
                  </Link>
                  <span className="text-xs text-[#57606a]">1 hour ago</span>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mt-1 mr-2 w-1 h-1 rounded-full bg-[#6e7781]"></div>
                <div>
                  <Link to="#" className="block text-sm text-[#24292f] hover:text-[#0969da]">
                    Instant previews, flexible editing, and working with issues in Copilot available in public beta
                  </Link>
                  <span className="text-xs text-[#57606a]">5 hours ago</span>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mt-1 mr-2 w-1 h-1 rounded-full bg-[#6e7781]"></div>
                <div>
                  <Link to="#" className="block text-sm text-[#24292f] hover:text-[#0969da]">
                    GitHub is now PCI DSS v4.0 compliant with our 4.0 service provider attestation available to customers
                  </Link>
                  <span className="text-xs text-[#57606a]">4 days ago</span>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mt-1 mr-2 w-1 h-1 rounded-full bg-[#6e7781]"></div>
                <div>
                  <Link to="#" className="block text-sm text-[#24292f] hover:text-[#0969da]">
                    Actions Performance Metrics are generally available and Enterprise-level metrics are in public beta
                  </Link>
                  <span className="text-xs text-[#57606a]">4 days ago</span>
                </div>
              </div>
            </div>
            <Link to="/changelog" className="mt-3 block text-sm text-[#0969da] hover:underline">
              View changelog →
            </Link>
          </div>

          <div>
            <h2 className="text-sm font-semibold mb-2">Explore repositories</h2>
            <div className="space-y-3">
              <Link to="/microsoft/vscode" className="block p-3 border border-[#d0d7de] rounded-md hover:bg-[#f6f8fa]">
                <div className="flex items-center mb-1">
                  <img src="/vscode.png" alt="VS Code" className="w-4 h-4 mr-2" />
                  <span className="text-sm font-semibold text-[#0969da]">microsoft/vscode</span>
                </div>
                <p className="text-xs text-[#57606a]">Visual Studio Code</p>
                <div className="mt-2 flex items-center text-xs text-[#57606a]">
                  <StarIcon className="h-3 w-3 mr-1" />
                  169k
                  <span className="mx-1">•</span>
                  <span className="w-2 h-2 rounded-full bg-[#3178c6] mr-1"></span>
                  TypeScript
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 