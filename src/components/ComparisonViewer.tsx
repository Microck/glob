import { Suspense, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Center } from '@react-three/drei';
import { Switch } from '@/components/ui/switch';
import * as THREE from 'three';
import gsap from 'gsap';
import { Share2, Focus, ChevronLeft, ChevronRight, List, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ModelProps {
  url: string;
  wireframe?: boolean;
}

const Model = ({ url, wireframe = false, clay = false }: ModelProps & { clay?: boolean }) => {
  const { scene } = useGLTF(url);
  const clonedScene = useMemo(() => {
    const s = scene.clone(true);
    s.userData.mode = wireframe ? 'wireframe' : clay ? 'clay' : 'default'; 
    return s;
  }, [scene, wireframe, clay]);
  
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
          } else if (clay) {
            child.material = new THREE.MeshStandardMaterial({
              color: 0xd4d4d4,
              roughness: 0.6,
              metalness: 0.0,
              flatShading: false,
              envMapIntensity: 0.3
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
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = (2 / maxDim) * 0.9; 
    clonedScene.scale.setScalar(scale);
  }, [clonedScene, wireframe, clay]);

  return <primitive object={clonedScene} />;
};

const SHARED_LIGHTING = {
  ambient: 0.7,
  directional: 1.2,
  point: 0.5,
  background: 'hsl(273, 12%, 20%)',
  optimizedBackground: 'hsl(273, 12%, 12%)'
};

interface ComparisonViewerProps {
  file: File;
  originalSize: number;
  compressedSize: number;
  optimizedUrl?: string;
  onDownload: () => void;
  onReset: () => void;
  facesBefore?: number;
  facesAfter?: number;
  verticesBefore?: number;
  verticesAfter?: number;
  // Bulk mode props
  fileList?: File[];
  currentIndex?: number;
  onNext?: () => void;
  onPrev?: () => void;
  onSelectFile?: (index: number) => void;
  onBackToResults?: () => void;
}

const ComparisonViewer = ({ 
  file, 
  originalSize, 
  compressedSize, 
  optimizedUrl,
  onDownload, 
  onReset,
  facesBefore,
  facesAfter,
  verticesBefore,
  verticesAfter,
  fileList,
  currentIndex,
  onNext,
  onPrev,
  onSelectFile,
  onBackToResults
}: ComparisonViewerProps) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [optimizedObjectUrl, setOptimizedObjectUrl] = useState<string | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [clay, setClay] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  
  const leftControlsRef = useRef<React.ElementRef<typeof OrbitControls>>(null);
  const rightControlsRef = useRef<React.ElementRef<typeof OrbitControls>>(null);
  const isSyncing = useRef(false);
  
  const { toast } = useToast();

  const handleShare = async () => {
    if (!optimizedUrl) return;
    const id = optimizedUrl.split('/').pop();
    const shareUrl = `${window.location.origin}/share/${id}`;
    
    const apiBase = import.meta.env.VITE_API_URL || '';
    try {
      await fetch(`${apiBase}/api/activate-share/${id}`, { method: 'POST' });
    } catch (e) {
      console.error(e);
    }

    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "LINK COPIED",
      description: "Link expires in 1 hour. Upgrade to Globber for 48h links.",
    });
  };

  const handleCenterModel = useCallback(() => {
    if (leftControlsRef.current && rightControlsRef.current) {
      leftControlsRef.current.reset();
      rightControlsRef.current.reset();
      
      leftControlsRef.current.target.set(0, 0, 0);
      rightControlsRef.current.target.set(0, 0, 0);
      
      leftControlsRef.current.update();
      rightControlsRef.current.update();
    }
  }, []);

  useEffect(() => {
    if (mainContainerRef.current) {
      gsap.fromTo(mainContainerRef.current,
        { opacity: 0, scale: 1.02, filter: 'blur(10px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.4, ease: 'circ.out' }
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

  const showFileSwitcher = fileList && fileList.length > 1 && currentIndex !== undefined;

  return (
    <div ref={mainContainerRef} className="w-full max-w-4xl">
      {showFileSwitcher && (
        <div className="flex items-center justify-between mb-4 bg-surface border-3 border-muted p-2">
          <div className="flex items-center gap-2">
            {onBackToResults && (
              <button 
                onClick={onBackToResults}
                className="p-2 hover:bg-muted/50 text-muted hover:text-reading transition-colors"
                title="Back to Results"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <span className="font-ui text-xs text-muted uppercase tracking-widest ml-2">
              File {currentIndex! + 1} of {fileList!.length}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={currentIndex === 0}
              className="p-2 hover:bg-muted/50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1 hover:bg-muted/50 transition-colors font-ui text-sm max-w-[200px]">
                  <span className="truncate">{file.name}</span>
                  <List className="w-4 h-4 text-muted" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
                {fileList!.map((f, idx) => (
                  <DropdownMenuItem 
                    key={idx} 
                    onClick={() => onSelectFile?.(idx)}
                    className={currentIndex === idx ? "bg-muted font-bold" : ""}
                  >
                    <span className="truncate max-w-[200px]">{idx + 1}. {f.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={onNext}
              disabled={currentIndex === fileList!.length - 1}
              className="p-2 hover:bg-muted/50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

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
            <span className="font-ui text-[10px] text-muted tracking-widest uppercase">Original</span>
            <div className="font-display text-lg text-reading">
              {(originalSize / 1024 / 1024).toFixed(2)} MB
            </div>
            {facesBefore !== undefined && verticesBefore !== undefined && (
              <div className="mt-1 flex gap-3">
                <div>
                  <div className="font-ui text-[9px] text-muted uppercase tracking-wider">Faces</div>
                  <div className="font-mono text-xs text-reading">{facesBefore.toLocaleString()}</div>
                </div>
                <div>
                  <div className="font-ui text-[9px] text-muted uppercase tracking-wider">Verts</div>
                  <div className="font-mono text-xs text-reading">{verticesBefore.toLocaleString()}</div>
                </div>
              </div>
            )}
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
                <Model url={objectUrl} wireframe={wireframe} clay={clay} />
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
          <div className="absolute top-0 right-0 z-10 px-4 py-2 bg-surface/90 border-l-3 border-b-3 border-muted text-right">
            <span className="font-ui text-[10px] text-active tracking-widest uppercase">Optimized</span>
            <div className="font-display text-lg text-active">
              {(compressedSize / 1024 / 1024).toFixed(2)} MB
            </div>
            {facesAfter !== undefined && verticesAfter !== undefined && (
              <div className="mt-1 flex gap-3 justify-end">
                <div>
                  <div className="font-ui text-[9px] text-active uppercase tracking-wider">Faces</div>
                  <div className="font-mono text-xs text-active">{facesAfter.toLocaleString()}</div>
                </div>
                <div>
                  <div className="font-ui text-[9px] text-active uppercase tracking-wider">Verts</div>
                  <div className="font-mono text-xs text-active">{verticesAfter.toLocaleString()}</div>
                </div>
              </div>
            )}
          </div>
          <Canvas
            camera={{ position: [3, 3, 3], fov: 45 }}
            style={{ background: SHARED_LIGHTING.optimizedBackground }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={SHARED_LIGHTING.ambient} />
              <directionalLight position={[10, 10, 5]} intensity={SHARED_LIGHTING.directional} />
              <pointLight position={[-10, -10, -10]} intensity={SHARED_LIGHTING.point} />
              <Center>
                <Model url={optimizedObjectUrl || objectUrl} wireframe={wireframe} clay={clay} />
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
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-active flex items-center justify-center cursor-ew-resize shadow-brutal"
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
          <span className="font-ui text-[10px] text-muted bg-surface/80 px-2 py-1 tracking-widest uppercase">◀ ORIGINAL</span>
          <span className="font-ui text-[10px] text-active bg-surface/80 px-2 py-1 tracking-widest uppercase">OPTIMIZED ▶</span>
        </div>
      </div>

      <div className="flex border-3 border-t-0 border-muted">
        <div className="flex-1 p-4 border-r-3 border-muted bg-surface">
          <span className="font-ui text-[10px] text-muted uppercase tracking-widest">Reduction</span>
          <div className="font-display text-3xl text-active tracking-brutal mt-1">
            -{reduction}%
          </div>
        </div>
        <div className="flex-1 p-4 border-r-3 border-muted bg-surface flex flex-col justify-center">
          <span className="font-ui text-[10px] text-muted mb-3 uppercase tracking-widest">View Mode</span>
          <div className="flex items-center gap-2">
            <Switch 
              id="wireframe-mode" 
              checked={wireframe} 
              onCheckedChange={(checked) => {
                setWireframe(checked);
                if (checked) setClay(false);
              }} 
              className="data-[state=checked]:bg-active"
            />
            <label 
              htmlFor="wireframe-mode" 
              className="font-ui text-[10px] text-reading cursor-pointer select-none uppercase tracking-wider"
            >
              Wireframe
            </label>
            
            <div className="w-4" />
            
            <Switch 
              id="clay-mode" 
              checked={clay} 
              onCheckedChange={(checked) => {
                setClay(checked);
                if (checked) setWireframe(false);
              }} 
              className="data-[state=checked]:bg-active"
            />
            <label 
              htmlFor="clay-mode" 
              className="font-ui text-[10px] text-reading cursor-pointer select-none uppercase tracking-wider"
            >
              Clay
            </label>
          </div>
        </div>
        <div className="flex-1 p-4 bg-surface max-w-[200px]">
          <span className="font-ui text-[10px] text-muted uppercase tracking-widest">File</span>
          <div className="font-ui text-[10px] text-reading truncate mt-2 uppercase">
            {file.name}
          </div>
        </div>
      </div>

      <div className="flex">
        <button
          onClick={onDownload}
          className="flex-1 bg-active text-surface font-display text-xl py-5 hover:bg-reading transition-none"
        >
          DOWNLOAD
        </button>
        <button
          onClick={handleCenterModel}
          className="border-3 border-l-0 border-muted bg-surface text-reading font-ui px-6 py-5 hover:bg-active hover:text-surface hover:border-active flex items-center justify-center transition-none"
          title="Center Model"
        >
          <Focus className="w-5 h-5" />
        </button>
        <button
          onClick={handleShare}
          className="border-3 border-l-0 border-muted bg-surface text-reading font-ui px-6 py-5 hover:bg-active hover:text-surface hover:border-active flex items-center justify-center transition-none"
          title="Share Link"
        >
          <Share2 className="w-5 h-5" />
        </button>
        <button
          onClick={onReset}
          className="border-3 border-l-0 border-muted bg-surface text-muted font-display text-xl px-8 py-5 hover:text-active hover:border-active transition-none"
        >
          RESET
        </button>
      </div>
    </div>
  );
};

export default ComparisonViewer;
