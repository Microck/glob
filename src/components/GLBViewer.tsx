import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Center } from '@react-three/drei';
import * as THREE from 'three';

interface ModelProps {
  url: string;
}

const Model = ({ url }: ModelProps) => {
  const { scene } = useGLTF(url);
  
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
  }, [scene]);

  return <primitive object={scene} />;
};

interface GLBViewerProps {
  file: File;
  onReset: () => void;
}

const GLBViewer = ({ file, onReset }: GLBViewerProps) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!objectUrl) return null;

  return (
    <div className="w-full aspect-square max-w-xl border-3 border-muted relative">
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
            <Model url={objectUrl} />
          </Center>
          <OrbitControls 
            enableDamping={false}
            enablePan={true}
            enableZoom={true}
          />
          <Environment preset="warehouse" />
        </Suspense>
      </Canvas>
      
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
