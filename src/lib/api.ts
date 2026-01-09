import { toast } from '@/hooks/use-toast';

const API_BASE = import.meta.env.VITE_API_URL || '';

export type OptimizeSettings = {
  decimateRatio: number;
  dracoLevel: number;
  textureQuality?: number;
  weld?: boolean;
  quantize?: boolean;
  draco?: boolean;
};

export type OptimizeResponse = {
  status: string;
  originalSize: number;
  optimizedSize: number;
  downloadUrl: string;
  stats: {
    facesBefore: number;
    facesAfter: number;
    verticesBefore: number;
    verticesAfter: number;
  };
};

export async function optimizeFile(
  file: File, 
  settings: OptimizeSettings, 
  memberId?: string,
  onProgress?: (percent: number) => void
): Promise<OptimizeResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('settings', JSON.stringify(settings));

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 50);
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (err) {
          reject(new Error('Invalid server response'));
        }
      } else {
        let errorMessage = 'Optimization failed';
        try {
          const errorData = JSON.parse(xhr.responseText);
          errorMessage = errorData.message || errorMessage;
        } catch {}
        
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        reject(new Error(errorMessage));
      }
    });

    xhr.addEventListener('error', () => {
      const msg = 'Network error during upload';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
      reject(new Error(msg));
    });
    
    xhr.addEventListener('abort', () => reject(new Error('Request aborted')));

    xhr.open('POST', `${API_BASE}/api/optimize`);
    if (memberId) {
      xhr.setRequestHeader('Authorization', `Bearer ${memberId}`);
    }
    xhr.send(formData);
  });
}

export async function downloadFile(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download error:', error);
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to download file',
      variant: 'destructive',
    });
    throw error;
  }
}

export async function deleteOptimization(id: string, memberId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/history/${id}`, {
    method: 'DELETE',
    headers: {
      'x-member-id': memberId
    }
  });

  if (!response.ok) {
    throw new Error('Failed to delete optimization');
  }
}

export async function getStorageUsage(memberId: string): Promise<{ used: number; total: number }> {
  const response = await fetch(`${API_BASE}/api/usage`, {
    headers: {
      'x-member-id': memberId
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch storage usage');
  }
  
  return response.json();
}

export function saveToLocalHistory(result: OptimizeResponse & { original_name: string }) {
  try {
    const history = JSON.parse(localStorage.getItem('glob_local_history') || '[]');
    const newItem = {
      id: `local-${Math.random().toString(36).substr(2, 9)}`,
      original_name: result.original_name,
      original_size: result.originalSize,
      optimized_size: result.optimizedSize,
      created_at: new Date().toISOString(),
      download_url: result.downloadUrl,
      is_local: true
    };
    history.unshift(newItem);
    localStorage.setItem('glob_local_history', JSON.stringify(history.slice(0, 10)));
  } catch (e) {
    console.error('Failed to save to local history', e);
  }
}

export function getLocalHistory() {
  try {
    return JSON.parse(localStorage.getItem('glob_local_history') || '[]');
  } catch (e) {
    return [];
  }
}

export function deleteLocalHistoryItem(id: string) {
  try {
    const history = JSON.parse(localStorage.getItem('glob_local_history') || '[]');
    const newHistory = history.filter((item: any) => item.id !== id);
    localStorage.setItem('glob_local_history', JSON.stringify(newHistory));
  } catch (e) {}
}