import { useEffect } from 'react';

const BASE_TITLE = 'glob';
const TITLE_SUFFIX = ' | Free GLB/GLTF 3D Model Compressor';

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    const previousTitle = document.title;
    
    if (title) {
      document.title = `${title}${TITLE_SUFFIX}`;
    } else {
      document.title = `${BASE_TITLE} - Free GLB/GLTF 3D Model Compressor | Reduce File Size by 90%+`;
    }
    
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}

export function useDocumentMeta(description?: string) {
  useEffect(() => {
    if (!description) return;
    
    const metaDesc = document.querySelector('meta[name="description"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    
    const previousDesc = metaDesc?.getAttribute('content') || '';
    const previousOgDesc = ogDesc?.getAttribute('content') || '';
    
    metaDesc?.setAttribute('content', description);
    ogDesc?.setAttribute('content', description);
    
    return () => {
      metaDesc?.setAttribute('content', previousDesc);
      ogDesc?.setAttribute('content', previousOgDesc);
    };
  }, [description]);
}
