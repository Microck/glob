const NoiseOverlay = () => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-50"
      style={{ 
        opacity: 0.25,
        mixBlendMode: 'soft-light'
      }}
    >
      <svg 
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="noise">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.7" 
              numOctaves="4" 
              stitchTiles="stitch"
            />
          </filter>
        </defs>
        <rect 
          width="100%" 
          height="100%" 
          filter="url(#noise)"
        />
      </svg>
    </div>
  );
};

export default NoiseOverlay;
