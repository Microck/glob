import OptimizerWorker from '../workers/optimizer.worker?worker';
import type { OptimizeOptions, OptimizeStats } from '../workers/optimizer.worker';

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

    worker.onmessage = (e) => {
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
      reject(new Error('Worker error: ' + err.message));
      worker.terminate();
    };

    worker.postMessage({ id, file, options });
  });
}
