import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export const useRepositoryActions = () => {
  const starRepository = useMutation({
    mutationFn: async ({ owner, repo, action }: { owner: string; repo: string; action: 'star' | 'unstar' }) => {
      const response = await axios({
        method: action === 'star' ? 'PUT' : 'DELETE',
        url: `https://api.github.com/user/starred/${owner}/${repo}`,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('github_token')}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      return { success: response.status === 204, action };
    },
  });

  const forkRepository = useMutation({
    mutationFn: async ({ owner, repo }: { owner: string; repo: string }) => {
      const response = await axios.post(
        `https://api.github.com/repos/${owner}/${repo}/forks`,
        {},
        {
          headers: {
            'Authorization': `token ${localStorage.getItem('github_token')}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );
      return response.data;
    },
  });

  return {
    starRepository,
    forkRepository,
  };
}; 