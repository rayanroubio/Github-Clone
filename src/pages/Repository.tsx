import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
  StarIcon,
  ChevronDownIcon,
  CodeBracketIcon,
  ChevronRightIcon,
  FolderIcon,
  DocumentIcon,
  ChevronLeftIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  EyeIcon,
  StarIcon as RepoStarIcon,
  CodeBracketSquareIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import { useRepositoryActions } from '../hooks/useRepositoryActions';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useStarRepository } from '../hooks/useStarRepository';

SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('bash', bash);

interface RepositoryData {
  id: number;
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string;
  default_branch: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  private: boolean;
  fork: boolean;
  html_url: string;
  permissions?: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
  starred?: boolean;
  languages_url: string;
}

interface FileContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  content?: string;
  encoding?: string;
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

interface ReadmeContent {
  content: string;
  encoding: string;
}

// Add this utility function at the top of the file
const decodeBase64 = (str: string): string => {
  try {
    return decodeURIComponent(
      atob(str)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch (e) {
    return atob(str);
  }
};

// Add this function at the top of the file, after imports
const getLanguageColor = (language: string): string => {
  const colors: { [key: string]: string } = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    Java: '#b07219',
    Ruby: '#701516',
    PHP: '#4F5D95',
    CSS: '#563d7c',
    HTML: '#e34c26',
    Go: '#00ADD8',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    Rust: '#dea584',
    C: '#555555',
    'C++': '#f34b7d',
    'C#': '#178600',
    Shell: '#89e051',
    Vue: '#41b883',
    React: '#61dafb',
    // Add more languages as needed
  };
  return colors[language] || '#858585';
};

// Update the RepositorySidebar component
const RepositorySidebar = ({ repository, languages }: { 
  repository: RepositoryData | undefined,
  languages: Record<string, number> | undefined 
}) => {
  const totalBytes = languages ? Object.values(languages).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="space-y-4">
      {/* About section */}
      <div className="border border-[#d0d7de] rounded-md">
        <h2 className="px-4 py-3 font-semibold border-b border-[#d0d7de] text-sm">About</h2>
        <div className="px-4 py-3">
          <p className="text-sm text-[#57606a] mb-4">
            {repository?.description || 'No description provided.'}
          </p>
          
          {/* Stats */}
          <div className="space-y-2">
            {/* Stars */}
            <div className="flex items-center text-sm text-[#57606a]">
              <StarIcon className="h-4 w-4 mr-2" />
              <span>{repository?.stargazers_count || 0} stars</span>
            </div>
            
            {/* Watchers */}
            <div className="flex items-center text-sm text-[#57606a]">
              <EyeIcon className="h-4 w-4 mr-2" />
              <span>{repository?.watchers_count || 0} watching</span>
            </div>
            
            {/* Forks */}
            <div className="flex items-center text-sm text-[#57606a]">
              <svg 
                height="16" 
                viewBox="0 0 16 16" 
                width="16" 
                className="mr-2 fill-current"
              >
                <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" />
              </svg>
              <span>{repository?.forks_count || 0} forks</span>
            </div>
          </div>

          {/* Languages */}
          {languages && Object.keys(languages).length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">Languages</h3>
              
              {/* Language bar */}
              <div className="flex w-full h-2 rounded-md overflow-hidden mb-2">
                {Object.entries(languages).map(([lang, bytes]) => {
                  const percentage = (bytes / totalBytes) * 100;
                  return (
                    <div
                      key={lang}
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: getLanguageColor(lang)
                      }}
                    />
                  );
                })}
              </div>

              {/* Language list */}
              <div className="space-y-1">
                {Object.entries(languages)
                  .sort(([, a], [, b]) => b - a) // Sort by percentage descending
                  .map(([lang, bytes]) => {
                    const percentage = ((bytes / totalBytes) * 100).toFixed(1);
                    return (
                      <div key={lang} className="flex items-center text-sm">
                        <span 
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: getLanguageColor(lang) }}
                        />
                        <span className="text-[#24292f]">{lang}</span>
                        <span className="text-[#57606a] ml-1">{percentage}%</span>
                      </div>
                    );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Repository: React.FC = () => {
  const { username, repo } = useParams<{ username: string; repo: string }>();
  const { user } = useAuth();
  const [isStarred, setIsStarred] = useState(false);
  const [isForked, setIsForked] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileContent | null>(null);
  const [branchesOpen, setBranchesOpen] = useState(false);
  const [isViewingCode, setIsViewingCode] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const { starRepository, forkRepository, isStarring, isForking } = useRepositoryActions();
  const queryClient = useQueryClient();
  const [selectedCloneOption, setSelectedCloneOption] = useState<'https' | 'ssh' | 'cli'>('https');

  // Update the repository query to properly check star status
  const { data: repository, refetch: refetchRepo } = useQuery<RepositoryData>({
    queryKey: ['repository', username, repo],
    queryFn: async () => {
      if (!username || !repo) return null;
      
      const [repoData, starredStatus] = await Promise.all([
        axios.get(`https://api.github.com/repos/${username}/${repo}`, {
          headers: { Authorization: `token ${localStorage.getItem('github_token')}` },
        }),
        axios.get(`https://api.github.com/user/starred/${username}/${repo}`, {
          headers: { Authorization: `token ${localStorage.getItem('github_token')}` },
          validateStatus: (status) => status === 204 || status === 404,
        }),
      ]);

      const isStarred = starredStatus.status === 204;
      setIsStarred(isStarred);
      
      return {
        ...repoData.data,
        starred: isStarred,
      };
    },
    enabled: !!username && !!repo,
  });

  // Fetch files for current path
  const { data: files, isLoading: filesLoading } = useQuery({
    queryKey: ['files', username, repo, currentPath],
    queryFn: async () => {
      const { data } = await axios.get(
        `https://api.github.com/repos/${username}/${repo}/contents/${currentPath}`,
        {
          headers: { Authorization: `token ${localStorage.getItem('github_token')}` },
        }
      );
      return Array.isArray(data) ? data : [data];
    },
  });

  // Fetch file content when a file is selected
  const { data: fileContent, isLoading: fileLoading } = useQuery({
    queryKey: ['file', username, repo, selectedFile?.path],
    queryFn: async () => {
      if (!selectedFile || selectedFile.type === 'dir') return null;
      
      const { data } = await axios.get(
        `https://api.github.com/repos/${username}/${repo}/contents/${selectedFile.path}`,
        {
          headers: { Authorization: `token ${localStorage.getItem('github_token')}` },
        }
      );
      return data;
    },
    enabled: !!selectedFile && selectedFile.type !== 'dir',
  });

  // Add this query for README content
  const { data: readmeContent } = useQuery<ReadmeContent>({
    queryKey: ['readme', username, repo],
    queryFn: async () => {
      try {
        const { data } = await axios.get(
          `https://api.github.com/repos/${username}/${repo}/contents/README.md`,
          {
            headers: { Authorization: `token ${localStorage.getItem('github_token')}` },
          }
        );
        return data;
      } catch (error) {
        return null; // Return null if README doesn't exist
      }
    },
  });

  const { toggleStar, isLoading: isStarLoading } = useStarRepository();

  // Update the handleStar function
  const handleStar = async () => {
    if (!username || !repo) return;

    try {
      const token = localStorage.getItem('github_token');
      if (!token) throw new Error('No authentication token found');

      // Optimistically update UI
      setIsStarred(prev => !prev);
      if (repository) {
        queryClient.setQueryData(['repository', username, repo], {
          ...repository,
          stargazers_count: repository.stargazers_count + (isStarred ? -1 : 1),
          starred: !isStarred,
        });
      }

      // Make the API call
      await axios({
        method: isStarred ? 'DELETE' : 'PUT',
        url: `https://api.github.com/user/starred/${username}/${repo}`,
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      // Refetch to ensure data consistency
      refetchRepo();
    } catch (error) {
      // Revert optimistic updates on error
      setIsStarred(prev => !prev);
      if (repository) {
        queryClient.setQueryData(['repository', username, repo], {
          ...repository,
          stargazers_count: repository.stargazers_count + (isStarred ? 1 : -1),
          starred: isStarred,
        });
      }
      console.error('Failed to star repository:', error);
    }
  };

  const handleFork = async () => {
    try {
      if (!username || !repo) return;
      const result = await forkRepository.mutateAsync({ owner: username, repo });
      setIsForked(true);
      refetchRepo();
    } catch (error) {
      console.error('Error forking repository:', error);
    }
  };

  // Add this function to sort files and folders
  const sortedFiles = React.useMemo(() => {
    if (!files) return [];
    return [...files].sort((a, b) => {
      // First sort by type (folders on top)
      if (a.type === 'dir' && b.type !== 'dir') return -1;
      if (a.type !== 'dir' && b.type === 'dir') return 1;
      // Then sort alphabetically
      return a.name.localeCompare(b.name);
    });
  }, [files]);

  // Update handleFileClick
  const handleFileClick = (file: FileContent) => {
    if (file.type === 'dir') {
      setCurrentPath(file.path);
      setSelectedFile(null);
      setIsViewingCode(false);
    } else {
      setSelectedFile(file);
      setIsViewingCode(true);
    }
  };

  // Add function to go back to file list
  const handleBackToFiles = () => {
    setIsViewingCode(false);
    setSelectedFile(null);
  };

  const handleBackClick = () => {
    const pathParts = currentPath.split('/');
    pathParts.pop();
    setCurrentPath(pathParts.join('/'));
    setSelectedFile(null);
  };

  const getBreadcrumbs = () => {
    if (!currentPath) return [];
    return currentPath.split('/').map((part, index, array) => ({
      name: part,
      path: array.slice(0, index + 1).join('/'),
    }));
  };

  // Add function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} Bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Add function to get file extension
  const getFileExtension = (filename: string) => {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
  };

  // Add function to get language from filename
  const getLanguageFromFilename = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const languageMap: { [key: string]: string } = {
      js: 'javascript',
      jsx: 'jsx',
      ts: 'typescript',
      tsx: 'tsx',
      py: 'python',
      rb: 'ruby',
      java: 'java',
      go: 'go',
      php: 'php',
      css: 'css',
      html: 'html',
      json: 'json',
      md: 'markdown',
      yml: 'yaml',
      yaml: 'yaml',
      sh: 'bash',
      bash: 'bash',
      // Add more mappings as needed
    };
    return languageMap[ext] || 'plaintext';
  };

  // Update the file content section
  const renderFileContent = () => {
    if (!selectedFile || !fileContent?.content) return null;

    const decodedContent = decodeBase64(fileContent.content);
    const language = getLanguageFromFilename(selectedFile.name);

    return (
      <div className="border-t border-[#d0d7de]">
        {/* File header */}
        <div className="p-2 bg-[#f6f8fa] border-b border-[#d0d7de] flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center px-3 py-1 space-x-2">
              <span className="text-xs text-[#57606a] font-mono">{selectedFile.size} Bytes</span>
            </div>
          </div>
          <div className="flex items-center space-x-3 px-3">
            <button className="text-xs text-[#0969da] hover:underline">Raw</button>
            <span className="text-[#57606a]">|</span>
            <button className="text-xs text-[#0969da] hover:underline">Blame</button>
          </div>
        </div>

        {/* Code content */}
        <div className="overflow-x-auto">
          <div className="relative">
            <SyntaxHighlighter
              language={language}
              style={oneLight}
              showLineNumbers={true}
              customStyle={{
                margin: 0,
                background: 'white',
                fontSize: '12px',
                lineHeight: '20px',
                fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace',
              }}
              lineNumberStyle={{
                minWidth: '50px',
                paddingRight: '1em',
                textAlign: 'right',
                userSelect: 'none',
                backgroundColor: '#f6f8fa',
                borderRight: '1px solid #d0d7de',
                color: '#57606a',
                fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace',
              }}
              wrapLines={true}
              lineProps={lineNumber => ({
                style: {
                  display: 'block',
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  backgroundColor: 'white',
                  ':hover': {
                    backgroundColor: '#f6f8fa',
                  },
                },
              })}
              className="syntax-highlighter"
            >
              {decodedContent}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    );
  };

  const handleDownload = () => {
    try {
      if (!repository?.default_branch) {
        throw new Error('Repository data not available');
      }

      // Use the direct GitHub download URL
      const downloadUrl = `https://github.com/${username}/${repo}/archive/refs/heads/${repository.default_branch}.zip`;
      
      // Open in new tab
      window.open(downloadUrl, '_blank');

    } catch (error) {
      console.error('Error initiating download:', error);
      alert(error instanceof Error ? error.message : 'Failed to initiate download');
    }
  };

  const navigationItems = [
    { name: 'Code', icon: CodeBracketIcon, path: '' },
    { name: 'Issues', icon: ExclamationCircleIcon, path: '/issues' },
    { name: 'Pull requests', icon: ArrowPathIcon, path: '/pulls' },
    { name: 'Actions', icon: RocketLaunchIcon, path: '/actions' },
    { name: 'Projects', icon: Squares2X2Icon, path: '/projects' },
    { name: 'Security', icon: ShieldCheckIcon, path: '/security' },
    { name: 'Insights', icon: ChartBarIcon, path: '/insights' },
    { name: 'Settings', icon: Cog6ToothIcon, path: '/settings' },
  ];

  // Update the main Repository component to include languages query
  const { data: languages } = useQuery({
    queryKey: ['repository-languages', username, repo],
    queryFn: async () => {
      if (!repository?.languages_url) return null;
      const { data } = await axios.get(repository.languages_url, {
        headers: { Authorization: `token ${localStorage.getItem('github_token')}` },
      });
      return data;
    },
    enabled: !!repository?.languages_url,
  });

  // Add this function to decode base64 content
  const decodedReadme = readmeContent?.content 
    ? decodeBase64(readmeContent.content)
    : null;

  return (
    <div className="min-h-screen">
      {/* Repository header */}
      <div className="border-b border-[#d0d7de] bg-white">
        <div className="max-w-[1280px] mx-auto px-4">
          {/* Repo title and visibility */}
          <div className="py-4 flex items-center">
            <CodeBracketSquareIcon className="h-4 w-4 text-[#57606a] mr-2" />
            <div className="text-[#0969da] text-lg font-semibold hover:underline">
              <Link to={`/${username}`}>{username}</Link> /{' '}
              <Link to={`/${username}/${repo}`}>{repo}</Link>
            </div>
            {repository?.private && (
              <span className="ml-2 text-xs border border-[#d0d7de] rounded-full px-2 py-0.5">
                Private
              </span>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center -mb-px">
            <nav className="flex flex-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={`/${username}/${repo}${item.path}`}
                  className={`flex items-center px-4 py-2 text-sm border-b-2 ${
                    location.pathname === `/${username}/${repo}${item.path}`
                      ? 'border-[#fd8c73] text-[#24292f] font-semibold'
                      : 'border-transparent text-[#24292f] hover:border-[#d0d7de]'
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Repository actions */}
            <div className="flex items-center gap-2 py-2">
              <div className="flex items-center">
                <button className="flex items-center gap-1 px-3 py-1 text-sm border border-[#d0d7de] rounded-l-md hover:bg-[#f3f4f6] bg-white">
                  <EyeIcon className="h-4 w-4" />
                  Watch
                </button>
                <button className="px-3 py-1 text-sm border border-l-0 border-[#d0d7de] hover:bg-[#f3f4f6] bg-white">
                  {repository?.watchers_count || 0}
                </button>
              </div>

              <div className="flex items-center">
                <button 
                  onClick={handleFork}
                  className="flex items-center gap-1 px-3 py-1 text-sm border border-[#d0d7de] rounded-l-md hover:bg-[#f3f4f6] bg-white"
                >
                  <RepoStarIcon className="h-4 w-4" />
                  Fork
                </button>
                <button className="px-3 py-1 text-sm border border-l-0 border-[#d0d7de] hover:bg-[#f3f4f6] bg-white">
                  {repository?.forks_count || 0}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleStar}
                  className={`flex items-center gap-1 px-3 py-1 text-sm border border-[#d0d7de] rounded-md hover:bg-[#f3f4f6] ${
                    isStarred ? 'bg-[#f3f4f6]' : 'bg-white'
                  }`}
                >
                  <StarIcon className={`h-4 w-4 ${isStarred ? 'fill-current' : ''}`} />
                  <span>{isStarred ? 'Unstar' : 'Star'}</span>
                </button>
                <span className="text-sm text-[#57606a]">
                  {repository?.stargazers_count?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 py-6">
        <div className="grid grid-cols-[minmax(0,1fr)_296px] gap-8">
          {/* Main content */}
          <div>
            {/* File explorer header */}
            <div className="border border-[#d0d7de] rounded-lg">
              <div className="border-b border-[#d0d7de] bg-[#f6f8fa] p-4">
                <div className="flex items-center justify-between">
                  {isViewingCode ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleBackToFiles}
                        className="text-[#0969da] hover:underline flex items-center gap-1"
                      >
                        <ChevronLeftIcon className="h-4 w-4" />
                        Back to files
                      </button>
                      <span className="text-[#57606a]">/</span>
                      <span className="text-[#57606a]">{selectedFile?.path}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setBranchesOpen(!branchesOpen)}
                          className="flex items-center gap-2 px-3 py-1 text-sm border border-[#d0d7de] rounded-md hover:bg-[#f3f4f6] bg-white"
                        >
                          <svg height="16" viewBox="0 0 16 16" width="16" className="fill-current">
                            <path d="M9.5 3.25a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.493 2.493 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25Zm-6 0a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Zm8.25-.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM4.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z"></path>
                          </svg>
                          <span className="font-semibold">master</span>
                          <ChevronDownIcon className="h-4 w-4" />
                        </button>

                        <div className="h-4 w-[1px] bg-[#d0d7de]" />

                        <button className="flex items-center gap-1 px-3 py-1 text-sm border border-[#d0d7de] rounded-md hover:bg-[#f3f4f6] bg-white">
                          <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" className="fill-current">
                            <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
                          </svg>
                          <span>Go to file</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1 px-3 py-1 text-sm border border-[#d0d7de] rounded-md hover:bg-[#f3f4f6] bg-white">
                          Add file
                          <ChevronDownIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="relative">
                          <button 
                            onClick={() => setIsDownloadOpen(!isDownloadOpen)}
                            className="flex items-center gap-1 px-3 py-1 text-sm border border-[#d0d7de] rounded-md hover:bg-[#f3f4f6] bg-[#2da44e] text-white hover:bg-[#2c974b]"
                          >
                            <CodeBracketIcon className="h-4 w-4" />
                            <span>Code</span>
                            <ChevronDownIcon className="h-4 w-4" />
                          </button>

                          {isDownloadOpen && (
                            <div className="absolute top-full right-0 mt-2 w-[400px] bg-white border border-[#d0d7de] rounded-md shadow-lg z-50">
                              <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm font-semibold">Clone</span>
                                  <button onClick={() => setIsDownloadOpen(false)} className="text-[#57606a] hover:text-[#24292f]">
                                    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                                      <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"></path>
                                    </svg>
                                  </button>
                                </div>

                                {/* Clone options tabs */}
                                <div className="flex border-b border-[#d0d7de] mb-3">
                                  <button
                                    onClick={() => setSelectedCloneOption('https')}
                                    className={`px-4 py-2 text-sm ${
                                      selectedCloneOption === 'https'
                                        ? 'border-b-2 border-[#fd8c73] font-semibold'
                                        : 'text-[#57606a] hover:text-[#24292f]'
                                    }`}
                                  >
                                    HTTPS
                                  </button>
                                  <button
                                    onClick={() => setSelectedCloneOption('ssh')}
                                    className={`px-4 py-2 text-sm ${
                                      selectedCloneOption === 'ssh'
                                        ? 'border-b-2 border-[#fd8c73] font-semibold'
                                        : 'text-[#57606a] hover:text-[#24292f]'
                                    }`}
                                  >
                                    SSH
                                  </button>
                                  <button
                                    onClick={() => setSelectedCloneOption('cli')}
                                    className={`px-4 py-2 text-sm ${
                                      selectedCloneOption === 'cli'
                                        ? 'border-b-2 border-[#fd8c73] font-semibold'
                                        : 'text-[#57606a] hover:text-[#24292f]'
                                    }`}
                                  >
                                    GitHub CLI
                                  </button>
                                </div>

                                {/* Clone URL display */}
                                <div className="bg-[#f6f8fa] border border-[#d0d7de] rounded-md p-3 mb-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-[#57606a]">
                                      {selectedCloneOption === 'cli' ? 'Work fast with our official CLI.' : 'Clone with ' + selectedCloneOption.toUpperCase()}
                                    </span>
                                    <button 
                                      className="text-xs text-[#0969da] hover:underline flex items-center gap-1"
                                      onClick={() => {
                                        const url = selectedCloneOption === 'https'
                                          ? `https://github.com/${username}/${repo}.git`
                                          : selectedCloneOption === 'ssh'
                                            ? `git@github.com:${username}/${repo}.git`
                                            : `gh repo clone ${username}/${repo}`;
                                        navigator.clipboard.writeText(url);
                                      }}
                                    >
                                      <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="currentColor" className="mr-1">
                                        <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
                                        <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
                                      </svg>
                                      Copy
                                    </button>
                                  </div>
                                  <code className="text-xs font-mono block select-all">
                                    {selectedCloneOption === 'https'
                                      ? `https://github.com/${username}/${repo}.git`
                                      : selectedCloneOption === 'ssh'
                                        ? `git@github.com:${username}/${repo}.git`
                                        : `gh repo clone ${username}/${repo}`}
                                  </code>
                                </div>

                                <div className="border-t border-[#d0d7de] -mx-4"></div>

                                {/* Bottom options */}
                                <div className="mt-4 space-y-2">
                                  <button
                                    onClick={() => window.open(`github://github.com/${username}/${repo}`, '_blank')}
                                    className="w-full text-left px-4 py-2 hover:bg-[#f3f4f6] text-sm flex items-center gap-2"
                                  >
                                    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
                                      <path d="M0 2.75C0 1.784.784 1 1.75 1h12.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25Zm1.75-.25a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V2.75a.25.25 0 0 0-.25-.25ZM7.25 8a.75.75 0 0 1-.22.53l-2.25 2.25a.75.75 0 1 1-1.06-1.06L5.44 8 3.72 6.28a.75.75 0 1 1 1.06-1.06l2.25 2.25c.141.14.22.331.22.53Zm1.5 1.5h3a.75.75 0 0 0 0-1.5h-3a.75.75 0 0 0 0 1.5Z"></path>
                                    </svg>
                                    Open with GitHub Desktop
                                  </button>
                                  <button
                                    onClick={handleDownload}
                                    className="w-full text-left px-4 py-2 hover:bg-[#f3f4f6] text-sm flex items-center gap-2"
                                  >
                                    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                                      <path d="M7.47 10.78a.75.75 0 001.06 0l3.75-3.75a.75.75 0 00-1.06-1.06L8.75 8.44V1.75a.75.75 0 00-1.5 0v6.69L4.78 5.97a.75.75 0 00-1.06 1.06l3.75 3.75zM3.75 13a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5z"></path>
                                    </svg>
                                    Download ZIP
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                    </>
                  )}
                </div>

                {/* Breadcrumb navigation */}
                {!isViewingCode && currentPath && (
                  <div className="flex items-center gap-1 mt-4 text-sm">
                    <button onClick={() => setCurrentPath('')} className="text-[#0969da] hover:underline">
                      {repo}
                    </button>
                    {getBreadcrumbs().map((crumb, index) => (
                      <React.Fragment key={crumb.path}>
                        <ChevronRightIcon className="h-3 w-3 text-[#57606a]" />
                        <button
                          onClick={() => setCurrentPath(crumb.path)}
                          className="text-[#0969da] hover:underline"
                        >
                          {crumb.name}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>

              {/* Conditional rendering based on view state */}
              {isViewingCode ? (
                // Render only the code viewer when viewing a file
                selectedFile && renderFileContent()
              ) : (
                // Render the file list when not viewing code
                <div className="divide-y divide-[#d0d7de]">
                  {currentPath && (
                    <div
                      className="flex items-center px-4 py-2 hover:bg-[#f6f8fa] cursor-pointer"
                      onClick={handleBackClick}
                    >
                      <FolderIcon className="h-4 w-4 text-[#54aeff] mr-3" />
                      <span className="text-[#0969da] hover:underline">..</span>
                    </div>
                  )}
                  {filesLoading ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0969da] mx-auto"></div>
                    </div>
                  ) : (
                    <>
                      {/* Folders */}
                      {sortedFiles
                        .filter(file => file.type === 'dir')
                        .map(file => (
                          <div
                            key={file.sha}
                            className="flex items-center px-4 py-2 hover:bg-[#f6f8fa] cursor-pointer"
                            onClick={() => handleFileClick(file)}
                          >
                            <FolderIcon className="h-4 w-4 text-[#54aeff] mr-3" />
                            <span className="flex-1 text-[#0969da] hover:underline">
                              {file.name}
                            </span>
                          </div>
                        ))}
                      
                      {/* Files */}
                      {sortedFiles
                        .filter(file => file.type !== 'dir')
                        .map(file => (
                          <div
                            key={file.sha}
                            className="flex items-center px-4 py-2 hover:bg-[#f6f8fa] cursor-pointer"
                            onClick={() => handleFileClick(file)}
                          >
                            <DocumentIcon className="h-4 w-4 text-[#57606a] mr-3" />
                            <span className="flex-1 text-[#0969da] hover:underline">
                              {file.name}
                            </span>
                            <span className="text-xs text-[#57606a] ml-4">
                              {formatFileSize(file.size)}
                            </span>
                          </div>
                        ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* README section */}
            {decodedReadme && (
              <div className="border border-[#d0d7de] rounded-lg mt-6">
                <div className="flex items-center justify-between px-4 py-2 bg-[#f6f8fa] border-b border-[#d0d7de]">
                  <div className="flex items-center gap-2">
                    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" className="fill-current">
                      <path d="M0 1.75A.75.75 0 0 1 .75 1h4.253c1.227 0 2.317.59 3 1.501A3.743 3.743 0 0 1 11.006 1h4.245a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-4.507a2.25 2.25 0 0 0-1.591.659l-.622.621a.75.75 0 0 1-1.06 0l-.622-.621A2.25 2.25 0 0 0 5.258 13H.75a.75.75 0 0 1-.75-.75Zm7.251 10.324.004-5.073-.002-2.253A2.25 2.25 0 0 0 5.003 2.5H1.5v9h3.757a3.75 3.75 0 0 1 1.994.574ZM8.755 4.75l-.004 7.322a3.752 3.752 0 0 1 1.992-.572H14.5v-9h-3.495a2.25 2.25 0 0 0-2.25 2.25Z"></path>
                    </svg>
                    <span className="font-semibold">README.md</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-[#f3f4f6] rounded-md">
                      <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" className="fill-current">
                        <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
                      </svg>
                    </button>
                    <button className="p-1 hover:bg-[#f3f4f6] rounded-md">
                      <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" className="fill-current">
                        <path d="M1.5 2.75a.25.25 0 0 1 .25-.25h12.5a.25.25 0 0 1 .25.25v1.5a.75.75 0 0 0 1.5 0v-1.5A1.75 1.75 0 0 0 14.25 1H1.75A1.75 1.75 0 0 0 0 2.75v1.5a.75.75 0 0 0 1.5 0Z"></path><path d="M12.25 4.75h-8.5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5ZM12.25 9.75h-8.5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5ZM5.75 6.75h-2a.75.75 0 0 0 0 1.5h2a.75.75 0 0 0 0-1.5ZM5.75 11.75h-2a.75.75 0 0 0 0 1.5h2a.75.75 0 0 0 0-1.5Z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="px-8 py-6 prose max-w-none">
                  <ReactMarkdown>{decodedReadme}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <RepositorySidebar repository={repository} languages={languages} />
        </div>
      </div>
    </div>
  );
};

const styles = `
  .syntax-highlighter {
    background-color: white !important;
  }
  .syntax-highlighter code {
    font-family: ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace !important;
  }
  .syntax-highlighter:hover {
    cursor: text;
  }
  .syntax-highlighter pre {
    background-color: white !important;
    margin: 0 !important;
  }
`;

export default Repository;