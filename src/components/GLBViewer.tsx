import { Suspense, useEffect, useState, useRef, useCallback, memo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Center, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import LoadingIndicator from './LoadingIndicator';

interface ModelProps {
  url: string;
  onLoaded?: () => void;
}

interface CameraControllerProps {
  scene: THREE.Object3D;
  controlsRef: React.RefObject<React.ElementRef<typeof OrbitControls>>;
  resetTrigger: number;
}

const CameraController = ({ scene, controlsRef, resetTrigger }: CameraControllerProps) => {
  const { camera } = useThree();
  const initialCameraState = useRef<{
    position: THREE.Vector3;
    target: THREE.Vector3;
  } | null>(null);
  
  const fitCameraToScene = useCallback(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = new THREE.Vector3(0, 0, 0);
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    const distance = Math.abs(maxDim / (2 * Math.tan(fov / 2)));
    
    const offset = 1.5;
    const cameraDistance = distance * offset;
    
    const angle = Math.PI / 4;
    const newPosition = new THREE.Vector3(
      cameraDistance * Math.cos(angle),
      cameraDistance * Math.sin(angle),
      cameraDistance * Math.cos(angle)
    );
    
    (camera as THREE.PerspectiveCamera).near = Math.max(0.1, distance / 100);
    (camera as THREE.PerspectiveCamera).far = distance * 10;
    camera.updateProjectionMatrix();
    
    return { position: newPosition, target: center, distance };
  }, [scene, camera]);
  
  useEffect(() => {
    const { position, target, distance } = fitCameraToScene();
    
    camera.position.copy(position);
    
    if (controlsRef.current) {
      controlsRef.current.target.copy(target);
      controlsRef.current.minDistance = distance * 0.3;
      controlsRef.current.maxDistance = distance * 5;
      controlsRef.current.update();
    }
    
    if (!initialCameraState.current) {
      initialCameraState.current = {
        position: position.clone(),
        target: target.clone()
      };
    }
  }, [scene, camera, controlsRef, fitCameraToScene]);
  
  useEffect(() => {
    if (resetTrigger > 0 && initialCameraState.current && controlsRef.current) {
      gsap.to(camera.position, {
        x: initialCameraState.current.position.x,
        y: initialCameraState.current.position.y,
        z: initialCameraState.current.position.z,
        duration: 0.5,
        ease: 'power2.out',
        onUpdate: () => controlsRef.current?.update()
      });
      
      gsap.to(controlsRef.current.target, {
        x: initialCameraState.current.target.x,
        y: initialCameraState.current.target.y,
        z: initialCameraState.current.target.z,
        duration: 0.5,
        ease: 'power2.out'
      });
    }
  }, [resetTrigger, camera, controlsRef]);
  
  return null;
};

const Model = ({ url, onLoaded }: ModelProps) => {
  const { scene } = useGLTF(url);
  const [isModelReady, setIsModelReady] = useState(false);
  
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material) {
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
        child.visible = true;
        child.renderOrder = 0;
      }
    });

    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = (2 / maxDim) * 0.9; 
    scene.scale.setScalar(scale);
    
    setIsModelReady(true);
    if (onLoaded) {
      onLoaded();
    }
  }, [scene, url, onLoaded]);

  if (!isModelReady) {
    return null;
  }

  return <primitive object={scene} />;
};

interface SceneContentProps {
  objectUrl: string;
  onModelLoaded: () => void;
  controlsRef: React.RefObject<React.ElementRef<typeof OrbitControls>>;
  resetTrigger: number;
}

const SceneContent = ({ objectUrl, onModelLoaded, controlsRef, resetTrigger }: SceneContentProps) => {
  const { scene } = useGLTF(objectUrl);
  
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      <Center>
        <Model url={objectUrl} onLoaded={onModelLoaded} />
      </Center>
      <CameraController scene={scene} controlsRef={controlsRef} resetTrigger={resetTrigger} />
      <OrbitControls 
        ref={controlsRef}
        enableDamping={false}
        enablePan={true}
        enableZoom={true}
        maxPolarAngle={Math.PI * 0.9}
        minPolarAngle={Math.PI * 0.1}
      />
      <Environment preset="warehouse" />
    </>
  );
};

interface GLBViewerProps {
  file: File;
  onReset: () => void;
  onReady?: () => void;
  onProgress?: (percent: number) => void;
}

const ModelProgressReporter = ({ onProgress }: { onProgress?: (p: number) => void }) => {
  const { progress } = useProgress();
  useEffect(() => {
    if (onProgress) {
      onProgress(progress);
    }
  }, [progress, onProgress]);
  return null;
};

const GLBViewer = memo(({ file, onReset, onReady, onProgress }: GLBViewerProps) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resetTrigger, setResetTrigger] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<React.ElementRef<typeof OrbitControls>>(null);

  useEffect(() => {
    setIsLoading(true);
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: 'elastic.out(1, 0.7)' }
      );
    }
  }, []);

  const handleModelLoaded = () => {
    setIsLoading(false);
    if (onReady) {
      onReady();
    }
  };

  const handleCenterModel = () => {
    setResetTrigger(prev => prev + 1);
  };

  const handleResetZoom = () => {
    setResetTrigger(prev => prev + 1);
  };

  if (!objectUrl) return null;

  return (
    <div ref={containerRef} className="w-full aspect-[16/9] max-w-4xl border-3 border-muted relative">
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center px-4 py-2 bg-surface/80 border-b-3 border-muted">
        <span className="font-ui text-sm text-reading truncate max-w-[200px]">
          {file.name}
        </span>
        <button
          onClick={onReset}
          className="font-ui text-sm text-muted hover:text-active"
          style={{ transition: 'none' }}
        >
          [CLEAR]
        </button>
      </div>
      
      <div className="absolute right-0 top-12 z-10 flex flex-col gap-2 p-2">
        <div className="relative group">
          <button
            onClick={handleCenterModel}
            className="font-ui text-xs text-muted hover:text-active bg-surface/90 border-2 border-muted hover:border-active px-3 py-2"
            style={{ transition: 'none' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
            </svg>
          </button>
          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-surface border-2 border-muted text-xs font-ui text-reading whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none">
            CENTER MODEL
          </div>
        </div>
        <div className="relative group">
          <button
            onClick={handleResetZoom}
            className="font-ui text-xs text-muted hover:text-active bg-surface/90 border-2 border-muted hover:border-active px-3 py-2"
            style={{ transition: 'none' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          </button>
          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-surface border-2 border-muted text-xs font-ui text-reading whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none">
            RESET VIEW
          </div>
        </div>
      </div>
      
      <Canvas
        camera={{ position: [3, 3, 3], fov: 45 }}
        style={{ background: 'hsl(273, 12%, 20%)' }}
      >
        <Suspense fallback={null}>
          <ModelProgressReporter onProgress={onProgress} />
          <SceneContent 
            objectUrl={objectUrl} 
            onModelLoaded={handleModelLoaded}
            controlsRef={controlsRef}
            resetTrigger={resetTrigger}
          />
        </Suspense>
      </Canvas>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/90 z-20">
          <LoadingIndicator text="LOADING MODEL..." size="md" />
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-surface/80 border-t-3 border-muted">
        <span className="font-ui text-sm text-muted">
          SIZE: {(file.size / 1024 / 1024).toFixed(2)} MB
        </span>
      </div>
    </div>
  );
});

GLBViewer.displayName = 'GLBViewer';

export default GLBViewer;
