import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Download, AlertTriangle, Clock, ExternalLink } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import LoadingIndicator from '@/components/LoadingIndicator';
import * as THREE from 'three';
import { GLTFLoader, DRACOLoader } from 'three-stdlib';

interface ShareMetadata {
  originalSize: number;
  optimizedSize: number;
  stats?: {
    facesBefore: number;
    facesAfter: number;
    verticesBefore: number;
    verticesAfter: number;
  };
  expiresAt: string;
  downloadFilename?: string;
}

const SharePage = () => {
  const { id } = useParams();
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const [metadata, setMetadata] = useState<ShareMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('Initializing...');
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const apiBase = import.meta.env.VITE_API_URL || '';
  const downloadUrl = `${apiBase}/api/download/${id}`;

  useEffect(() => {
    let active = true;
    
    const loadModel = async () => {
      if (!id) {
        setError('No model ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setDebugInfo('Fetching model info...');
        
        const metaResponse = await fetch(`${apiBase}/api/share-info/${id}`);
        
        if (!metaResponse.ok) {
          if (metaResponse.status === 404) {
            throw new Error('Model not found or has been deleted');
          } else if (metaResponse.status === 410) {
            throw new Error('This share link has expired');
          }
          throw new Error(`Failed to load model info (${metaResponse.status})`);
        }
        
        const meta = await metaResponse.json();
        if (!active) return;
        setMetadata(meta);
        
        setDebugInfo('Downloading model...');
        
        const response = await fetch(downloadUrl);
        if (!response.ok) {
          if (response.status === 410) {
            throw new Error('This share link has expired');
          }
          throw new Error(`Server returned ${response.status}`);
        }
        
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        if (!active) return;
        
        setDebugInfo(`Downloaded ${Math.round(blob.size / 1024)}KB. Parsing...`);

        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        
        dracoLoader.setDecoderPath('/draco/');
        dracoLoader.setDecoderConfig({ type: 'js' });
        loader.setDRACOLoader(dracoLoader);

        loader.load(
          objectUrl,
          (gltf) => {
            if (!active) return;
            setDebugInfo('Processing scene...');
            
            const box = new THREE.Box3().setFromObject(gltf.scene);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = maxDim > 0 ? (3 / maxDim) : 1;
            gltf.scene.scale.setScalar(scale);
            
            const center = box.getCenter(new THREE.Vector3());
            gltf.scene.position.sub(center.multiplyScalar(scale));

            setScene(gltf.scene);
            setIsLoading(false);
            URL.revokeObjectURL(objectUrl);
            dracoLoader.dispose();
          },
          undefined,
          (err) => {
            console.error('GLTFLoader error:', err);
            if (!active) return;
            setError(err instanceof Error ? err.message : 'Failed to parse 3D model');
            setIsLoading(false);
            URL.revokeObjectURL(objectUrl);
            dracoLoader.dispose();
          }
        );

      } catch (err) {
        console.error('Load error:', err);
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load model');
        setIsLoading(false);
      }
    };

    loadModel();

    return () => {
      active = false;
    };
  }, [id, apiBase, downloadUrl]);

  useEffect(() => {
    if (!metadata?.expiresAt) return;

    const updateTimeRemaining = () => {
      const now = new Date();
      const expires = new Date(metadata.expiresAt);
      const diff = expires.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeRemaining('Expired');
        setError('This share link has expired');
        return;
      }
      
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      if (minutes > 60) {
        const hours = Math.floor(minutes / 60);
        setTimeRemaining(`${hours}h ${minutes % 60}m`);
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [metadata?.expiresAt]);

  const reduction = metadata 
    ? ((1 - metadata.optimizedSize / metadata.originalSize) * 100).toFixed(1)
    : null;

  return (
    <PageLayout disableScroll fullWidth showFloatingLinks={false}>
      <div className="absolute inset-0 z-0 w-full h-full flex">
        <div className="w-1/4 min-w-[320px] max-w-[400px] h-full bg-surface/95 border-r-3 border-muted p-8 flex flex-col gap-6 z-20 backdrop-blur-sm shadow-2xl relative pointer-events-auto overflow-y-auto">
          <div>
            <div className="h-10 mb-6" />
            <h1 className="font-ui text-xs text-muted uppercase tracking-widest mb-3">SHARED MODEL</h1>
            <div className="font-mono text-[10px] text-reading bg-background border-2 border-muted p-3 w-full break-all leading-relaxed">
              {id}
            </div>
          </div>

          {timeRemaining && !error && (
            <div className="flex items-center gap-2 text-muted">
              <Clock className="w-4 h-4" />
              <span className="font-ui text-xs uppercase tracking-widest">
                Expires in: <span className="text-reading">{timeRemaining}</span>
              </span>
            </div>
          )}
          
          {metadata && (
            <div className="space-y-4">
              <div className="bg-background border-2 border-muted p-4">
                <span className="font-ui text-[10px] text-muted uppercase tracking-widest">Size Reduction</span>
                <div className="font-display text-3xl text-active tracking-brutal mt-1">
                  -{reduction}%
                </div>
                <div className="flex gap-4 mt-2 text-xs font-mono">
                  <div>
                    <span className="text-muted">From: </span>
                    <span className="text-reading">{(metadata.originalSize / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <div>
                    <span className="text-muted">To: </span>
                    <span className="text-active">{(metadata.optimizedSize / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
              </div>

              {metadata.stats && (
                <div className="bg-background border-2 border-muted p-4">
                  <span className="font-ui text-[10px] text-muted uppercase tracking-widest">Geometry</span>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <div className="font-ui text-[9px] text-muted uppercase tracking-wider">Faces</div>
                      <div className="font-mono text-sm text-reading">
                        {metadata.stats.facesBefore.toLocaleString()} → <span className="text-active">{metadata.stats.facesAfter.toLocaleString()}</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-ui text-[9px] text-muted uppercase tracking-wider">Vertices</div>
                      <div className="font-mono text-sm text-reading">
                        {metadata.stats.verticesBefore.toLocaleString()} → <span className="text-active">{metadata.stats.verticesAfter.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
           
          <a 
            href={downloadUrl}
            download={metadata?.downloadFilename || `${id}.glb`}
            className="flex items-center justify-center gap-3 bg-active text-surface font-ui text-sm font-bold uppercase py-4 hover:bg-reading transition-none w-full border-2 border-transparent hover:border-muted"
          >
            <Download className="w-4 h-4" />
            Download GLB
          </a>

          <div className="mt-auto pt-6 border-t-2 border-muted">
            <p className="font-ui text-xs text-muted uppercase tracking-widest mb-3">
              Optimize your own 3D models
            </p>
            <Link 
              to="/"
              className="flex items-center justify-center gap-2 border-2 border-muted text-reading font-ui text-sm font-bold uppercase py-3 hover:border-active hover:text-active transition-none w-full"
            >
              <ExternalLink className="w-4 h-4" />
              Try Glob Free
            </Link>
          </div>

          {isLoading && (
            <div className="font-mono text-[10px] text-muted opacity-50">
              STATUS: {debugInfo}
            </div>
          )}
        </div>

        <div className="flex-1 h-full relative bg-background/40">
          {!error && scene && (
            <Canvas camera={{ position: [4, 4, 4], fov: 45 }}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[10, 10, 5]} intensity={1.2} />
              <pointLight position={[-10, -10, -10]} intensity={0.5} />
              <primitive object={scene} />
              <OrbitControls enableDamping={false} autoRotate autoRotateSpeed={0.5} />
              <Environment preset="warehouse" />
            </Canvas>
          )}
        </div>
      </div>

      {isLoading && !error && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm pointer-events-none">
          <LoadingIndicator text={debugInfo.toUpperCase()} size="lg" />
        </div>
      )}

      {error && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-surface border-3 border-destructive p-8 max-w-md text-center shadow-2xl">
            <div className="flex justify-center mb-4 text-destructive">
              <AlertTriangle className="w-12 h-12" />
            </div>
            <h2 className="font-display text-2xl text-destructive mb-4 tracking-brutal">LOAD FAILED</h2>
            <p className="font-ui text-sm text-reading mb-2">Could not load shared model.</p>
            <p className="font-mono text-xs text-destructive bg-destructive/10 p-2 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="inline-block bg-muted text-surface font-ui text-sm px-6 py-3 hover:bg-reading transition-none font-bold"
              >
                RETRY
              </button>
              <Link 
                to="/"
                className="inline-block bg-active text-surface font-ui text-sm px-6 py-3 hover:bg-reading transition-none font-bold"
              >
                GO TO GLOB
              </Link>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default SharePage;
