import { useState, useCallback, useEffect } from 'react';
import NoiseOverlay from '@/components/NoiseOverlay';
import GridBackground from '@/components/GridBackground';
import DropZone from '@/components/DropZone';
import GLBViewer from '@/components/GLBViewer';
import Controls from '@/components/Controls';
import ProgressBar from '@/components/ProgressBar';
import DownloadPanel from '@/components/DownloadPanel';
import ScrambleText from '@/components/ScrambleText';

type AppState = 'idle' | 'preview' | 'processing' | 'complete';

const PROCESSING_MESSAGES = [
  'LOADING_GEOMETRY...',
  'ANALYZING_MESH...',
  'APPLYING_DECIMATION...',
  'ENCODING_DRACO...',
  'OPTIMIZING_BUFFERS...',
  'FINALIZING...',
];

const Index = () => {
  const [appState, setAppState] = useState<AppState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [decimation, setDecimation] = useState(50);
  const [dracoLevel, setDracoLevel] = useState(7);
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [compressedSize, setCompressedSize] = useState(0);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setAppState('preview');
  }, []);

  const handleReset = useCallback(() => {
    setFile(null);
    setAppState('idle');
    setProgress(0);
    setCompressedSize(0);
  }, []);

  const handleCompress = useCallback(() => {
    if (!file) return;
    
    setAppState('processing');
    setProgress(0);
    
    // Simulate processing with console-style messages
    let currentStep = 0;
    const totalSteps = PROCESSING_MESSAGES.length;
    
    const interval = setInterval(() => {
      if (currentStep < totalSteps) {
        setCurrentMessage(PROCESSING_MESSAGES[currentStep]);
        setProgress(Math.floor(((currentStep + 1) / totalSteps) * 100));
        currentStep++;
      } else {
        clearInterval(interval);
        // Simulate compression result (random 30-70% reduction)
        const reduction = 0.3 + Math.random() * 0.4;
        setCompressedSize(file.size * (1 - reduction));
        setAppState('complete');
      }
    }, 800);
  }, [file]);

  const handleDownload = useCallback(() => {
    if (!file) return;
    
    // Create download (in real implementation, this would be the compressed file)
    const blob = new Blob([file], { type: 'model/gltf-binary' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace(/\.(glb|gltf)$/i, '_compressed.glb');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background layers */}
      <GridBackground />
      <NoiseOverlay />
      
      {/* Header */}
      <header className="fixed top-0 left-0 z-40 p-6">
        <h1 className="font-display text-xl text-reading tracking-brutal">
          GLB_COMPRESSOR
        </h1>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 relative z-10">
        {appState === 'idle' && (
          <>
            <DropZone onFileSelect={handleFileSelect} />
            <div className="mt-8 w-full max-w-xl">
              <Controls
                decimation={decimation}
                dracoLevel={dracoLevel}
                onDecimationChange={setDecimation}
                onDracoChange={setDracoLevel}
                onCompress={handleCompress}
                isProcessing={false}
                hasFile={false}
              />
            </div>
          </>
        )}
        
        {appState === 'preview' && file && (
          <>
            <GLBViewer file={file} onReset={handleReset} />
            <div className="mt-8 w-full max-w-xl">
              <Controls
                decimation={decimation}
                dracoLevel={dracoLevel}
                onDecimationChange={setDecimation}
                onDracoChange={setDracoLevel}
                onCompress={handleCompress}
                isProcessing={false}
                hasFile={true}
              />
            </div>
          </>
        )}
        
        {appState === 'processing' && (
          <div className="w-full max-w-xl">
            <div className="mb-8 text-center">
              <ScrambleText 
                text="COMPRESSING" 
                isActive={true}
                className="font-display text-5xl text-active tracking-brutal"
              />
            </div>
            <ProgressBar progress={progress} message={currentMessage} />
          </div>
        )}
        
        {appState === 'complete' && file && (
          <DownloadPanel
            originalSize={file.size}
            compressedSize={compressedSize}
            onDownload={handleDownload}
            onReset={handleReset}
          />
        )}
      </main>
      
      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 p-6 flex justify-between">
        <span className="font-ui text-xs text-muted">
          v1.0.0
        </span>
        <span className="font-ui text-xs text-muted">
          RAW_UTILITY
        </span>
      </footer>
    </div>
  );
};

export default Index;
