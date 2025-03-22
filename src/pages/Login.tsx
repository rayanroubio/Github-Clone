import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const { signin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signin(token);
      navigate('/');
    } catch (err) {
      setError('Invalid token. Please try again.');
    }
  };

  const handleGitHubLogin = async () => {
    // Your GitHub OAuth login logic here
    // When you get the token from GitHub:
    try {
      await signin(token); // Make sure this token is the full OAuth token
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f6f8fa]">
      <div className="w-[308px] flex flex-col items-center mb-4">
        <svg height="48" aria-hidden="true" fill="#24292f" viewBox="0 0 16 16" version="1.1" width="48" data-view-component="true">
          <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
        </svg>
        <h1 className="text-[24px] text-[#24292f] mt-4">Sign in to GitHub</h1>
      </div>

      <div className="w-[308px] p-4 bg-white border border-[#d0d7de] rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-4">


          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-[#24292f]">
                Token
              </label>
              <a href="https://github.com/settings/tokens" className="text-sm text-[#0969da] hover:underline">
                Don't have a token?
              </a>
            </div>
            <input
              type="password"
              id="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="mt-1 w-full px-3 py-[5px] bg-white border border-[#d0d7de] rounded-[6px] shadow-sm placeholder-[#6e7781] focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] text-[14px] leading-5"
              required
            />
          </div>

          {error && (
            <div className="p-4 text-[#cf222e] bg-[#FFEBE9] border border-[#cf222e] rounded-[6px] text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-[5px] px-4 text-[14px] font-medium text-white bg-[#2da44e] border border-[#1b1f2326] rounded-[6px] hover:bg-[#2c974b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2da44e]"
          >
            Sign in
          </button>
        </form>
      </div>

      <div className="w-[308px] mt-4 p-4 text-center text-[14px] border border-[#d0d7de] rounded-[6px] bg-white">
        <span className="text-[#24292f]">New to GitHub? </span>
        <a href="https://github.com/signup" className="text-[#0969da] hover:underline">Create an account</a>
      </div>

      <div className="w-[308px] mt-8">
        <ul className="flex items-center justify-center space-x-4 text-[12px] text-[#0969da]">
          <li><a href="#" className="hover:underline">Terms</a></li>
          <li><a href="#" className="hover:underline">Privacy</a></li>
          <li><a href="#" className="hover:underline">Security</a></li>
          <li><a href="#" className="text-[#24292f] hover:text-[#0969da]">Contact GitHub</a></li>
        </ul>
      </div>
    </div>
  );
};

export default Login; 