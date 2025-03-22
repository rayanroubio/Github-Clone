import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function FileUpload() {
  const { owner, repo } = useParams();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const uploads = Array.from(files).map(async (file) => {
        const content = await file.arrayBuffer();
        const base64Content = btoa(String.fromCharCode(...new Uint8Array(content)));

        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file.name}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Add ${file.name}`,
            content: base64Content,
          }),
        });

        if (!response.ok) throw new Error('Failed to upload file');
        return response.json();
      });

      return Promise.all(uploads);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repository', owner, repo, 'contents'] });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadMutation.mutate(e.dataTransfer.files);
    }
  };

  return (
    <div className="p-6">
      <div
        className={`border-2 border-dashed rounded-lg p-16 text-center ${
          dragActive ? 'border-[#0969da] bg-[#f6f8fa]' : 'border-[#d0d7de]'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-[#57606a]" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-1">
          Drag files here to add them to your repository
        </h3>
        <p className="text-[#57606a]">
          or{' '}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-[#0969da] hover:underline"
          >
            choose your files
          </button>
        </p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              uploadMutation.mutate(e.target.files);
            }
          }}
          multiple
          className="hidden"
        />
      </div>

      {uploadMutation.isPending && (
        <div className="mt-4 text-center text-[#57606a]">
          Uploading files...
        </div>
      )}

      {uploadMutation.isError && (
        <div className="mt-4 text-center text-[#cf222e]">
          Failed to upload files. Please try again.
        </div>
      )}
    </div>
  );
} 