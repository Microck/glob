import { useState, useCallback, Suspense, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Center } from '@react-three/drei';
import PageLayout from '@/components/PageLayout';

const SharedModel = ({ url, onError }: { url: string, onError: () => void }) => {
  try {
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
  } catch (e) {
    onError();
    return null;
  }
};

const SharePage = () => {
  const { id } = useParams();
  const [error, setError] = useState<string | null>(null);

  const apiBase = import.meta.env.VITE_API_URL || '';
  const modelUrl = `${apiBase}/api/download/${id}`;

  const handleError = useCallback(() => {
    setError("EXPIRED OR NOT FOUND");
  }, []);

  useEffect(() => {
    let isActive = true;
    fetch(modelUrl, { method: 'HEAD' })
      .then(res => {
        if (!isActive) return;
        if (res.status === 404 || res.status === 410) {
          setError("EXPIRED OR NOT FOUND");
        }
      })
      .catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, [modelUrl]);

  return (
    <PageLayout disableScroll>
      <div className="absolute inset-0 z-0">
        {!error && (
          <Canvas camera={{ position: [3, 3, 3], fov: 45 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[10, 10, 5]} intensity={1.2} />
              <Center>
                <SharedModel url={modelUrl} onError={handleError} />
              </Center>
              <OrbitControls enableDamping={false} />
              <Environment preset="warehouse" />
            </Suspense>
          </Canvas>
        )}
      </div>

      <div className="relative z-10 pointer-events-none">
        <div className="flex flex-col">
          <span className="font-ui text-[10px] text-muted uppercase tracking-widest">SHARED MODEL</span>
          <span className="font-mono text-[10px] text-reading">{id}</span>
        </div>
      </div>

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
