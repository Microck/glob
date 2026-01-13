import { toast } from '@/hooks/use-toast';
import { optimizeFileLocal } from './optimizer';

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
  onProgress?: (percent: number) => void,
  onStatus?: (message: string) => void
): Promise<OptimizeResponse> {
  
  onStatus?.('INITIALIZING WORKER...');
  onProgress?.(0);

  let localResult;
  try {
    localResult = await optimizeFileLocal(file, settings, (p, m) => {
      const percent = Math.floor(p * 0.8);
      onProgress?.(percent);
      if (m) onStatus?.(m.toUpperCase());
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Optimization failed";
    console.error(err);
    toast({ title: "Local Optimization Failed", description: msg, variant: "destructive" });
    throw err;
  }

  onStatus?.('UPLOADING RESULT...');
  onProgress?.(85);

  try {
    const resultBlob = new Blob([localResult.result], { type: 'model/gltf-binary' });
    const ext = file.name.match(/\.(glb|gltf)$/i)?.[0] || '.glb';
    const filename = file.name.replace(ext, '.glb'); 
    
    const urlResponse = await fetch(`${API_BASE}/api/get-upload-url?filename=${encodeURIComponent(filename)}`, {
        headers: memberId ? { 'Authorization': `Bearer ${memberId}` } : {}
    });
    if (!urlResponse.ok) throw new Error('Failed to get upload URL');
    const { uploadUrl, key } = await urlResponse.json();

    await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', 'model/gltf-binary');
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percent = 80 + Math.floor((e.loaded / e.total) * 15);
            onProgress?.(percent);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(true);
          else reject(new Error('R2 upload failed'));
        });
        
        xhr.addEventListener('error', () => reject(new Error('Network error during result upload')));
        xhr.send(resultBlob);
    });

    onProgress?.(95);
    onStatus?.('REGISTERING...');

    const registerResponse = await fetch(`${API_BASE}/api/register-result`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(memberId ? { 'Authorization': `Bearer ${memberId}` } : {})
        },
        body: JSON.stringify({
            storageKey: key,
            originalName: file.name,
            originalSize: localResult.originalSize,
            optimizedSize: localResult.optimizedSize,
            stats: localResult.stats
        })
    });

    if (!registerResponse.ok) throw new Error('Failed to register optimization result');
    const registerData = await registerResponse.json();

    onProgress?.(100);
    
    return {
        status: 'success',
        originalSize: localResult.originalSize,
        optimizedSize: localResult.optimizedSize,
        downloadUrl: registerData.downloadUrl,
        stats: localResult.stats
    };

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Upload failed';
    console.error(error);
    toast({ title: 'Error', description: msg, variant: 'destructive' });
    throw error;
  }
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