import { toast } from '@/hooks/use-toast';

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

    xhr.open('POST', '/api/optimize');
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
  const response = await fetch(`/api/history/${id}`, {
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
  const response = await fetch(`/api/usage`, {
    headers: {
      'x-member-id': memberId
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch storage usage');
  }
  
  return response.json();
}