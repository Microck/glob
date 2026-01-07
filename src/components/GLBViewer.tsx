import { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Center } from '@react-three/drei';
import * as THREE from 'three';

interface ModelProps {
  url: string;
  onLoaded?: () => void;
}

const CameraFitter = ({ scene }: { scene: THREE.Object3D }) => {
  const { camera, controls } = useThree();
  
  useEffect(() => {
    // Compute bounding box
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Calculate distance needed to fit object in view
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    const distance = Math.abs(maxDim / (2 * Math.tan(fov / 2)));
    
    // Add some padding and position camera
    const offset = 1.5; // 50% padding
    const cameraDistance = distance * offset;
    
    // Position camera at an angle for better view
    const angle = Math.PI / 4; // 45 degrees
    camera.position.set(
      center.x + cameraDistance * Math.cos(angle),
      center.y + cameraDistance * Math.sin(angle),
      center.z + cameraDistance * Math.cos(angle)
    );
    
    // Update camera near and far planes for better precision
    camera.near = Math.max(0.1, distance / 100);
    camera.far = distance * 10;
    camera.updateProjectionMatrix();
    
    // Update controls target to center of object
    if (controls) {
      controls.target.copy(center);
      controls.update();
    }
  }, [scene, camera, controls]);
  
  return null;
};

const Model = ({ url, onLoaded }: ModelProps) => {
  const { scene } = useGLTF(url);
  const [isModelReady, setIsModelReady] = useState(false);
  
  useEffect(() => {
    // Compute bounding box and center the model
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    scene.position.sub(center);
    
    // Scale to fit
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxDim;
    scene.scale.setScalar(scale);
    
    // Mark as ready when model is processed
    setIsModelReady(true);
    if (onLoaded) {
      onLoaded();
    }
  }, [scene, onLoaded]);

  if (!isModelReady) {
    return null;
  }

  return (
    <>
      <primitive object={scene} />
      <CameraFitter scene={scene} />
    </>
  );
};

interface GLBViewerProps {
  file: File;
  onReset: () => void;
}

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full bg-surface">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-active mx-auto mb-4"></div>
      <p className="font-ui text-reading text-sm">LOADING MODEL...</p>
    </div>
  </div>
);

const GLBViewer = ({ file, onReset }: GLBViewerProps) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handleModelLoaded = () => {
    setIsLoading(false);
  };

  if (!objectUrl) return null;

  return (
    <div className="w-full aspect-[16/9] max-w-4xl border-3 border-muted relative">
      {/* File info header */}
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
      
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [3, 3, 3], fov: 45 }}
        style={{ background: 'hsl(273, 12%, 20%)' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Center>
            <Model url={objectUrl} onLoaded={handleModelLoaded} />
          </Center>
          <OrbitControls 
            enableDamping={false}
            enablePan={true}
            enableZoom={true}
          />
          <Environment preset="warehouse" />
        </Suspense>
      </Canvas>
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/80 z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-active mx-auto mb-2"></div>
            <p className="font-ui text-reading text-sm">LOADING...</p>
          </div>
        </div>
      )}
      
      {/* File size */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-surface/80 border-t-3 border-muted">
        <span className="font-ui text-sm text-muted">
          SIZE: {(file.size / 1024 / 1024).toFixed(2)} MB
        </span>
      </div>
    </div>
  );
};

export default GLBViewer;