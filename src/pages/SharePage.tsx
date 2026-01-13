import { useState, useCallback, Suspense, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Center, useProgress } from '@react-three/drei';
import { Download } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import LoadingIndicator from '@/components/LoadingIndicator';
import * as THREE from 'three';

const SharedModel = ({ url }: { url: string }) => {
  const { scene } = useGLTF(url);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    
    const scale = (3 / maxDim); 
    clonedScene.scale.setScalar(scale);
  }, [clonedScene]);

  return <primitive object={clonedScene} />;
};

const ProgressTracker = ({ onError, onLoaded }: { onError: () => void, onLoaded: () => void }) => {
  const { errors, progress, active } = useProgress();
  
  useEffect(() => {
    if (errors.length > 0) {
      onError();
    }
  }, [errors, onError]);

  useEffect(() => {
    if (!active && progress === 100 && errors.length === 0) {
      onLoaded();
    }
  }, [active, progress, errors, onLoaded]);

  return null;
};

const SharePage = () => {
  const { id } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const apiBase = import.meta.env.VITE_API_URL || '';
  const modelUrl = `${apiBase}/api/download/${id}`;

  const handleError = useCallback(() => {
    setError("EXPIRED OR NOT FOUND");
    setIsLoading(false);
  }, []);

  const handleLoaded = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <PageLayout disableScroll>
      <div className="absolute inset-0 z-0 w-full h-full flex">
        <div className="w-1/4 min-w-[320px] h-full bg-surface/95 border-r-3 border-muted p-8 flex flex-col gap-8 z-20 backdrop-blur-sm shadow-2xl relative pointer-events-auto">
           <div>
             <h1 className="font-ui text-xs text-muted uppercase tracking-widest mb-3">SHARED MODEL</h1>
             <div className="font-mono text-xs text-reading bg-background border-2 border-muted p-4 w-full break-all leading-relaxed">
               {id}
             </div>
           </div>
           
           <a 
             href={modelUrl}
             download
             className="flex items-center justify-center gap-3 bg-active text-surface font-ui text-sm font-bold uppercase py-4 hover:bg-reading transition-none w-full border-2 border-transparent hover:border-muted"
           >
             <Download className="w-4 h-4" />
             Download GLB
           </a>
        </div>

        <div className="flex-1 h-full relative bg-background/50">
          {!error && (
            <Canvas camera={{ position: [4, 4, 4], fov: 45 }}>
              <Suspense fallback={null}>
                <ProgressTracker onError={handleError} onLoaded={handleLoaded} />
                <ambientLight intensity={0.7} />
                <directionalLight position={[10, 10, 5]} intensity={1.2} />
                <Center>
                  <SharedModel url={modelUrl} />
                </Center>
                <OrbitControls enableDamping={false} />
                <Environment preset="warehouse" />
              </Suspense>
            </Canvas>
          )}
        </div>
      </div>

      {isLoading && !error && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <LoadingIndicator text="LOADING MODEL..." size="lg" />
        </div>
      )}

      {error && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-surface border-3 border-destructive p-8 max-w-md text-center shadow-2xl">
            <h2 className="font-display text-2xl text-destructive mb-4 tracking-brutal">LINK EXPIRED</h2>
            <p className="font-ui text-sm text-reading mb-6">This share link has expired or does not exist.</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="inline-block bg-active text-surface font-ui text-sm px-6 py-3 hover:bg-reading transition-none font-bold"
            >
              START OVER
            </button>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default SharePage;
