import { useState, useCallback, useEffect, useRef } from 'react';
import { useSafeAuth } from "@/hooks/use-safe-auth";
import { useToast } from "@/hooks/use-toast";
import gsap from 'gsap';
import DropZone from '@/components/DropZone';
import GLBViewer from '@/components/GLBViewer';
import Controls from '@/components/Controls';
import ProgressBar from '@/components/ProgressBar';
import ComparisonViewer from '@/components/ComparisonViewer';
import ScrambleText from '@/components/ScrambleText';
import PageLayout from '@/components/PageLayout';
import History from '@/components/History';
import FileQueue from '@/components/FileQueue';
import BulkProgressList, { FileStatus } from '@/components/BulkProgressList';
import { optimizeFile, downloadFile, type OptimizeResponse, saveToLocalHistory } from '@/lib/api';

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
  const { userId, getToken } = useSafeAuth();
  const { toast } = useToast();
  const [appState, setAppState] = useState<AppState>('idle');
  const [files, setFiles] = useState<File[]>([]);
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([]);
  const [bulkResults, setBulkResults] = useState<(OptimizeResponse | null)[]>([]);
  const file = files.length > 0 ? files[0] : null;
  
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
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const prevStateRef = useRef<AppState>(appState);

  useEffect(() => {
    if (contentRef.current && prevStateRef.current !== appState) {
      gsap.fromTo(contentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
      prevStateRef.current = appState;
    }
  }, [appState]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isModelLoading) {
      if (progress === 0) setProgress(2);
      interval = setInterval(() => {
        setProgress(prev => (prev < 20 ? prev + 1 : prev));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isModelLoading]);


const handleFileSelect = useCallback((selectedFiles: File[]) => {
    let filesToProcess = selectedFiles;

    if (selectedFiles.length > 1 && !userId) {
      toast({
        title: "Bulk processing is for Globbers only",
        description: "Please sign in to process multiple files at once.",
        variant: "destructive",
      });
      filesToProcess = [selectedFiles[0]];
    } 
    
    setFiles(filesToProcess);

    if (filesToProcess.length > 1) {
      return;
    }
    
    setAppState('processing');
    setProgress(0);
    setCurrentMessage('LOADING MODEL...');
    
    const mainFile = filesToProcess[0];
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(mainFile));
    
    setDesiredSize(Math.floor(mainFile.size / 1024 / 1024 * 0.8));
    setDesiredPolygons(Math.floor(10000 / 1000) * 1000);
    setIsModelLoading(true);
  }, [userId, toast, previewUrl]);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleStartQueue = useCallback(async () => {
    if (files.length === 0) return;
    
    setAppState('processing');
    const initialStatuses = new Array(files.length).fill('pending');
    setFileStatuses(initialStatuses);
    const initialResults = new Array(files.length).fill(null);
    setBulkResults(initialResults);

    const token = await getToken();

    for (let i = 0; i < files.length; i++) {
      setFileStatuses(prev => {
        const next = [...prev];
        next[i] = 'processing';
        return next;
      });
      setProgress(0);
      setCurrentMessage(`PROCESSING ${i + 1}/${files.length}`);

      try {
        const settings = {
          decimateRatio: decimation,
          dracoLevel: dracoLevel,
          textureQuality: textureQuality,
          weld: weld,
          quantize: quantize,
          draco: draco,
        };

        const result = await optimizeFile(files[i], settings, token || undefined, (percent) => {
          setProgress(percent);
        });

        if (result.status === 'success') {
          if (!userId) {
            saveToLocalHistory({ ...result, original_name: files[i].name });
          }
          setBulkResults(prev => {
            const next = [...prev];
            next[i] = result;
            return next;
          });
          setFileStatuses(prev => {
            const next = [...prev];
            next[i] = 'completed';
            return next;
          });
        } else {
          throw new Error('Optimization failed');
        }
      } catch (error) {
        console.error(error);
        setFileStatuses(prev => {
          const next = [...prev];
          next[i] = 'error';
          return next;
        });
      }
    }

    setAppState('complete');
  }, [files, decimation, dracoLevel, textureQuality, weld, quantize, draco, getToken, userId]);

  const handleModelProgress = useCallback((percent: number) => {
    setProgress(Math.floor(percent));
  }, []);

const handleModelLoaded = useCallback(() => {
    setProgress(100);
    setIsModelLoading(false);
    setAppState('preview');
  }, []);

  const handleReset = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setFiles([]);
    setAppState('idle');
    setProgress(0);
    setCompressedSize(0);
    setIsModelLoading(false);
    setViewingIndex(null);
  }, [previewUrl]);




  const handleViewResult = useCallback((index: number) => {
    setViewingIndex(index);
  }, []);

  const handleBackToResults = useCallback(() => {
    setViewingIndex(null);
  }, []);

  const handleNextFile = useCallback(() => {
    setViewingIndex(prev => (prev !== null && prev < files.length - 1 ? prev + 1 : prev));
  }, [files.length]);

  const handlePrevFile = useCallback(() => {
    setViewingIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev));
  }, []);

  const handleSelectFile = useCallback((index: number) => {
    setViewingIndex(index);
  }, []);

  const handleActiveDownload = useCallback(async () => {
    const targetFile = viewingIndex !== null ? files[viewingIndex] : file;
    const targetUrl = viewingIndex !== null ? bulkResults[viewingIndex]?.downloadUrl : downloadUrl;
    
    if (!targetFile || !targetUrl) return;
    
    try {
      const extension = targetFile.name.match(/\.(glb|gltf)$/i)?.[0] || '.glb';
      const baseName = targetFile.name.replace(/\.(glb|gltf)$/i, '');
      const newFileName = `${baseName}_glob-micr-dev${extension}`;
      
      await downloadFile(targetUrl, newFileName);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, [file, downloadUrl, viewingIndex, files, bulkResults]);

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

      const result = await optimizeFile(
        file,
        settings,
        token || undefined,
        (percent) => {
          setProgress(percent);
        },
        (message) => {
          setCurrentMessage(message);
        }
      );
      
      if (result.status === 'success') {
        if (!userId) {
          saveToLocalHistory({ ...result, original_name: file.name });
        }
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
      
      const msg = error instanceof Error ? error.message : "Unknown error";
      const isTimeout = msg.includes("504") || msg.includes("Optimization failed");
      
      if (isTimeout) {
        toast({
          title: "OPTIMIZATION TIMEOUT",
          description: "The file is too complex for the cloud tier (60s limit). Try reducing texture quality or disabling Draco.",
          variant: "destructive",
          duration: 10000
        });
      }
      
      setAppState('preview');
    }
  }, [file, decimation, dracoLevel, getToken, mode, simpleTarget, desiredPolygons, facesBefore, weld, quantize, draco, textureQuality, userId]);

  const handleDownload = useCallback(async () => {
    if (!file || !downloadUrl) return;
    
    try {
      const extension = file.name.match(/\.(glb|gltf)$/i)?.[0] || '.glb';
      const baseName = file.name.replace(/\.(glb|gltf)$/i, '');
      const newFileName = `${baseName}_glob-micr-dev${extension}`;
      
      await downloadFile(downloadUrl, newFileName);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, [file, downloadUrl]);



  return (
    <PageLayout disableScroll>
      <div ref={contentRef}>
      {appState === 'idle' && (

        <div className="w-full flex flex-col items-center">
          {files.length > 0 ? (
            <FileQueue 
              files={files} 
              onRemove={handleRemoveFile} 
              onClear={handleReset} 
              onStart={handleStartQueue} 
            />
          ) : (
            <DropZone 
              onFileSelect={handleFileSelect} 
              isLoading={false}
              loadProgress={0}
              animationType="hydraulic"
              maxFiles={userId ? 10 : 1}
            />
          )}
        </div>
      )}
      
      {appState === 'preview' && file && (
        <div className="w-full flex flex-col items-center">
          <div className="w-full flex-shrink-0">
            <GLBViewer file={file} objectUrl={previewUrl || undefined} onReset={handleReset} />
          </div>
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
          {files.length > 1 ? (
            <div className="w-full flex justify-center">
              <BulkProgressList 
                files={files} 
                status={fileStatuses} 
                currentProgress={progress} 
                results={bulkResults} 
              />
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <ScrambleText 
                  text={currentMessage.includes('LOADING') ? 'LOADING' : 'COMPRESSING'} 
                  isActive={true}
                  className="font-display text-5xl text-active tracking-brutal"
                />
              </div>
              <div className="max-w-4xl mx-auto">
                <ProgressBar progress={progress} message={currentMessage} />
              </div>
            </>
          )}
          
{isModelLoading && file && files.length === 1 && previewUrl && (
              <div className="absolute inset-0 opacity-0 pointer-events-none" style={{ zIndex: -100 }}>
                <GLBViewer 
                  file={file}
                  objectUrl={previewUrl}
                  onReset={handleReset} 
                  onReady={handleModelLoaded} 
                  onProgress={handleModelProgress}
                />
              </div>
            )}
        </div>
      )}
      
      {appState === 'complete' && file && (
        files.length > 1 && viewingIndex === null ? (
          <div className="w-full flex justify-center">
            <BulkProgressList 
              files={files} 
              status={fileStatuses} 
              currentProgress={100} 
              results={bulkResults} 
              onView={handleViewResult}
            />
          </div>
        ) : (
          <ComparisonViewer
            file={viewingIndex !== null ? files[viewingIndex] : file}
            originalSize={viewingIndex !== null ? files[viewingIndex].size : file.size}
            compressedSize={viewingIndex !== null ? (bulkResults[viewingIndex]?.optimizedSize || 0) : compressedSize}
            optimizedUrl={viewingIndex !== null ? (bulkResults[viewingIndex]?.downloadUrl || '') : downloadUrl}
            onDownload={handleActiveDownload}
            onReset={handleReset}
            facesBefore={viewingIndex !== null ? bulkResults[viewingIndex]?.stats.facesBefore : facesBefore}
            facesAfter={viewingIndex !== null ? bulkResults[viewingIndex]?.stats.facesAfter : facesAfter}
            verticesBefore={viewingIndex !== null ? bulkResults[viewingIndex]?.stats.verticesBefore : verticesBefore}
            verticesAfter={viewingIndex !== null ? bulkResults[viewingIndex]?.stats.verticesAfter : verticesAfter}
            fileList={files.length > 1 ? files : undefined}
            currentIndex={viewingIndex !== null ? viewingIndex : undefined}
            onNext={handleNextFile}
            onPrev={handlePrevFile}
            onSelectFile={handleSelectFile}
            onBackToResults={files.length > 1 ? handleBackToResults : undefined}
          />
        )
      )}
      </div>
    </PageLayout>
  );
};

export default Index;
