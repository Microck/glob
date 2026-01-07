import { useState, useCallback } from 'react';
import NoiseOverlay from '@/components/NoiseOverlay';
import GridBackground from '@/components/GridBackground';
import DropZone from '@/components/DropZone';
import GLBViewer from '@/components/GLBViewer';
import Controls from '@/components/Controls';
import ProgressBar from '@/components/ProgressBar';
import ComparisonViewer from '@/components/ComparisonViewer';
import ScrambleText from '@/components/ScrambleText';
import { optimizeFile, downloadFile } from '@/lib/api';

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
  const [downloadUrl, setDownloadUrl] = useState('');
  const [facesBefore, setFacesBefore] = useState(0);
  const [facesAfter, setFacesAfter] = useState(0);

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
      await downloadFile(downloadUrl, file.name.replace(/\.(glb|gltf)$/i, '_compressed.glb'));
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
        <h1 className="font-display text-xl text-reading tracking-brutal">
          GLB_COMPRESSOR
        </h1>
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
