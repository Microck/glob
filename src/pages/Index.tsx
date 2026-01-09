import { useState, useCallback, useEffect } from 'react';
import { useAuth } from "@clerk/clerk-react";
import DropZone from '@/components/DropZone';
import GLBViewer from '@/components/GLBViewer';
import Controls from '@/components/Controls';
import ProgressBar from '@/components/ProgressBar';
import ComparisonViewer from '@/components/ComparisonViewer';
import ScrambleText from '@/components/ScrambleText';
import DebugMenu from '@/components/DebugMenu';
import PageLayout from '@/components/PageLayout';
import History from '@/components/History';
import { optimizeFile, downloadFile } from '@/lib/api';
import DebugConsole from '@/components/DebugConsole';

type AppState = 'idle' | 'preview' | 'processing' | 'complete';

const PROCESSING_MESSAGES = [
  'LOADING GEOMETRY...',
  'ANALYZING MESH...',
  'APPLYING DECIMATION...',
  'ENCODING DRACO...',
  'OPTIMIZING BUFFERS...',
  'FINALIZING...',
];

const Index = () => {
  const { userId, getToken } = useAuth();
  const [appState, setAppState] = useState<AppState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');
  const [simpleTarget, setSimpleTarget] = useState<'size' | 'polygons'>('size');
  const [desiredSize, setDesiredSize] = useState(1);
  const [desiredPolygons, setDesiredPolygons] = useState(1000);
  const [decimation, setDecimation] = useState(0.5);
  const [dracoLevel, setDracoLevel] = useState(7);
  const [weld, setWeld] = useState(true);
  const [quantize, setQuantize] = useState(true);
  const [draco, setDraco] = useState(true);
  const [textureQuality, setTextureQuality] = useState(1024);
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [compressedSize, setCompressedSize] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [facesBefore, setFacesBefore] = useState(0);
  const [facesAfter, setFacesAfter] = useState(0);
  const [verticesBefore, setVerticesBefore] = useState(0);
  const [verticesAfter, setVerticesAfter] = useState(0);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isDebugConsoleVisible, setIsDebugConsoleVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') {
        setIsDebugConsoleVisible(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setAppState('processing');
    setProgress(0);
    setCurrentMessage('LOADING FILE...');
    
    setDesiredSize(Number((selectedFile.size / 1024 / 1024 * 0.8).toFixed(2)));
    setDesiredPolygons(10000); 
    
    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      if (p <= 40) {
        setProgress(p);
      } else {
        clearInterval(interval);
        setCurrentMessage('LOADING MODEL...');
        setIsModelLoading(true);
      }
    }, 20);
  }, []);

  const handleModelProgress = useCallback((percent: number) => {
    const p = 40 + (percent * 0.6);
    setProgress(Math.floor(p));
  }, []);

  const handleModelLoaded = useCallback(() => {
    setProgress(100);
    setTimeout(() => {
      setIsModelLoading(false);
      setAppState('preview');
    }, 300);
  }, []);

  const handleReset = useCallback(() => {
    setFile(null);
    setAppState('idle');
    setProgress(0);
    setCompressedSize(0);
    setIsDebugMode(false);
    setIsModelLoading(false);
  }, []);

  const handleCompress = useCallback(async () => {
    if (!file) return;
    
    setAppState('processing');
    setProgress(0);
    setCurrentMessage('UPLOADING...');
    
    try {
      const token = await getToken();
      const settings = {
        decimateRatio: mode === 'simple' 
          ? (simpleTarget === 'polygons' ? Math.max(0.01, Math.min(1, desiredPolygons / (facesBefore || 1000))) : 0.8) 
          : decimation,
        dracoLevel: mode === 'simple' ? 10 : dracoLevel,
        textureQuality: mode === 'simple' && simpleTarget === 'size' ? 512 : (mode === 'advanced' ? textureQuality : 1024),
        weld: mode === 'advanced' ? weld : true,
        quantize: mode === 'advanced' ? quantize : true,
        draco: mode === 'advanced' ? draco : true,
      };

      const result = await optimizeFile(file, settings, token || undefined, (percent) => {
        setProgress(percent); 
        if (percent >= 50) {
          setCurrentMessage('OPTIMIZING...');
        }
      });
      
      let currentP = 50;
      const finalInterval = setInterval(() => {
        currentP += 2;
        if (currentP <= 98) {
          setProgress(currentP);
        } else {
          clearInterval(finalInterval);
        }
      }, 100);
      
      if (result.status === 'success') {
        clearInterval(finalInterval);
        setCompressedSize(result.optimizedSize);
        setDownloadUrl(result.downloadUrl);
        setFacesBefore(result.stats.facesBefore);
        setFacesAfter(result.stats.facesAfter);
        setVerticesBefore(result.stats.verticesBefore);
        setVerticesAfter(result.stats.verticesAfter);
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
  }, [file, decimation, dracoLevel, getToken, mode, simpleTarget, desiredSize, desiredPolygons, facesBefore, weld, quantize, draco, textureQuality]);

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
      setCurrentMessage('DEBUG MODE...');
    } else if (newState === 'complete') {
      setProgress(100);
      setCurrentMessage('COMPLETE');
      setCompressedSize(1024 * 500);
    } else if (newState === 'idle') {
      setIsDebugMode(false);
    }
  }, [file]);

  return (
    <PageLayout disableScroll appState={appState} onStateChange={handleDebugStateChange}>
      <DebugConsole 
        isVisible={isDebugConsoleVisible}
        currentMessage={currentMessage}
        progress={progress}
        settings={{
          mode,
          decimation,
          dracoLevel,
          textureQuality,
          weld,
          quantize,
          draco
        }}
        stats={file ? {
          originalSize: file.size,
          originalPolygons: facesBefore
        } : undefined}
      />

      {appState === 'idle' && (
        <div className="w-full flex flex-col items-center">
          <DropZone 
            onFileSelect={handleFileSelect} 
            isLoading={false}
            loadProgress={0}
            animationType="hydraulic"
          />
          {userId && <History userId={userId} />}
        </div>
      )}
      
      {appState === 'preview' && file && (
        <div className="w-full flex flex-col items-center">
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
              mode={mode}
              onModeChange={setMode}
              simpleTarget={simpleTarget}
              onSimpleTargetChange={setSimpleTarget}
              desiredSize={desiredSize}
              onDesiredSizeChange={setDesiredSize}
              desiredPolygons={desiredPolygons}
              onDesiredPolygonsChange={setDesiredPolygons}
              originalSize={file.size}
              originalPolygons={facesBefore || 1000}
              weld={weld}
              onWeldChange={setWeld}
              quantize={quantize}
              onQuantizeChange={setQuantize}
              draco={draco}
              onDracoChangeToggle={setDraco}
              textureQuality={textureQuality}
              onTextureQualityChange={setTextureQuality}
            />
          </div>
        </div>
      )}

      {(appState === 'processing' || isModelLoading) && (
        <div className="w-full">
          <div className="mb-8 text-center">
            <ScrambleText 
              text={currentMessage.includes('LOADING') ? 'LOADING' : 'COMPRESSING'} 
              isActive={true}
              className="font-display text-5xl text-active tracking-brutal"
            />
          </div>
          <ProgressBar progress={progress} message={currentMessage} />
          
            {isModelLoading && file && (
              <div className="absolute inset-0 opacity-0 pointer-events-none" style={{ zIndex: -100 }}>
                <GLBViewer 
                  file={file} 
                  onReset={handleReset} 
                  onReady={handleModelLoaded} 
                  onProgress={handleModelProgress}
                />
              </div>
            )}
        </div>
      )}
      
      {appState === 'complete' && file && (
        isDebugMode ? (
          <div className="w-full">
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
            facesBefore={facesBefore}
            facesAfter={facesAfter}
            verticesBefore={verticesBefore}
            verticesAfter={verticesAfter}
          />
        )
      )}
    </PageLayout>
  );
};

export default Index;
