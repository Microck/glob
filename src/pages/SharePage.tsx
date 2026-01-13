import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Download, AlertTriangle } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import LoadingIndicator from '@/components/LoadingIndicator';
import * as THREE from 'three';
import { GLTFLoader, DRACOLoader } from 'three-stdlib';

const SharePage = () => {
  const { id } = useParams();
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('Initializing...');

  const apiBase = import.meta.env.VITE_API_URL || '';
  const modelUrl = `${apiBase}/api/download/${id}`;

  useEffect(() => {
    let active = true;
    
    const loadModel = async () => {
      try {
        setDebugInfo(`Fetching: ${modelUrl}`);
        
        const response = await fetch(modelUrl);
        if (!response.ok) {
          throw new Error(`Server returned ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
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
            setDebugInfo("Parsing complete. Processing scene...");
            
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
          (xhr) => {
            if (xhr.lengthComputable) {
              const percent = (xhr.loaded / xhr.total) * 100;
            }
          },
          (err) => {
            console.error("GLTFLoader error:", err);
            if (!active) return;
            setError(err instanceof Error ? err.message : "Failed to parse 3D model");
            setIsLoading(false);
            URL.revokeObjectURL(objectUrl);
            dracoLoader.dispose();
          }
        );

      } catch (err) {
        console.error("Load error:", err);
        if (!active) return;
        setError(err instanceof Error ? err.message : "Network error");
        setIsLoading(false);
      }
    };

    loadModel();

    return () => {
      active = false;
    };
  }, [modelUrl]);

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

           {isLoading && (
             <div className="mt-auto font-mono text-[10px] text-muted opacity-50">
               STATUS: {debugInfo}
             </div>
           )}
        </div>

        <div className="flex-1 h-full relative bg-background/50">
          {!error && scene && (
            <Canvas camera={{ position: [4, 4, 4], fov: 45 }}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[10, 10, 5]} intensity={1.2} />
              <group>
                <primitive object={scene} />
              </group>
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
            <p className="font-ui text-sm text-reading mb-2">Could not load model.</p>
            <p className="font-mono text-xs text-destructive bg-destructive/10 p-2 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="inline-block bg-active text-surface font-ui text-sm px-6 py-3 hover:bg-reading transition-none font-bold"
            >
              RETRY
            </button>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default SharePage;