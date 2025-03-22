import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const useRepositoryActions = () => {
  const queryClient = useQueryClient();

  const starRepository = useMutation({
    mutationFn: async ({ owner, repo, action }: { owner: string; repo: string; action: 'star' | 'unstar' }) => {
      const token = localStorage.getItem('github_token');
      if (!token) throw new Error('No authentication token found');

      await axios({
        method: action === 'star' ? 'PUT' : 'DELETE',
        url: `https://api.github.com/user/starred/${owner}/${repo}`,
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
    },
    onError: (error) => {
      console.error('Star operation failed:', error);
      throw error;
    },
  });

  const forkRepository = useMutation({
    mutationFn: async ({ owner, repo }: { owner: string; repo: string }) => {
      const token = localStorage.getItem('github_token');
      if (!token) throw new Error('No authentication token found');

      const { data } = await axios.post(
        `https://api.github.com/repos/${owner}/${repo}/forks`,
        {},
        {
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );
      return data;
    },
  });

  return {
    starRepository,
    forkRepository,
    isStarring: starRepository.isPending,
    isForking: forkRepository.isPending,
  };
}; 