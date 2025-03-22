import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  CodeBracketIcon,
  BookOpenIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  CommandLineIcon,
  ArchiveBoxIcon,
  BookmarkIcon,
  HashtagIcon,
  ShoppingBagIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface LanguageCount {
  [key: string]: number;
}

interface LanguageStats {
  [key: string]: number;
}

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'repositories';
  const language = searchParams.get('language') || '';

  // Updated language colors mapping with more accurate GitHub colors
  const languageColors: { [key: string]: string } = {
    JavaScript: '#f1e05a',
    Python: '#3572A5',
    Java: '#b07219',
    TypeScript: '#3178c6',
    C: '#555555',
    'C++': '#f34b7d',
    'C#': '#178600',
    Ruby: '#701516',
    PHP: '#4F5D95',
    Swift: '#F05138',
    Go: '#00ADD8',
    Rust: '#dea584',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Shell: '#89e051',
    PowerShell: '#012456',
    // Add more languages as needed
  };

  // Remove the hardcoded counts from filterCategories
  const filterCategories = [
    { name: 'Code', icon: CodeBracketIcon, type: 'code' },
    { name: 'Repositories', icon: BookOpenIcon, type: 'repositories' },
    { name: 'Issues', icon: ExclamationCircleIcon, type: 'issues' },
    { name: 'Pull requests', icon: ArrowPathIcon, type: 'pulls' },
    { name: 'Discussions', icon: ChatBubbleLeftIcon, type: 'discussions' },
    { name: 'Users', icon: UserIcon, type: 'users' },
    { name: 'Commits', icon: CommandLineIcon, type: 'commits' },
    { name: 'Packages', icon: ArchiveBoxIcon, type: 'packages' },
    { name: 'Wikis', icon: BookmarkIcon, type: 'wikis' },
    { name: 'Topics', icon: HashtagIcon, type: 'topics' },
    { name: 'Marketplace', icon: ShoppingBagIcon, type: 'marketplace' },
  ];

  // Update the query function to fetch counts for all categories
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', query, type, language],
    queryFn: async () => {
      let searchQuery = query;
      if (language) {
        searchQuery = `${query} language:${language}`;
      }

      // Fetch counts for all categories in parallel
      const counts = await Promise.all(
        filterCategories.map(async (category) => {
          try {
            const response = await axios.get(
              `https://api.github.com/search/${category.type}?q=${encodeURIComponent(searchQuery)}&per_page=1`,
              {
                headers: { Authorization: `token ${localStorage.getItem('github_token')}` },
              }
            );
            return { type: category.type, count: response.data.total_count };
          } catch (error) {
            return { type: category.type, count: 0 };
          }
        })
      );

      const [repoResults, codeResults] = await Promise.all([
        axios.get(`https://api.github.com/search/repositories?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `token ${localStorage.getItem('github_token')}` },
        }),
        axios.get(`https://api.github.com/search/code?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `token ${localStorage.getItem('github_token')}` },
        }),
      ]);

      // Calculate language statistics
      const languageStats = repoResults.data.items.reduce((acc: LanguageCount, repo: any) => {
        if (repo.language) {
          acc[repo.language] = (acc[repo.language] || 0) + 1;
        }
        return acc;
      }, {});

      return {
        repositories: repoResults.data,
        code: codeResults.data,
        languageStats,
        categoryCounts: Object.fromEntries(counts.map(c => [c.type, c.count])),
      };
    },
    enabled: !!query,
  });

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6 mt-[64px]">
      <div className="flex gap-6">
        {/* Left sidebar */}
        <div className="w-[256px] flex-shrink-0">
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Filter by</h3>
            <div className="space-y-1">
              {filterCategories.map((category) => (
                <Link
                  key={category.name}
                  to={`/search?q=${query}&type=${category.type}`}
                  className={`flex items-center justify-between px-2 py-1 text-sm rounded-md ${
                    type === category.type
                      ? 'bg-[#0969da] text-white'
                      : 'hover:bg-[#f6f8fa]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <category.icon className="h-4 w-4" />
                    {category.name}
                  </span>
                  <span className={`${type === category.type ? 'text-white' : 'text-[#57606a]'}`}>
                    {searchResults?.categoryCounts?.[category.type]?.toLocaleString() || '0'}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Languages section */}
          {searchResults?.languageStats && Object.keys(searchResults.languageStats).length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Languages</h3>
                {language && (
                  <Link
                    to={`/search?q=${query}&type=${type}`}
                    className="text-xs text-[#0969da] hover:underline"
                  >
                    Clear filter
                  </Link>
                )}
              </div>
              <div className="space-y-1">
                {(Object.entries(searchResults.languageStats) as Array<[string, number]>)
                  .sort((a, b) => b[1] - a[1])
                  .map(([language, count]) => (
                    <Link
                      key={language}
                      to={`/search?q=${query}&language=${encodeURIComponent(language)}`}
                      className={`flex items-center justify-between px-2 py-1 text-sm rounded-md ${
                        language === language
                          ? 'bg-[#0969da] text-white'
                          : 'hover:bg-[#f6f8fa]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: languageColors[language] || '#8b949e' }}
                        />
                        {language}
                      </span>
                      <span>{count}</span>
                    </Link>
                  ))}
                <Link
                  to="#"
                  className="flex items-center px-2 py-1 text-sm text-[#0969da] hover:bg-[#f6f8fa] rounded-md"
                >
                  More languages...
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Main content - Search results */}
        <div className="flex-1">
          <div className="flex gap-6">
            {/* Search results column */}
            <div className="flex-1">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0969da]"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="pb-4 border-b border-[#d0d7de]">
                    <h2 className="font-semibold">
                      {searchResults?.repositories?.total_count?.toLocaleString()} repository results
                    </h2>
                  </div>

                  {searchResults?.repositories?.items?.map((repo: any) => (
                    <div key={repo.id} className="p-4 border border-[#d0d7de] rounded-md">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link
                            to={`/${repo.full_name}`}
                            className="text-[#0969da] hover:underline font-semibold"
                          >
                            {repo.full_name}
                          </Link>
                          
                          <p className="mt-1 text-sm text-[#57606a]">
                            {repo.description}
                          </p>
                          
                          <div className="flex items-center gap-4 mt-2 text-xs text-[#57606a]">
                            {repo.language && (
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-[#3178c6]"></span>
                                {repo.language}
                              </span>
                            )}
                            
                            <span className="flex items-center gap-1">
                              <StarIcon className="h-4 w-4" />
                              {repo.stargazers_count.toLocaleString()}
                            </span>
                            
                            <span>
                              Updated {new Date(repo.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <button className="flex items-center gap-1 px-3 py-1 text-sm border border-[#d0d7de] rounded-md hover:bg-[#f3f4f6]">
                          <StarIcon className="h-4 w-4" />
                          Star
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sponsorship card */}
            <div className="w-[296px] flex-shrink-0">
              <div className="p-6 bg-white border border-[#d0d7de] rounded-lg">
                <div className="flex items-start gap-3">
                  <img 
                    src="https://github.com/images/modules/search/mona-love.png" 
                    alt="Mona" 
                    className="w-12 h-12"
                  />
                  <div>
                    <h3 className="font-semibold text-[#24292f] text-base leading-6">
                      Sponsor open source projects you depend on
                    </h3>
                    <p className="mt-1 text-sm text-[#57606a] leading-5">
                      Contributors are working behind the scenes to make open source better for everyone—give them the help and recognition they deserve.
                    </p>
                    <a 
                      href="#" 
                      className="inline-flex items-center mt-2 text-sm text-[#0969da] hover:underline"
                    >
                      Explore sponsorable projects →
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-white border border-[#d0d7de] rounded-lg">
                <div className="text-sm">
                  <div className="flex items-center gap-1">
                    <span>How can we improve search?</span>
                    <a href="#" className="text-[#0969da] hover:underline">Give feedback</a>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[#57606a]">
                    <span className="inline-flex">
                      <span className="px-[5px] py-[3px] bg-[#f6f8fa] border border-[#d0d7de] rounded text-xs font-medium">/</span>
                    </span>
                    <span>ProTip! Press the</span>
                    <span>key to activate the search input again and adjust your query.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search; 