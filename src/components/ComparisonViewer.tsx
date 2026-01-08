import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Center } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

interface ModelProps {
  url: string;
  wireframe?: boolean;
}

const Model = ({ url, wireframe = false }: ModelProps) => {
  const { scene } = useGLTF(url);
  const clonedScene = scene.clone(true);
  
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material) {
          if (wireframe) {
            child.material = new THREE.MeshBasicMaterial({ 
              color: 0xFC6E83, 
              wireframe: true,
              wireframeLinewidth: 1
            });
          } else {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => {
                mat.transparent = false;
                mat.opacity = 1;
                mat.side = THREE.FrontSide;
              });
            } else {
              child.material.transparent = false;
              child.material.opacity = 1;
              child.material.side = THREE.FrontSide;
            }
          }
        }
        child.visible = true;
        child.renderOrder = 0;
      }
    });

    const box = new THREE.Box3().setFromObject(clonedScene);
    const center = box.getCenter(new THREE.Vector3());
    clonedScene.position.sub(center);
    
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxDim;
    clonedScene.scale.setScalar(scale);
  }, [clonedScene, wireframe]);

  return <primitive object={clonedScene} />;
};

const SHARED_LIGHTING = {
  ambient: 0.7,
  directional: 1.2,
  point: 0.5,
  background: 'hsl(273, 12%, 20%)'
};

interface ComparisonViewerProps {
  file: File;
  originalSize: number;
  compressedSize: number;
  optimizedUrl?: string;
  onDownload: () => void;
  onReset: () => void;
}

const ComparisonViewer = ({ 
  file, 
  originalSize, 
  compressedSize, 
  optimizedUrl,
  onDownload, 
  onReset 
}: ComparisonViewerProps) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [optimizedObjectUrl, setOptimizedObjectUrl] = useState<string | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  
  const leftControlsRef = useRef<React.ElementRef<typeof OrbitControls>>(null);
  const rightControlsRef = useRef<React.ElementRef<typeof OrbitControls>>(null);
  const isSyncing = useRef(false);

  useEffect(() => {
    if (mainContainerRef.current) {
      gsap.fromTo(mainContainerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, []);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  useEffect(() => {
    if (optimizedUrl) {
      const url = URL.createObjectURL(file);
      setOptimizedObjectUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [optimizedUrl, file]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, [isDragging]);

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const syncCameras = useCallback((source: 'left' | 'right') => {
    if (isSyncing.current) return;
    isSyncing.current = true;

    const sourceControls = source === 'left' ? leftControlsRef.current : rightControlsRef.current;
    const targetControls = source === 'left' ? rightControlsRef.current : leftControlsRef.current;

    if (sourceControls && targetControls) {
      const sourceCamera = sourceControls.object;
      const targetCamera = targetControls.object;
      
      targetCamera.position.copy(sourceCamera.position);
      targetCamera.quaternion.copy(sourceCamera.quaternion);
      targetControls.target.copy(sourceControls.target);
      targetControls.update();
    }

    isSyncing.current = false;
  }, []);

  const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);

  if (!objectUrl) return null;

  return (
    <div ref={mainContainerRef} className="w-full max-w-4xl">
      <div 
        ref={containerRef}
        className="relative w-full aspect-[16/9] border-3 border-muted overflow-hidden select-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div 
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <div className="absolute top-0 left-0 z-10 px-4 py-2 bg-surface/90 border-r-3 border-b-3 border-muted">
            <span className="font-ui text-xs text-muted">ORIGINAL</span>
            <div className="font-display text-lg text-reading">
              {(originalSize / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
          <Canvas
            camera={{ position: [3, 3, 3], fov: 45 }}
            style={{ background: SHARED_LIGHTING.background }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={SHARED_LIGHTING.ambient} />
              <directionalLight position={[10, 10, 5]} intensity={SHARED_LIGHTING.directional} />
              <pointLight position={[-10, -10, -10]} intensity={SHARED_LIGHTING.point} />
              <Center>
                <Model url={objectUrl} wireframe={false} />
              </Center>
              <OrbitControls 
                ref={leftControlsRef}
                enableDamping={false} 
                onChange={() => syncCameras('left')}
              />
              <Environment preset="warehouse" />
            </Suspense>
          </Canvas>
        </div>

        <div 
          className="absolute inset-0"
          style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
        >
          <div className="absolute top-0 right-0 z-10 px-4 py-2 bg-surface/90 border-l-3 border-b-3 border-muted">
            <span className="font-ui text-xs text-active">OPTIMIZED</span>
            <div className="font-display text-lg text-active">
              {(compressedSize / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
          <Canvas
            camera={{ position: [3, 3, 3], fov: 45 }}
            style={{ background: SHARED_LIGHTING.background }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={SHARED_LIGHTING.ambient} />
              <directionalLight position={[10, 10, 5]} intensity={SHARED_LIGHTING.directional} />
              <pointLight position={[-10, -10, -10]} intensity={SHARED_LIGHTING.point} />
              <Center>
                <Model url={optimizedObjectUrl || objectUrl} wireframe={false} />
              </Center>
              <OrbitControls 
                ref={rightControlsRef}
                enableDamping={false}
                onChange={() => syncCameras('right')}
              />
              <Environment preset="warehouse" />
            </Suspense>
          </Canvas>
        </div>

        <div 
          className="absolute top-0 bottom-0 w-1 bg-active z-20 cursor-ew-resize"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
          onMouseDown={handleMouseDown}
        >
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-active flex items-center justify-center cursor-ew-resize"
            onMouseDown={handleMouseDown}
          >
            <div className="flex gap-0.5">
              <div className="w-0.5 h-5 bg-surface" />
              <div className="w-0.5 h-5 bg-surface" />
              <div className="w-0.5 h-5 bg-surface" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 py-2 pointer-events-none">
          <span className="font-ui text-xs text-muted bg-surface/80 px-2 py-1">◀ ORIGINAL</span>
          <span className="font-ui text-xs text-active bg-surface/80 px-2 py-1">OPTIMIZED ▶</span>
        </div>
      </div>

      <div className="flex border-3 border-t-0 border-muted">
        <div className="flex-1 p-4 border-r-3 border-muted bg-surface">
          <span className="font-ui text-xs text-muted">REDUCTION</span>
          <div className="font-display text-3xl text-active tracking-brutal">
            -{reduction}%
          </div>
        </div>
        <div className="flex-1 p-4 bg-surface">
          <span className="font-ui text-xs text-muted">FILE</span>
          <div className="font-ui text-sm text-reading truncate">
            {file.name}
          </div>
        </div>
      </div>

      <div className="flex">
        <button
          onClick={onDownload}
          className="flex-1 bg-active text-surface font-ui text-xl py-5 hover:bg-reading"
          style={{ transition: 'none' }}
        >
          DOWNLOAD
        </button>
        <button
          onClick={onReset}
          className="border-3 border-l-0 border-muted bg-surface text-muted font-ui text-xl px-6 py-5 hover:text-active hover:border-active"
          style={{ transition: 'none' }}
        >
          RESET
        </button>
      </div>
    </div>
  );
};

export default ComparisonViewer;
