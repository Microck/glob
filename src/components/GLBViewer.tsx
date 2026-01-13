import { Suspense, useEffect, useState, useRef, useCallback, memo, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Center, useProgress } from '@react-three/drei';
import { Crosshair } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import * as THREE from 'three';
import gsap from 'gsap';
import LoadingIndicator from './LoadingIndicator';

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
    
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
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

const buildPreviewScene = (scene: THREE.Object3D, wireframe: boolean, clay: boolean, roughness: boolean) => {
  const clonedScene = scene.clone(true);

  const createRoughMaterial = (material: THREE.Material) => {
    const baseColor = (material as THREE.MeshStandardMaterial).color?.clone?.() ?? new THREE.Color(0xffffff);
    return new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: 1.0,
      metalness: 0.0
    });
  };

  clonedScene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (wireframe) {
        child.material = new THREE.MeshBasicMaterial({ 
          color: 0xFC6E83, 
          wireframe: true,
          wireframeLinewidth: 1
        });
      } else if (clay) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0xd4d4d4,
          roughness: 0.6,
          metalness: 0.0,
          flatShading: false,
          envMapIntensity: 0.3
        });
      } else if (roughness) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map(material => {
            if (material instanceof THREE.MeshStandardMaterial) {
              const cloned = material.clone();
              cloned.roughness = 1.0;
              cloned.metalness = 0.0;
              return cloned;
            }
            return createRoughMaterial(material);
          });
        } else if (child.material instanceof THREE.MeshStandardMaterial) {
          const cloned = child.material.clone();
          cloned.roughness = 1.0;
          cloned.metalness = 0.0;
          child.material = cloned;
        } else if (child.material) {
          child.material = createRoughMaterial(child.material);
        }
      } else if (Array.isArray(child.material)) {
        child.material.forEach((mat) => {
          mat.transparent = false;
          mat.opacity = 1;
          mat.side = THREE.FrontSide;
        });
      } else if (child.material) {
        child.material.transparent = false;
        child.material.opacity = 1;
        child.material.side = THREE.FrontSide;
      }

      if (!Array.isArray(child.material) && child.material) {
        child.material.needsUpdate = true;
      } else if (Array.isArray(child.material)) {
        child.material.forEach(material => {
          material.needsUpdate = true;
        });
      }

      child.visible = true;
      child.renderOrder = 0;
    }
  });

  const box = new THREE.Box3().setFromObject(clonedScene);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const scale = (2 / maxDim) * 0.9; 
  clonedScene.scale.setScalar(scale);

  return clonedScene;
};

interface SceneContentProps {
  objectUrl: string;
  onModelLoaded: () => void;
  controlsRef: React.RefObject<React.ElementRef<typeof OrbitControls>>;
  resetTrigger: number;
  wireframe?: boolean;
  clay?: boolean;
  roughness?: boolean;
}

const SceneContent = ({ objectUrl, onModelLoaded, controlsRef, resetTrigger, wireframe, clay, roughness }: SceneContentProps) => {
  const { scene } = useGLTF(objectUrl);
  const previewScene = useMemo(() => buildPreviewScene(scene, wireframe, clay, roughness), [scene, wireframe, clay, roughness]);

  useEffect(() => {
    onModelLoaded();
  }, [onModelLoaded, previewScene]);
  
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      <Center>
        <primitive object={previewScene} />
      </Center>
      <CameraController scene={previewScene} controlsRef={controlsRef} resetTrigger={resetTrigger} />
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
  objectUrl?: string;
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

const GLBViewer = memo(({ file, objectUrl: externalUrl, onReset, onReady, onProgress }: GLBViewerProps) => {
  const [internalUrl, setInternalUrl] = useState<string | null>(null);
  const objectUrl = externalUrl || internalUrl;
  const [isLoading, setIsLoading] = useState(true);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [wireframe, setWireframe] = useState(false);
  const [clay, setClay] = useState(false);
  const [roughness, setRoughness] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<React.ElementRef<typeof OrbitControls>>(null);

useEffect(() => {
    if (externalUrl) return; // Don't create internal URL if external one provided
    setIsLoading(true);
    const url = URL.createObjectURL(file);
    setInternalUrl(url);
    
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file, externalUrl]);

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
        <span className="font-ui text-sm text-reading truncate max-w-[420px]" title={file.name}>
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
            className="w-10 h-10 flex items-center justify-center font-ui text-xs text-muted hover:text-active bg-surface/90 border-2 border-muted hover:border-active transition-none"
            title="Center Model"
          >
            <Crosshair className="w-4 h-4" />
          </button>
          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-surface border-2 border-muted text-xs font-ui text-reading whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none">
            CENTER MODEL
          </div>
        </div>
        <div className="relative group">
          <button
            onClick={handleResetZoom}
            className="w-10 h-10 flex items-center justify-center font-ui text-xs text-muted hover:text-active bg-surface/90 border-2 border-muted hover:border-active transition-none"
            title="Reset View"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            wireframe={wireframe}
            clay={clay}
            roughness={roughness}
          />
        </Suspense>
      </Canvas>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/90 z-20">
          <LoadingIndicator text="LOADING MODEL..." size="md" />
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-surface/80 border-t-3 border-muted flex items-center justify-between">
        <span className="font-ui text-sm text-muted">
          SIZE: {(file.size / 1024 / 1024).toFixed(2)} MB
        </span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch 
              id="wireframe-preview" 
              checked={wireframe} 
              onCheckedChange={(checked) => {
                setWireframe(checked);
                if (checked) { setClay(false); setRoughness(false); }
              }} 
              className="data-[state=checked]:bg-active scale-75"
            />
            <label htmlFor="wireframe-preview" className="font-ui text-[10px] text-muted cursor-pointer uppercase tracking-wider">
              Wire
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Switch 
              id="clay-preview" 
              checked={clay} 
              onCheckedChange={(checked) => {
                setClay(checked);
                if (checked) { setWireframe(false); setRoughness(false); }
              }} 
              className="data-[state=checked]:bg-active scale-75"
            />
            <label htmlFor="clay-preview" className="font-ui text-[10px] text-muted cursor-pointer uppercase tracking-wider">
              Clay
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Switch 
              id="roughness-preview" 
              checked={roughness} 
              onCheckedChange={(checked) => {
                setRoughness(checked);
                if (checked) { setWireframe(false); setClay(false); }
              }} 
              className="data-[state=checked]:bg-active scale-75"
            />
            <label htmlFor="roughness-preview" className="font-ui text-[10px] text-muted cursor-pointer uppercase tracking-wider">
              Matte
            </label>
          </div>
        </div>
      </div>
    </div>
  );
});

GLBViewer.displayName = 'GLBViewer';

export default GLBViewer;
