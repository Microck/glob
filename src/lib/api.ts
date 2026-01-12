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
  const MAX_DIRECT_UPLOAD_SIZE = 4 * 1024 * 1024;
  
  if (file.size > MAX_DIRECT_UPLOAD_SIZE) {
    try {
      const urlResponse = await fetch(`${API_BASE}/api/get-upload-url?filename=${encodeURIComponent(file.name)}`, {
        headers: memberId ? { 'Authorization': `Bearer ${memberId}` } : {}
      });
      if (!urlResponse.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, key } = await urlResponse.json();

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', 'model/gltf-binary');
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && onProgress) {
            const percent = Math.round((e.loaded / e.total) * 40);
            onProgress(percent);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(true);
          else reject(new Error('R2 upload failed'));
        });
        
        xhr.addEventListener('error', () => reject(new Error('Network error during R2 upload')));
        xhr.send(file);
      });

      let simulatedProgress = 40;
      const progressInterval = setInterval(() => {
        simulatedProgress += 2;
        if (simulatedProgress <= 90 && onProgress) {
          onProgress(simulatedProgress);
        }
      }, 500);

      const optimizeResponse = await fetch(`${API_BASE}/api/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(memberId ? { 'Authorization': `Bearer ${memberId}` } : {})
        },
        body: JSON.stringify({
          storageKey: key,
          settings: JSON.stringify(settings),
          originalName: file.name
        })
      });

      clearInterval(progressInterval);

      if (!optimizeResponse.ok) {
        const error = await optimizeResponse.json();
        throw new Error(error.message || 'Optimization failed');
      }

      const result = await optimizeResponse.json();
      if (onProgress) onProgress(100);
      return result;

    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Upload failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
      throw error;
    }
  }

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
    const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
    const resolvedUrl = new URL(fullUrl, window.location.href);
    const isSameOrigin = resolvedUrl.origin === window.location.origin;

    const link = document.createElement('a');
    link.href = resolvedUrl.toString();
    if (isSameOrigin) {
      link.download = filename;
    }
    link.rel = 'noopener';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      'Authorization': `Bearer ${memberId}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to delete optimization');
  }
}

export async function getStorageUsage(memberId: string): Promise<{ used: number; total: number }> {
  const response = await fetch(`${API_BASE}/api/usage`, {
    headers: {
      'Authorization': `Bearer ${memberId}`
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