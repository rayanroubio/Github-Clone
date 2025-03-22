import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  MapPinIcon,
  BuildingOfficeIcon,
  LinkIcon,
  UserGroupIcon,
  StarIcon,
  CalendarIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useRepositoryActions } from '../hooks/useRepositoryActions';
import { useStarRepository } from '../hooks/useStarRepository';
import ReactMarkdown from 'react-markdown';

interface UserProfile {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  company: string;
  location: string;
  blog: string;
  public_repos: number;
  followers: number;
  following_count: number;
  is_following?: boolean;
}

interface Repository {
  id: number;
  name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
  fork: boolean;
  html_url: string;
  starred?: boolean;
}

interface PinnedRepo {
  owner: string;
  repo: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  url: string;
}

interface Contribution {
  date: string;
  count: number;
}

interface Activity {
  id: string;
  type: string;
  repo: {
    name: string;
    url: string;
  };
  payload: any;
  created_at: string;
}

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();
  const { starRepository } = useRepositoryActions();
  const { toggleStar, isLoading: isStarLoading } = useStarRepository();

  useEffect(() => {
    const token = localStorage.getItem('github_token');
    if (!token) {
      console.error('No GitHub token found!');
      return;
    }
    
    // Test the token
    axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${token}`,
      },
    })
    .then(response => {
      console.log('Token is valid, authenticated as:', response.data.login);
    })
    .catch(error => {
      console.error('Token validation failed:', error);
    });
  }, []);

  const followMutation = useMutation({
    mutationFn: async () => {
      const method = profile?.is_following ? 'DELETE' : 'PUT';
      const response = await axios({
        method,
        url: `https://api.github.com/user/following/${username}`,
        headers: {
          Authorization: `token ${localStorage.getItem('github_token')}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', username] });
    },
  });

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ['profile', username],
    queryFn: async () => {
      const [profileData, followingStatus] = await Promise.all([
        axios.get(`https://api.github.com/users/${username}`, {
          headers: {
            Authorization: `token ${localStorage.getItem('github_token')}`,
          },
        }),
        axios.get(`https://api.github.com/user/following/${username}`, {
          headers: {
            Authorization: `token ${localStorage.getItem('github_token')}`,
          },
          validateStatus: (status) => status === 204 || status === 404,
        }),
      ]);
      
      return {
        ...profileData.data,
        is_following: followingStatus.status === 204,
      };
    },
  });

  const { data: repositories, refetch: refetchRepos } = useQuery<Repository[]>({
    queryKey: ['repositories', username],
    queryFn: async () => {
      const token = localStorage.getItem('github_token');
      const { data: repos } = await axios.get(`https://api.github.com/users/${username}/repos`, {
        headers: {
          Authorization: `token ${token}`,
        },
      });

      const reposWithStarStatus = await Promise.all(
        repos.map(async (repo: Repository) => {
          try {
            const response = await axios.get(
              `https://api.github.com/user/starred/${username}/${repo.name}`,
              {
                headers: {
                  Authorization: `token ${token}`,
                },
                validateStatus: (status) => status === 204 || status === 404,
              }
            );
            return {
              ...repo,
              starred: response.status === 204,
            };
          } catch (error) {
            return { ...repo, starred: false };
          }
        })
      );

      return reposWithStarStatus;
    },
  });

  const { data: readme } = useQuery({
    queryKey: ['profile-readme', username],
    queryFn: async () => {
      try {
        const { data } = await axios.get(
          `https://api.github.com/repos/${username}/${username}/readme`,
          {
            headers: {
              Authorization: `token ${localStorage.getItem('github_token')}`,
              Accept: 'application/vnd.github.v3.raw+json',
            },
          }
        );
        // Decode base64 content if it exists
        if (data.content) {
          return Buffer.from(data.content, 'base64').toString('utf-8');
        }
        return data;
      } catch (error) {
        console.error('Error fetching README:', error);
        return null;
      }
    },
  });

  const { data: contributions } = useQuery({
    queryKey: ['contributions', username],
    queryFn: async () => {
      const { data } = await axios.get(
        `https://api.github.com/users/${username}/contributions`,
        {
          headers: { Authorization: `token ${localStorage.getItem('github_token')}` },
        }
      );
      return data;
    },
  });

  const { data: pinnedRepos } = useQuery<PinnedRepo[]>({
    queryKey: ['pinned-repos', username],
    queryFn: async () => {
      try {
        const { data } = await axios.post(
          'https://api.github.com/graphql',
          {
            query: `{
              user(login: "${username}") {
                pinnedItems(first: 6, types: REPOSITORY) {
                  nodes {
                    ... on Repository {
                      name
                      owner {
                        login
                      }
                      description
                      primaryLanguage {
                        name
                      }
                      stargazerCount
                      forkCount
                      url
                    }
                  }
                }
              }
            }`
          },
          {
            headers: {
              Authorization: `bearer ${localStorage.getItem('github_token')}`,
            },
          }
        );

        return data.data.user.pinnedItems.nodes.map((node: any) => ({
          owner: node.owner.login,
          repo: node.name,
          description: node.description,
          language: node.primaryLanguage?.name || '',
          stars: node.stargazerCount,
          forks: node.forkCount,
          url: node.url
        }));
      } catch (error) {
        console.error('Error fetching pinned repos:', error);
        return [];
      }
    }
  });

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ['activities', username],
    queryFn: async () => {
      try {
        const { data } = await axios.get(
          `https://api.github.com/users/${username}/events/public`,
          {
            headers: {
              Authorization: `token ${localStorage.getItem('github_token')}`,
            },
          }
        );
        return data.slice(0, 10); // Get last 10 activities
      } catch (error) {
        console.error('Error fetching activities:', error);
        return [];
      }
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleFollow = () => {
    if (user?.login !== username) {
      followMutation.mutate();
    }
  };

  const handleStar = async (repo: Repository) => {
    try {
      const token = localStorage.getItem('github_token');
      if (!token) throw new Error('No authentication token found');

      // Optimistically update UI
      queryClient.setQueryData(['repositories', username], (old: Repository[] | undefined) =>
        old?.map((r) =>
          r.id === repo.id
            ? {
                ...r,
                starred: !r.starred,
                stargazers_count: r.starred ? r.stargazers_count - 1 : r.stargazers_count + 1,
              }
            : r
        )
      );

      // Make the API call
      await axios({
        method: repo.starred ? 'DELETE' : 'PUT',
        url: `https://api.github.com/user/starred/${username}/${repo.name}`,
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      // Refetch to ensure data consistency
      refetchRepos();
    } catch (error) {
      console.error('Failed to star repository:', error);
      // Revert optimistic update
      queryClient.setQueryData(['repositories', username], (old: Repository[] | undefined) =>
        old?.map((r) =>
          r.id === repo.id
            ? {
                ...r,
                starred: !r.starred,
                stargazers_count: r.starred ? r.stargazers_count + 1 : r.stargazers_count - 1,
              }
            : r
        )
      );
      // Show error to user
      alert('Failed to star repository. Please try again.');
    }
  };

  const ContributionGraph = ({ contributions }: { contributions: Contribution[] }) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Mon', 'Wed', 'Fri'];
    
    return (
      <div className="border border-[#d0d7de] rounded-md p-4">
        <h3 className="text-base font-semibold mb-2">
          {contributions?.reduce((sum, day) => sum + day.count, 0) || 0} contributions in the last year
        </h3>
        <div className="h-[120px] bg-[#f6f8fa] rounded-md p-4">
          <div className="flex justify-between text-xs text-[#57606a] mb-2">
            {months.map(month => (
              <span key={month}>{month}</span>
            ))}
          </div>
          <div className="grid grid-cols-52 gap-1">
            {contributions?.map((day, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-sm ${getContributionColor(day.count)}`}
                title={`${day.count} contributions on ${day.date}`}
              />
            ))}
          </div>
          <div className="flex flex-col gap-1 text-xs text-[#57606a] mt-2">
            {days.map(day => (
              <span key={day}>{day}</span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const getContributionColor = (count: number): string => {
    if (count === 0) return 'bg-[#ebedf0]';
    if (count <= 3) return 'bg-[#9be9a8]';
    if (count <= 6) return 'bg-[#40c463]';
    if (count <= 9) return 'bg-[#30a14e]';
    return 'bg-[#216e39]';
  };

  const ActivityItem = ({ activity }: { activity: Activity }) => {
    const formatDate = (date: string) => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getActivityText = (activity: Activity) => {
      switch (activity.type) {
        case 'PushEvent':
          return `Pushed ${activity.payload.commits?.length || 0} commits to`;
        case 'CreateEvent':
          return 'Created repository';
        case 'ForkEvent':
          return 'Forked';
        case 'WatchEvent':
          return 'Starred';
        case 'IssuesEvent':
          return `${activity.payload.action} issue in`;
        case 'PullRequestEvent':
          return `${activity.payload.action} pull request in`;
        default:
          return 'Interacted with';
      }
    };

    return (
      <div className="flex items-start gap-3 py-3">
        <div className="w-6 h-6 flex items-center justify-center">
          {activity.type === 'PushEvent' && (
            <svg className="w-5 h-5 text-[#57606a]" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M1 2.5A2.5 2.5 0 013.5 0h8.75a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0V1.5h-8a1 1 0 00-1 1v6.708A2.492 2.492 0 013.5 9h3.25a.75.75 0 010 1.5H3.5a1 1 0 100 2h5.75a.75.75 0 010 1.5H3.5A2.5 2.5 0 011 11.5v-9zm13.23 7.79a.75.75 0 001.06-1.06l-2.505-2.505a.75.75 0 00-1.06 0L9.22 9.229a.75.75 0 001.06 1.061l1.225-1.224v6.184a.75.75 0 001.5 0V9.066l1.224 1.224z"></path>
            </svg>
          )}
        </div>
        <div className="flex-1">
          <div className="text-sm">
            <span>{getActivityText(activity)} </span>
            <Link
              to={`/${activity.repo.name}`}
              className="text-[#0969da] hover:underline font-semibold"
            >
              {activity.repo.name}
            </Link>
          </div>
          <div className="text-xs text-[#57606a] mt-1">
            {formatDate(activity.created_at)}
          </div>
        </div>
      </div>
    );
  };

  const PinnedRepositories = ({ repos }: { repos: PinnedRepo[] }) => {
    return (
      <div className="grid grid-cols-2 gap-4">
        {repos.map((repo) => (
          <Link
            key={`${repo.owner}/${repo.repo}`}
            to={`/${repo.owner}/${repo.repo}`}
            className="border border-[#d0d7de] rounded-md p-4 hover:bg-[#f6f8fa]"
          >
            <div className="flex items-center gap-2 mb-2">
              <svg 
                aria-hidden="true" 
                height="16" 
                viewBox="0 0 16 16" 
                version="1.1" 
                width="16" 
                data-view-component="true" 
                className="octicon octicon-repo mr-1 color-fg-muted"
              >
                <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
              </svg>
              <span className="font-semibold text-[#0969da]">{repo.repo}</span>
            </div>
            <p className="text-sm text-[#57606a] mb-4 line-clamp-2">
              {repo.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-[#57606a]">
              <span className="flex items-center gap-1">
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getLanguageColor(repo.language) }}
                />
                {repo.language}
              </span>
              <span className="flex items-center gap-1">
                <StarIcon className="h-4 w-4" />
                {repo.stars}
              </span>
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path>
                </svg>
                {repo.forks}
              </span>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto pt-20 px-6">
      <div className="grid grid-cols-12 gap-8">
        {/* Left Sidebar - Profile Info */}
        <div className="col-span-3">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4">
              <img
                src={profile?.avatar_url}
                alt={profile?.name}
                className="w-full rounded-full"
              />
              <h2 className="mt-4 text-2xl font-semibold">
                {profile?.name}
              </h2>
              <p className="text-gray-600">{profile?.login}</p>
              
              {user?.login !== username && (
                <button
                  onClick={handleFollow}
                  disabled={followMutation.isPending}
                  className={`mt-4 w-full px-3 py-1 text-sm font-semibold rounded-md border ${
                    profile?.is_following
                      ? 'border-[#d0d7de] bg-[#f6f8fa] hover:bg-[#f3f4f6]'
                      : 'border-[#d0d7de] bg-[#f6f8fa] hover:bg-[#f3f4f6]'
                  }`}
                >
                  {profile?.is_following ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>
            <div className="p-4 border-t">
              <p className="text-gray-600 mb-4">{profile?.bio}</p>

              <div className="space-y-2">
                {profile?.company && (
                  <div className="flex items-center text-gray-600">
                    <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                    <span>{profile.company}</span>
                  </div>
                )}
                {profile?.location && (
                  <div className="flex items-center text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile?.blog && (
                  <div className="flex items-center text-gray-600">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    <a
                      href={profile.blog}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-github-link hover:underline"
                    >
                      {profile.blog}
                    </a>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <UserGroupIcon className="h-4 w-4 mr-2" />
                  <span>
                    <strong>{profile?.followers}</strong> Followers ·{' '}
                    <strong>{profile?.following_count}</strong> Following
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-9">
          <div className="border-b border-[#d0d7de] mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-[#fd8c73] text-[#24292f]'
                    : 'border-transparent text-[#57606a] hover:border-[#d0d7de]'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('repositories')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'repositories'
                    ? 'border-[#fd8c73] text-[#24292f]'
                    : 'border-transparent text-[#57606a] hover:border-[#d0d7de]'
                }`}
              >
                Repositories <span className="ml-2 text-[#57606a]">{profile?.public_repos}</span>
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'projects'
                    ? 'border-[#fd8c73] text-[#24292f]'
                    : 'border-transparent text-[#57606a] hover:border-[#d0d7de]'
                }`}
              >
                Projects
              </button>
              <button
                onClick={() => setActiveTab('packages')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'packages'
                    ? 'border-[#fd8c73] text-[#24292f]'
                    : 'border-transparent text-[#57606a] hover:border-[#d0d7de]'
                }`}
              >
                Packages
              </button>
              <button
                onClick={() => setActiveTab('stars')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'stars'
                    ? 'border-[#fd8c73] text-[#24292f]'
                    : 'border-transparent text-[#57606a] hover:border-[#d0d7de]'
                }`}
              >
                Stars
              </button>
            </nav>
          </div>

          {/* Overview Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Pinned Repositories */}
              {pinnedRepos && pinnedRepos.length > 0 && (
                <div>
                  <h2 className="text-base font-semibold mb-3">Pinned</h2>
                  <PinnedRepositories repos={pinnedRepos} />
                </div>
              )}

              {/* Contribution Graph */}
              {contributions && (
                <ContributionGraph contributions={contributions} />
              )}

              {/* README */}
              <div className="flex-1">
                {activeTab === 'overview' && readme && (
                  <div className="border rounded-md">
                    <div className="bg-gray-50 px-4 py-2 border-b">
                      <span>{username}/README.md</span>
                    </div>
                    <div className="prose max-w-none p-8 markdown-body">
                      <ReactMarkdown>{readme}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="border border-[#d0d7de] rounded-md p-4">
                <h2 className="text-base font-semibold mb-3">Recent activity</h2>
                <div className="divide-y divide-[#d0d7de]">
                  {activities?.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                  {(!activities || activities.length === 0) && (
                    <p className="text-sm text-[#57606a] py-4">No recent activity</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Repositories Content */}
          {activeTab === 'repositories' && (
            <div className="space-y-4">
              {repositories?.map((repo) => (
                <div key={repo.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link 
                        to={`/${username}/${repo.name}`} 
                        className="text-xl text-[#0969da] hover:underline font-semibold"
                      >
                        {repo.name}
                      </Link>
                      {repo.fork && (
                        <span className="ml-2 text-xs border border-[#d0d7de] rounded-full px-2 py-0.5">
                          Fork
                        </span>
                      )}
                      <p className="text-gray-600 mt-1">{repo.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                        {repo.language && (
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#3178c6]"></span>
                            {repo.language}
                          </span>
                        )}
                        <div className="flex items-center gap-4">
                          <Link 
                            to={`/${username}/${repo.name}/stargazers`}
                            className="flex items-center gap-1 hover:text-[#0969da]"
                          >
                            <StarIcon className="h-4 w-4" />
                            <span>{repo.stargazers_count.toLocaleString()}</span>
                          </Link>
                          
                          <Link 
                            to={`/${username}/${repo.name}/network/members`}
                            className="flex items-center gap-1 hover:text-[#0969da]"
                          >
                            <svg aria-label="fork" className="h-4 w-4" viewBox="0 0 16 16" version="1.1">
                              <path fillRule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path>
                            </svg>
                            <span>{repo.forks_count.toLocaleString()}</span>
                          </Link>
                        </div>
                        <span>Updated on {formatDate(repo.updated_at)}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleStar(repo)}
                      disabled={isStarLoading}
                      className={`flex items-center gap-2 px-3 py-1 text-sm border rounded-md ${
                        repo.starred
                          ? 'bg-[#f6f8fa] border-[#d0d7de] hover:bg-[#f3f4f6]'
                          : 'bg-white border-[#d0d7de] hover:bg-[#f3f4f6]'
                      }`}
                    >
                      <StarIcon 
                        className={`h-4 w-4 ${repo.starred ? 'fill-current' : ''}`} 
                      />
                      <span>{repo.starred ? 'Unstar' : 'Star'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function for language colors
const getLanguageColor = (language: string): string => {
  const colors: { [key: string]: string } = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    Java: '#b07219',
    // Add more languages as needed
  };
  return colors[language] || '#8b949e';
};

export default Profile; 