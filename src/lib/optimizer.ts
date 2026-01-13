import OptimizerWorker from '../workers/optimizer.worker?worker';

export type OptimizeOptions = {
  decimateRatio: number;
  dracoLevel: number;
  textureQuality?: number;
  weld?: boolean;
  quantize?: boolean;
  draco?: boolean;
};

export type OptimizeStats = {
  facesBefore: number;
  facesAfter: number;
  verticesBefore: number;
  verticesAfter: number;
};

export type LocalOptimizeResponse = {
  status: 'success' | 'error';
  originalSize: number;
  optimizedSize: number;
  result: ArrayBuffer;
  stats: OptimizeStats;
  error?: string;
};

export function optimizeFileLocal(
  file: File,
  options: OptimizeOptions,
  onProgress?: (percent: number, message?: string) => void
): Promise<LocalOptimizeResponse> {
  return new Promise((resolve, reject) => {
    const worker = new OptimizerWorker();
    const id = Math.random().toString(36).substr(2, 9);

    let fakeProgress = 5;
    onProgress?.(fakeProgress, "LOADING FILE...");
    
    const fakeInterval = setInterval(() => {
      fakeProgress += 2;
      if (fakeProgress > 25) {
        clearInterval(fakeInterval);
      } else {
        onProgress?.(fakeProgress, "LOADING FILE...");
      }
    }, 150);

    worker.onmessage = (e) => {
      clearInterval(fakeInterval);
      const { type, id: msgId, progress, message, result, stats, error } = e.data;
      if (msgId !== id) return;

      if (type === 'progress') {
        onProgress?.(progress, message);
      } else if (type === 'complete') {
        resolve({
          status: 'success',
          originalSize: file.size,
          optimizedSize: result.byteLength,
          result,
          stats
        });
        worker.terminate();
      } else if (type === 'error') {
        reject(new Error(error));
        worker.terminate();
      }
    };

    worker.onerror = (err) => {
      console.error("Worker lifecycle error:", err);
      const msg = err instanceof ErrorEvent ? err.message : 'Unknown worker error';
      reject(new Error('Worker error: ' + msg));
      worker.terminate();
    };

    worker.postMessage({ id, file, options });
  });
}
