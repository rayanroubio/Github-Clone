import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  Bars3Icon,
  PlusIcon,
  BellIcon,
  ClockIcon,
  CommandLineIcon,
  UsersIcon,
  QuestionMarkCircleIcon,
  HomeIcon,
  UserIcon,
  BookOpenIcon,
  BeakerIcon,
  StarIcon,
  CodeBracketIcon,
  BuildingOfficeIcon,
  RocketLaunchIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface RepositoryData {
  private: boolean;
  // Add other repository fields as needed
}

const Header: React.FC = () => {
  const { user, signout } = useAuth();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { username, repo } = useParams();
  
  // Only fetch repository data if we're on a repository page
  const { data: repository } = useQuery<RepositoryData>({
    queryKey: ['repository', username, repo],
    queryFn: async () => {
      if (!username || !repo) return null;
      const { data } = await axios.get(`https://api.github.com/repos/${username}/${repo}`, {
        headers: { Authorization: `token ${localStorage.getItem('github_token')}` },
      });
      return data;
    },
    enabled: !!username && !!repo, // Only run query when username and repo are available
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const searchInput = e.currentTarget.querySelector('input') as HTMLInputElement;
    const query = searchInput.value.trim();
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}&type=repositories`);
    }
  };
  

  return (
    <header className="bg-white border-b border-[#d0d7de] h-[64px] flex items-center fixed top-0 left-0 right-0 z-50">
      <div className="w-full px-4 flex items-center gap-4">
        {/* Left section */}
        <button className="p-1.5 border border-[#d0d7de] rounded-md hover:bg-[#f3f4f6]">
          <Bars3Icon className="h-4 w-4 text-[#24292f]" />
        </button>

        <Link to="/" className="flex items-center gap-2">
          <svg height="32" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="32" className="text-[#24292f]">
            <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
          </svg>
          <div className="flex items-center text-[#24292f] font-semibold">
            {location.pathname === '/' ? (
              'Dashboard'
            ) : (
              <div className="flex items-center gap-1">
                {username && (
                  <>
                    <div className="flex items-center">
                      <Link to={`/${username}`} className="hover:text-[#0969da]">{username}</Link>
                      <span className="text-[#57606a] mx-1">/</span>
                      {repo && (
                        <Link to={`/${username}/${repo}`} className="hover:text-[#0969da]">
                          {repo}
                          {repository?.private && (
                            <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" className="ml-1 text-[#57606a]">
                              <path d="M4 4a4 4 0 0 1 8 0v2h.25c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25v-5.5C2 6.784 2.784 6 3.75 6H4Zm8.25 3.5h-8.5a.25.25 0 0 0-.25.25v5.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-5.5a.25.25 0 0 0-.25-.25ZM10.5 6V4a2.5 2.5 0 0 0-5 0v2Z"></path>
                            </svg>
                          )}
                        </Link>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </Link>


        {/* Right section */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Type / to search"
              className="w-[272px] h-[28px] bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-3 py-1.5 pl-8 pr-3 text-sm text-[#24292f] placeholder-[#57606a] focus:bg-white focus:border-[#0969da] focus:outline-none focus:ring-1 focus:ring-[#0969da]"
            />
            <div className="absolute left-2 top-1.5 flex items-center">
              <MagnifyingGlassIcon className="h-4 w-4 text-[#57606a]" />
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <div className="border border-[#d0d7de] rounded px-1.5 py-0.5 text-[10px] text-[#57606a] bg-[#f6f8fa]">
                /
              </div>
            </div>
          </form>

          <button className="flex items-center gap-1 px-2 py-1 text-sm border border-[#d0d7de] rounded-md hover:bg-[#f3f4f6] bg-white">
          <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" className="octicon octicon-copilot Button-visual">
              <path d="M7.998 15.035c-4.562 0-7.873-2.914-7.998-3.749V9.338c.085-.628.677-1.686 1.588-2.065.013-.07.024-.143.036-.218.029-.183.06-.384.126-.612-.201-.508-.254-1.084-.254-1.656 0-.87.128-1.769.693-2.484.579-.733 1.494-1.124 2.724-1.261 1.206-.134 2.262.034 2.944.765.05.053.096.108.139.165.044-.057.094-.112.143-.165.682-.731 1.738-.899 2.944-.765 1.23.137 2.145.528 2.724 1.261.566.715.693 1.614.693 2.484 0 .572-.053 1.148-.254 1.656.066.228.098.429.126.612.012.076.024.148.037.218.924.385 1.522 1.471 1.591 2.095v1.872c0 .766-3.351 3.795-8.002 3.795Zm0-1.485c2.28 0 4.584-1.11 5.002-1.433V7.862l-.023-.116c-.49.21-1.075.291-1.727.291-1.146 0-2.059-.327-2.71-.991A3.222 3.222 0 0 1 8 6.303a3.24 3.24 0 0 1-.544.743c-.65.664-1.563.991-2.71.991-.652 0-1.236-.081-1.727-.291l-.023.116v4.255c.419.323 2.722 1.433 5.002 1.433ZM6.762 2.83c-.193-.206-.637-.413-1.682-.297-1.019.113-1.479.404-1.713.7-.247.312-.369.789-.369 1.554 0 .793.129 1.171.308 1.371.162.181.519.379 1.442.379.853 0 1.339-.235 1.638-.54.315-.322.527-.827.617-1.553.117-.935-.037-1.395-.241-1.614Zm4.155-.297c-1.044-.116-1.488.091-1.681.297-.204.219-.359.679-.242 1.614.091.726.303 1.231.618 1.553.299.305.784.54 1.638.54.922 0 1.28-.198 1.442-.379.179-.2.308-.578.308-1.371 0-.765-.123-1.242-.37-1.554-.233-.296-.693-.587-1.713-.7Z"></path><path d="M6.25 9.037a.75.75 0 0 1 .75.75v1.501a.75.75 0 0 1-1.5 0V9.787a.75.75 0 0 1 .75-.75Zm4.25.75v1.501a.75.75 0 0 1-1.5 0V9.787a.75.75 0 0 1 1.5 0Z"></path>
          </svg>
          <ChevronDownIcon className="h-3 w-3" />
          </button>

          <button className="flex items-center gap-1 px-2 py-1 text-sm border border-[#d0d7de] rounded-md hover:bg-[#f3f4f6] bg-white">
            <PlusIcon className="h-4 w-4" />
            <ChevronDownIcon className="h-3 w-3" />
          </button>

          <button className="p-1.5 border border-[#d0d7de] rounded-md hover:bg-[#f3f4f6]">
          <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" className="octicon octicon-issue-opened Button-visual">
              <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path>
          </svg>
          </button>

          <button className="p-1.5 border border-[#d0d7de] rounded-md hover:bg-[#f3f4f6]">
          <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" className="octicon octicon-git-pull-request Button-visual">
              <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z"></path>
          </svg>
          </button>

          <button className="p-1.5 border border-[#d0d7de] rounded-md hover:bg-[#f3f4f6]">
          <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" className="octicon octicon-inbox Button-visual">
                <path d="M2.8 2.06A1.75 1.75 0 0 1 4.41 1h7.18c.7 0 1.333.417 1.61 1.06l2.74 6.395c.04.093.06.194.06.295v4.5A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25v-4.5c0-.101.02-.202.06-.295Zm1.61.44a.25.25 0 0 0-.23.152L1.887 8H4.75a.75.75 0 0 1 .6.3L6.625 10h2.75l1.275-1.7a.75.75 0 0 1 .6-.3h2.863L11.82 2.652a.25.25 0 0 0-.23-.152Zm10.09 7h-2.875l-1.275 1.7a.75.75 0 0 1-.6.3h-3.5a.75.75 0 0 1-.6-.3L4.375 9.5H1.5v3.75c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25Z"></path>
            </svg>
          </button>

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center"
            >
              <img
                src={user?.avatar_url}
                alt={user?.login}
                className="w-[32px] h-[32px] rounded-full cursor-pointer"
              />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-[180px] bg-white rounded-lg shadow-lg border border-[#d0d7de] py-1 z-50">
                <div className="px-4 py-2 text-sm">
                  <div className="font-semibold">{user?.name}</div>
                  <div className="text-[#57606a]">{user?.login}</div>
                </div>

                <div className="px-4 py-1 text-xs text-[#57606a] border-t border-[#d0d7de]">
                  <HomeIcon className="inline h-3 w-3 mr-2" />
                  Working from home
                </div>

                <div className="border-t border-[#d0d7de] my-1" />

                <Link to={`/${user?.login}`} className="block px-4 py-2 text-sm text-[#24292f] hover:bg-[#f3f4f6] flex items-center">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Your profile
                </Link>

                <Link to="/repositories" className="block px-4 py-2 text-sm text-[#24292f] hover:bg-[#f3f4f6] flex items-center">
                  <BookOpenIcon className="h-4 w-4 mr-2" />
                  Your repositories
                </Link>

                <Link to="/copilot" className="block px-4 py-2 text-sm text-[#24292f] hover:bg-[#f3f4f6] flex items-center">
                  <BeakerIcon className="h-4 w-4 mr-2" />
                  Your Copilot
                </Link>

                <Link to="/projects" className="block px-4 py-2 text-sm text-[#24292f] hover:bg-[#f3f4f6] flex items-center">
                  <CodeBracketIcon className="h-4 w-4 mr-2" />
                  Your projects
                </Link>

                <Link to="/stars" className="block px-4 py-2 text-sm text-[#24292f] hover:bg-[#f3f4f6] flex items-center">
                  <StarIcon className="h-4 w-4 mr-2" />
                  Your stars
                </Link>

                <Link to="/gists" className="block px-4 py-2 text-sm text-[#24292f] hover:bg-[#f3f4f6] flex items-center">
                  <CodeBracketIcon className="h-4 w-4 mr-2" />
                  Your gists
                </Link>

                <Link to="/organizations" className="block px-4 py-2 text-sm text-[#24292f] hover:bg-[#f3f4f6] flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                  Your organizations
                </Link>

                <div className="border-t border-[#d0d7de] my-1" />

                <Link to="/enterprise" className="block px-4 py-2 text-sm text-[#24292f] hover:bg-[#f3f4f6] flex items-center justify-between">
                  <div className="flex items-center">
                    <RocketLaunchIcon className="h-4 w-4 mr-2" />
                    Try Enterprise
                  </div>
                  <span className="px-2 py-0.5 text-xs bg-[#f6f8fa] border border-[#d0d7de] rounded-full">Free</span>
                </Link>

                <Link to="/features" className="block px-4 py-2 text-sm text-[#24292f] hover:bg-[#f3f4f6] flex items-center justify-between">
                  <div className="flex items-center">
                    <BeakerIcon className="h-4 w-4 mr-2" />
                    Feature preview
                  </div>
                  <span className="px-2 py-0.5 text-xs bg-[#ddf4ff] text-[#0969da] rounded-full">New</span>
                </Link>

                <Link to="/settings" className="block px-4 py-2 text-sm text-[#24292f] hover:bg-[#f3f4f6] flex items-center">
                  <Cog6ToothIcon className="h-4 w-4 mr-2" />
                  Settings
                </Link>

                <div className="border-t border-[#d0d7de]" />

                <button
                  onClick={signout}
                  className="block w-full text-left px-4 py-2 text-sm text-[#24292f] hover:bg-[#f3f4f6]"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;