import { useState, useCallback } from 'react';
import NoiseOverlay from '@/components/NoiseOverlay';
import GridBackground from '@/components/GridBackground';
import DropZone from '@/components/DropZone';
import GLBViewer from '@/components/GLBViewer';
import Controls from '@/components/Controls';
import ProgressBar from '@/components/ProgressBar';
import ComparisonViewer from '@/components/ComparisonViewer';
import ScrambleText from '@/components/ScrambleText';
import DebugMenu from '@/components/DebugMenu';
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
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [fileLoadProgress, setFileLoadProgress] = useState(0);
  const [decimation, setDecimation] = useState(50);
  const [dracoLevel, setDracoLevel] = useState(7);
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [compressedSize, setCompressedSize] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [facesBefore, setFacesBefore] = useState(0);
  const [facesAfter, setFacesAfter] = useState(0);
  const [isDebugMode, setIsDebugMode] = useState(false);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setIsFileLoading(true);
    setFileLoadProgress(0);
    
    const duration = 1500;
    const steps = 20;
    const stepTime = duration / steps;
    let currentStep = 0;
    
    const progressInterval = setInterval(() => {
      currentStep++;
      setFileLoadProgress(Math.min((currentStep / steps) * 100, 100));
      
      if (currentStep >= steps) {
        clearInterval(progressInterval);
        setIsFileLoading(false);
        setFileLoadProgress(0);
        setAppState('preview');
      }
    }, stepTime);
  }, []);

  const handleReset = useCallback(() => {
    setFile(null);
    setAppState('idle');
    setProgress(0);
    setCompressedSize(0);
    setIsDebugMode(false);
  }, []);

  const handleCompress = useCallback(async () => {
    if (!file) return;
    
    setAppState('processing');
    setProgress(0);
    
    try {
      let currentStep = 0;
      const totalSteps = PROCESSING_MESSAGES.length;
      
      const messageInterval = setInterval(() => {
        if (currentStep < totalSteps) {
          setCurrentMessage(PROCESSING_MESSAGES[currentStep]);
          setProgress(Math.floor(((currentStep + 1) / totalSteps) * 100));
          currentStep++;
        }
      }, 800);
      
      const settings = {
        decimateRatio: decimation / 100,
        dracoLevel: dracoLevel,
        textureQuality: 1024
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
        throw new Error('Optimization failed');
      }
    } catch (error) {
      console.error('Compression error:', error);
      setAppState('preview');
    }
  }, [file, decimation, dracoLevel]);

  const handleDownload = useCallback(async () => {
    if (!file || !downloadUrl) return;
    
    try {
      const extension = file.name.match(/\.(glb|gltf)$/i)?.[0] || '.glb';
      const baseName = file.name.replace(/\.(glb|gltf)$/i, '');
      const newFileName = `${baseName}-glob_micr_dev${extension}`;
      
      await downloadFile(downloadUrl, newFileName);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, [file, downloadUrl]);

  const createMockFile = () => {
    const content = new Blob(['mock glb content'], { type: 'model/gltf-binary' });
    return new File([content], 'debug-model.glb', { type: 'model/gltf-binary' });
  };

  const handleDebugStateChange = useCallback((newState: AppState) => {
    setIsDebugMode(true);
    
    if (newState !== 'idle' && !file) {
      setFile(createMockFile());
    }
    
    setAppState(newState);
    
    if (newState === 'processing') {
      setProgress(50);
      setCurrentMessage('DEBUG_MODE...');
    } else if (newState === 'complete') {
      setProgress(100);
      setCurrentMessage('COMPLETE');
      setCompressedSize(1024 * 500);
    } else if (newState === 'idle') {
      setIsDebugMode(false);
    }
  }, [file]);

  return (
    <div className="min-h-screen flex flex-col relative">
      <GridBackground />
      <NoiseOverlay />
      
      <header className="fixed top-0 left-0 z-40 p-6">
        <div className="flex items-center">
          <img 
            src="/glob.svg" 
            alt="glob" 
            className="w-[66px]"
            style={{ 
              transform: 'translate(-4px, -5px)',
              filter: 'invert(92%) sepia(8%) saturate(200%) hue-rotate(330deg) brightness(103%) contrast(92%)'
            }}
          />
          <h1 
            className="font-display text-xl tracking-brutal"
            style={{ 
              transform: 'translate(8px, -6px)',
              width: '65px',
              color: '#E7D9D5'
            }}
          >
            glob
          </h1>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 relative z-10">
        {appState === 'idle' && (
          <div className="w-full max-w-4xl flex flex-col items-center">
            <DropZone 
              onFileSelect={handleFileSelect} 
              isLoading={isFileLoading}
              loadProgress={fileLoadProgress}
            />
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
            {isDebugMode ? (
              <div className="w-full aspect-[16/9] max-w-4xl border-3 border-muted bg-surface flex items-center justify-center">
                <div className="text-center">
                  <div className="font-ui text-sm text-muted mb-2">[DEBUG MODE]</div>
                  <div className="font-display text-2xl text-reading">3D VIEWER PLACEHOLDER</div>
                  <div className="font-ui text-xs text-muted mt-2">Load a real .glb file to see the viewer</div>
                </div>
              </div>
            ) : (
              <GLBViewer file={file} onReset={handleReset} />
            )}
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
          isDebugMode ? (
            <div className="w-full max-w-4xl">
              <div className="w-full aspect-[16/9] border-3 border-muted bg-surface flex items-center justify-center">
                <div className="text-center">
                  <div className="font-ui text-sm text-muted mb-2">[DEBUG MODE]</div>
                  <div className="font-display text-2xl text-reading">COMPARISON VIEWER PLACEHOLDER</div>
                  <div className="font-ui text-xs text-muted mt-2">Load a real .glb file to see the comparison</div>
                </div>
              </div>
              <div className="flex border-3 border-t-0 border-muted">
                <div className="flex-1 p-4 border-r-3 border-muted bg-surface">
                  <span className="font-ui text-xs text-muted">REDUCTION</span>
                  <div className="font-display text-3xl text-active tracking-brutal">-50.0%</div>
                </div>
                <div className="flex-1 p-4 bg-surface">
                  <span className="font-ui text-xs text-muted">FILE</span>
                  <div className="font-ui text-sm text-reading truncate">{file.name}</div>
                </div>
              </div>
              <div className="flex">
                <button className="flex-1 bg-active text-surface font-ui text-xl py-5">DOWNLOAD</button>
                <button onClick={handleReset} className="border-3 border-l-0 border-muted bg-surface text-muted font-ui text-xl px-6 py-5 hover:text-active hover:border-active">RESET</button>
              </div>
            </div>
          ) : (
            <ComparisonViewer
              file={file}
              originalSize={file.size}
              compressedSize={compressedSize}
              optimizedUrl={downloadUrl}
              onDownload={handleDownload}
              onReset={handleReset}
            />
          )
        )}
      </main>
      
      <footer className="fixed bottom-0 left-0 right-0 z-40 p-6 flex justify-between">
        <span className="font-ui text-xs text-muted">
          v1.0.0
        </span>
        <a 
          href="https://github.com/Microck/glob" 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-ui text-xs text-muted hover:text-active flex items-center gap-1"
          style={{ transition: 'none' }}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub
        </a>
      </footer>

      <DebugMenu appState={appState} onStateChange={handleDebugStateChange} />
    </div>
  );
};

export default Index;
