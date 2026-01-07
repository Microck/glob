import { useState, useCallback } from 'react';
import NoiseOverlay from '@/components/NoiseOverlay';
import GridBackground from '@/components/GridBackground';
import DropZone from '@/components/DropZone';
import GLBViewer from '@/components/GLBViewer';
import Controls from '@/components/Controls';
import ProgressBar from '@/components/ProgressBar';
import ComparisonViewer from '@/components/ComparisonViewer';
import ScrambleText from '@/components/ScrambleText';
import FileLoading from '@/components/FileLoading';
import { optimizeFile, downloadFile } from '@/lib/api';

type AppState = 'idle' | 'loading' | 'preview' | 'processing' | 'complete';

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
  const [downloadUrl, setDownloadUrl] = useState('');
  const [facesBefore, setFacesBefore] = useState(0);
  const [facesAfter, setFacesAfter] = useState(0);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setAppState('loading');
    
    // Simulate file processing/loading time
    setTimeout(() => {
      setAppState('preview');
    }, 1500);
  }, []);

  const handleReset = useCallback(() => {
    setFile(null);
    setAppState('idle');
    setProgress(0);
    setCompressedSize(0);
  }, []);

  const handleCompress = useCallback(async () => {
    if (!file) return;
    
    setAppState('processing');
    setProgress(0);
    
    try {
      // Show processing messages while optimizing
      let currentStep = 0;
      const totalSteps = PROCESSING_MESSAGES.length;
      
      const messageInterval = setInterval(() => {
        if (currentStep < totalSteps) {
          setCurrentMessage(PROCESSING_MESSAGES[currentStep]);
          setProgress(Math.floor(((currentStep + 1) / totalSteps) * 100));
          currentStep++;
        }
      }, 800);
      
      // Call the actual backend API
      const settings = {
        decimateRatio: decimation / 100, // Convert percentage to ratio (0-1)
        dracoLevel: dracoLevel,
        textureQuality: 1024 // Default texture quality
      };
      
      const result = await optimizeFile(file, settings);
      
      clearInterval(messageInterval);
      
      if (result.status === 'success') {
        setCompressedSize(result.optimizedSize);
        setDownloadUrl(result.downloadUrl);
        setFacesBefore(result.stats.facesBefore);
        setFacesAfter(result.stats.facesAfter);
        setProgress(100);
        setCurrentMessage('COMPLETE');
        setAppState('complete');
      } else {
        throw new Error(result.message || 'Optimization failed');
      }
    } catch (error) {
      console.error('Compression error:', error);
      setAppState('preview');
    }
  }, [file, decimation, dracoLevel]);

  const handleDownload = useCallback(async () => {
    if (!file || !downloadUrl) return;
    
    try {
      // Get the file extension
      const extension = file.name.match(/\.(glb|gltf)$/i)?.[0] || '.glb';
      const baseName = file.name.replace(/\.(glb|gltf)$/i, '');
      const newFileName = `${baseName}-glob_micr_dev${extension}`;
      
      await downloadFile(downloadUrl, newFileName);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, [file, downloadUrl]);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background layers */}
      <GridBackground />
      <NoiseOverlay />
      
      {/* Header */}
      <header className="fixed top-0 left-0 z-40 p-6">
        <div className="flex items-center gap-3">
          <img src="/glob.svg" alt="glob" className="w-[90px] h-[70px]" />
          <h1 className="font-display text-xl text-reading tracking-brutal">
            glob
          </h1>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 relative z-10">
        {appState === 'idle' && (
          <div className="w-full max-w-4xl flex flex-col items-center">
            <DropZone onFileSelect={handleFileSelect} />
            <div className="mt-0 w-full">
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
          </div>
        )}
        
        {appState === 'loading' && file && (
          <FileLoading fileName={file.name} />
        )}
        
        {appState === 'preview' && file && (
          <div className="w-full max-w-4xl flex flex-col items-center">
            <GLBViewer file={file} onReset={handleReset} />
            <div className="mt-0 w-full">
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
          </div>
        )}
        
        {appState === 'processing' && (
          <div className="w-full max-w-4xl">
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
          <ComparisonViewer
            file={file}
            originalSize={file.size}
            compressedSize={compressedSize}
            optimizedUrl={downloadUrl}
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
        <a 
          href="https://github.com/Microck/glob" 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-ui text-xs text-muted hover:text-active transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub
        </a>
      </footer>
    </div>
  );
};

export default Index;
