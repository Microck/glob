import { toast } from '@/hooks/use-toast';

export type OptimizeSettings = {
  decimateRatio: number;
  dracoLevel: number;
  textureQuality?: number;
};

export type OptimizeResponse = {
  status: string;
  originalSize: number;
  optimizedSize: number;
  downloadUrl: string;
  stats: {
    facesBefore: number;
    facesAfter: number;
  };
};

export async function optimizeFile(file: File, settings: OptimizeSettings): Promise<OptimizeResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('settings', JSON.stringify(settings));

  try {
    const response = await fetch('/api/optimize', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Optimization failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Optimization error:', error);
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to optimize file',
      variant: 'destructive',
    });
    throw error;
  }
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