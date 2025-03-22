import { useState } from 'react';
import axios from 'axios';

export const useStarRepository = () => {
  const [isLoading, setIsLoading] = useState(false);

  const toggleStar = async (owner: string, repo: string, isCurrentlyStarred: boolean) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('github_token');
      if (!token) throw new Error('No authentication token found');

      await axios({
        method: isCurrentlyStarred ? 'DELETE' : 'PUT',
        url: `https://api.github.com/user/starred/${owner}/${repo}`,
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  return { toggleStar, isLoading };
}; 