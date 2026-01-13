import { useState, useCallback, Suspense, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Center, useProgress } from '@react-three/drei';
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
    
    const scale = (4 / maxDim); 
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
      <div className="absolute inset-0 z-0 w-full h-full">
        {!error && (
          <Canvas camera={{ position: [-4, 2, 6], fov: 35 }}>
            <Suspense fallback={null}>
              <ProgressTracker onError={handleError} onLoaded={handleLoaded} />
              <ambientLight intensity={0.7} />
              <directionalLight position={[10, 10, 5]} intensity={1.2} />
              <group position={[1, 0, 0]}>
                <Center>
                  <SharedModel url={modelUrl} />
                </Center>
              </group>
              <OrbitControls enableDamping={false} />
              <Environment preset="warehouse" />
            </Suspense>
          </Canvas>
        )}
      </div>

      <div className="relative z-10 pointer-events-none h-full flex flex-col justify-between p-8">
        <div className="flex flex-col">
          <span className="font-ui text-[10px] text-muted uppercase tracking-widest">SHARED MODEL</span>
          <span className="font-mono text-[10px] text-reading">{id}</span>
        </div>
      </div>

      <div className="relative z-10 pointer-events-none h-full flex flex-col justify-between p-8">
        <div className="flex flex-col">
          <span className="font-ui text-[10px] text-muted uppercase tracking-widest">SHARED MODEL</span>
          <span className="font-mono text-[10px] text-reading">{id}</span>
        </div>
      </div>

      {isLoading && !error && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-background/80">
          <LoadingIndicator text="LOADING MODEL..." size="lg" />
        </div>
      )}

      {error && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-background/80">
          <div className="bg-surface border-3 border-destructive p-8 max-w-md text-center">
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
