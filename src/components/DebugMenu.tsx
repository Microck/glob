import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/all';
import TypewriterText from './TypewriterText';
import FlickerLabel from './FlickerLabel';

gsap.registerPlugin(Draggable);

type AppState = 'idle' | 'preview' | 'processing' | 'complete';

interface DebugMenuProps {
  appState: AppState;
  onStateChange: (state: AppState) => void;
}

interface ElementInfo {
  id: string;
  el: HTMLElement;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  rotation: number;
}

const generateSelector = (el: HTMLElement): string => {
  if (el.id) return `#${el.id}`;
  if (el.className && typeof el.className === 'string') {
    const classes = el.className.split(' ').filter(c => c && !c.startsWith('gsap'));
    if (classes.length > 0) return `.${classes[0]}`;
  }
  const tag = el.tagName.toLowerCase();
  const parent = el.parentElement;
  if (parent) {
    const siblings = Array.from(parent.children).filter(c => c.tagName === el.tagName);
    if (siblings.length > 1) {
      const index = siblings.indexOf(el) + 1;
      return `${generateSelector(parent)} > ${tag}:nth-child(${index})`;
    }
  }
  return tag;
};

const TransformHandles = ({ element, onUpdate }: { element: ElementInfo, onUpdate: () => void }) => {
  if (!element.el) return null;
  
  const rect = element.el.getBoundingClientRect();
  const handleStyle = "absolute w-3 h-3 bg-active border border-surface z-[100] cursor-pointer hover:scale-125 transition-transform";
  
  const onDragStart = (e: React.MouseEvent, type: 'se' | 'e' | 's') => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = rect.width;
    const startHeight = rect.height;
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      
      if (type === 'e' || type === 'se') newWidth = startWidth + dx;
      if (type === 's' || type === 'se') newHeight = startHeight + dy;
      
      if (type === 'se') {
        element.el.style.width = `${Math.max(10, newWidth)}px`;
        element.el.style.height = `${Math.max(10, newHeight)}px`;
      } else if (type === 'e') {
        element.el.style.width = `${Math.max(10, newWidth)}px`;
      } else if (type === 's') {
        element.el.style.height = `${Math.max(10, newHeight)}px`;
      }
      
      onUpdate();
    };
    
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <>
      <div 
        className="fixed border-2 border-active pointer-events-none z-[90]"
        style={{
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        }}
      />
      <div 
        className={handleStyle}
        style={{ left: rect.right - 6, top: rect.bottom - 6, cursor: 'nwse-resize' }}
        onMouseDown={(e) => onDragStart(e, 'se')}
      />
      <div 
        className={handleStyle}
        style={{ left: rect.right - 6, top: rect.top + rect.height/2 - 6, cursor: 'ew-resize' }}
        onMouseDown={(e) => onDragStart(e, 'e')}
      />
      <div 
        className={handleStyle}
        style={{ left: rect.left + rect.width/2 - 6, top: rect.bottom - 6, cursor: 'ns-resize' }}
        onMouseDown={(e) => onDragStart(e, 's')}
      />
    </>
  );
};

const DebugMenu = ({ appState, onStateChange }: DebugMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPickMode, setIsPickMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null);
  const [elements, setElements] = useState<ElementInfo[]>([]);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const states: AppState[] = ['idle', 'preview', 'processing', 'complete'];

  useEffect(() => {
    if (panelRef.current && isOpen) {
      gsap.fromTo(panelRef.current,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [isOpen]);

  useEffect(() => {
    if (!selectedElement) return;
    
    const update = () => {
      setSelectedElement(prev => prev ? { ...prev } : null);
    };
    
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    const interval = setInterval(update, 100);
    
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
      clearInterval(interval);
    };
  }, [selectedElement?.id]);

  const updateElementInfo = useCallback((id: string, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const transform = window.getComputedStyle(el).transform;
    const matrix = new DOMMatrix(transform === 'none' ? '' : transform);
    
    const scaleX = Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b);
    
    const info: ElementInfo = {
      id,
      el,
      x: matrix.m41,
      y: matrix.m42,
      width: rect.width,
      height: rect.height,
      scale: scaleX || 1,
      rotation: Math.atan2(matrix.m21, matrix.m11) * (180 / Math.PI)
    };

    setSelectedElement(info);
    setElements(prev => {
      const existing = prev.findIndex(e => e.id === id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = info;
        return updated;
      }
      return [...prev, info];
    });
    
    return info;
  }, []);

  const makeElementDraggable = useCallback((el: HTMLElement, id: string) => {
    const style = window.getComputedStyle(el);
    if (style.position === 'static') {
      el.style.position = 'relative';
    }
    el.dataset.debugId = id;

    // @ts-ignore - gsap draggable types
    if (Draggable.get(el)) return;

    Draggable.create(el, {
      type: 'x,y',
      onDrag: function() {
        updateElementInfo(id, el);
      },
      onDragEnd: function() {
        updateElementInfo(id, el);
      }
    });

    updateElementInfo(id, el);
  }, [updateElementInfo]);

  const handleMakeElementDraggable = (selector: string) => {
    const el = document.querySelector(selector) as HTMLElement;
    if (!el) {
      alert(`Element not found: ${selector}`);
      return;
    }
    makeElementDraggable(el, selector);
  };

  const handlePickElement = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.target as HTMLElement;
    
    if (target.closest('[data-debug-panel]')) {
      return;
    }
    
    if (hoveredElement) {
      hoveredElement.style.outline = '';
    }
    
    const selector = generateSelector(target);
    makeElementDraggable(target, selector);
    setIsPickMode(false);
    setHoveredElement(null);
  }, [makeElementDraggable, hoveredElement]);

  const handlePickHover = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    
    if (target.closest('[data-debug-panel]')) {
      if (hoveredElement) {
        hoveredElement.style.outline = '';
        setHoveredElement(null);
      }
      return;
    }
    
    if (hoveredElement && hoveredElement !== target) {
      hoveredElement.style.outline = '';
    }
    
    if (target !== hoveredElement) {
      target.style.outline = '2px dashed #FC6E83';
      setHoveredElement(target);
    }
  }, [hoveredElement]);

  useEffect(() => {
    if (isPickMode) {
      document.body.style.cursor = 'crosshair';
      document.addEventListener('click', handlePickElement, true);
      document.addEventListener('mousemove', handlePickHover, true);
      
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          if (hoveredElement) {
            hoveredElement.style.outline = '';
          }
          setIsPickMode(false);
          setHoveredElement(null);
        }
      };
      document.addEventListener('keydown', handleEsc);
      
      return () => {
        document.body.style.cursor = '';
        document.removeEventListener('click', handlePickElement, true);
        document.removeEventListener('mousemove', handlePickHover, true);
        document.removeEventListener('keydown', handleEsc);
        if (hoveredElement) {
          hoveredElement.style.outline = '';
        }
      };
    }
  }, [isPickMode, handlePickElement, handlePickHover, hoveredElement]);

  const handleSizeChange = (delta: number) => {
    if (!selectedElement) return;
    
    const el = selectedElement.el;
    const newScale = Math.max(0.1, selectedElement.scale + delta);
    
    gsap.set(el, { scale: newScale });
    updateElementInfo(selectedElement.id, el);
  };

  const handleWidthChange = (value: number) => {
    if (!selectedElement) return;
    selectedElement.el.style.width = `${value}px`;
    updateElementInfo(selectedElement.id, selectedElement.el);
  };

  const handleHeightChange = (value: number) => {
    if (!selectedElement) return;
    selectedElement.el.style.height = `${value}px`;
    updateElementInfo(selectedElement.id, selectedElement.el);
  };

  const handleRemoveElement = (elInfo: ElementInfo) => {
    elInfo.el.style.outline = '';
    setElements(prev => prev.filter(e => e.id !== elInfo.id));
    if (selectedElement?.id === elInfo.id) {
      setSelectedElement(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === '`' && e.ctrlKey) {
      setIsOpen(prev => !prev);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 font-ui text-xs bg-surface border-2 border-muted text-muted hover:text-active hover:border-active px-3 py-2"
        style={{ transition: 'none' }}
      >
        <TypewriterText text="DEBUG" />
      </button>
    );
  }

  return (
    <>
      {isPickMode && (
        <div 
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] bg-surface border-3 border-active px-4 py-2 pointer-events-none"
        >
          <TypewriterText text="PICK MODE: HOVER TO HIGHLIGHT" className="font-ui text-sm text-active" />
          <div className="font-ui text-xs text-muted mt-1">Click to select • ESC to cancel</div>
        </div>
      )}
      
      {selectedElement && !isPickMode && (
        <TransformHandles 
          element={selectedElement} 
          onUpdate={() => updateElementInfo(selectedElement.id, selectedElement.el)} 
        />
      )}
      
      <div
        ref={panelRef}
        data-debug-panel
        className="fixed top-4 right-4 z-50 w-80 bg-surface border-3 border-muted max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="flex justify-between items-center px-3 py-2 border-b-3 border-muted">
          <TypewriterText text="DEBUG_MENU" className="font-ui text-sm text-active" />
          <button
            onClick={() => setIsOpen(false)}
            className="font-ui text-xs text-muted hover:text-active"
          >
            [X]
          </button>
        </div>

        <div className="p-3 border-b-3 border-muted">
          <FlickerLabel text="APP_STATE" className="font-ui text-xs text-muted mb-2" />
          <div className="flex flex-wrap gap-1">
            {states.map(state => (
              <button
                key={state}
                onClick={() => {
                  console.log('Debug: switching to state:', state);
                  onStateChange(state);
                }}
                className={`font-ui text-xs px-2 py-1 border-2 ${
                  appState === state 
                    ? 'border-active text-active bg-active/20' 
                    : 'border-muted text-muted hover:border-active hover:text-active'
                }`}
                style={{ transition: 'none' }}
              >
                {state.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="font-mono text-xs text-muted mt-2">
            current: {appState}
          </div>
        </div>

        <div className="p-3 border-b-3 border-muted">
          <FlickerLabel text="MAKE_DRAGGABLE" className="font-ui text-xs text-muted mb-2" />
          
          <button
            onClick={() => setIsPickMode(true)}
            className={`w-full font-ui text-xs px-2 py-2 border-2 mb-2 ${
              isPickMode 
                ? 'border-active text-active bg-active/20' 
                : 'border-active text-active hover:bg-active hover:text-surface'
            }`}
          >
            PICK ELEMENT FROM PAGE
          </button>
          
          <div className="flex flex-col gap-1">
            <button
              onClick={() => handleMakeElementDraggable('header img')}
              className="font-ui text-xs text-left px-2 py-1 border-2 border-muted text-muted hover:border-active hover:text-active"
            >
              Header Cat (glob.svg)
            </button>
            <button
              onClick={() => handleMakeElementDraggable('header h1')}
              className="font-ui text-xs text-left px-2 py-1 border-2 border-muted text-muted hover:border-active hover:text-active"
            >
              Header Text
            </button>
            <button
              onClick={() => handleMakeElementDraggable('.drop-zone')}
              className="font-ui text-xs text-left px-2 py-1 border-2 border-muted text-muted hover:border-active hover:text-active"
            >
              Drop Zone
            </button>
          </div>
          <input
            type="text"
            placeholder="CSS selector..."
            className="w-full mt-2 px-2 py-1 font-ui text-xs bg-background border-2 border-muted text-reading"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleMakeElementDraggable((e.target as HTMLInputElement).value);
              }
            }}
          />
        </div>

        {selectedElement && (
          <div className="p-3 border-b-3 border-muted">
            <div className="flex justify-between items-center mb-2">
              <FlickerLabel text={`SELECTED: ${selectedElement.id}`} className="font-ui text-xs text-muted" />
              <button
                onClick={() => handleRemoveElement(selectedElement)}
                className="font-ui text-xs text-muted hover:text-active"
              >
                [REMOVE]
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="font-mono text-xs text-reading">
                <div>x: {selectedElement.x.toFixed(1)}px</div>
                <div>y: {selectedElement.y.toFixed(1)}px</div>
                <div>rot: {selectedElement.rotation.toFixed(1)}°</div>
              </div>
              <div className="font-mono text-xs text-reading">
                <div>w: {selectedElement.width.toFixed(1)}px</div>
                <div>h: {selectedElement.height.toFixed(1)}px</div>
                <div>scale: {selectedElement.scale.toFixed(2)}</div>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              <div>
                <div className="font-ui text-xs text-muted mb-1">WIDTH</div>
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={Math.round(selectedElement.width)}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    className="flex-1 px-2 py-1 font-mono text-xs bg-background border-2 border-muted text-reading"
                  />
                  <span className="font-mono text-xs text-muted py-1">px</span>
                </div>
              </div>
              <div>
                <div className="font-ui text-xs text-muted mb-1">HEIGHT</div>
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={Math.round(selectedElement.height)}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    className="flex-1 px-2 py-1 font-mono text-xs bg-background border-2 border-muted text-reading"
                  />
                  <span className="font-mono text-xs text-muted py-1">px</span>
                </div>
              </div>
              <div>
                <div className="font-ui text-xs text-muted mb-1">SCALE</div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleSizeChange(-0.1)}
                    className="px-3 py-1 font-ui text-xs border-2 border-muted text-muted hover:border-active hover:text-active"
                  >
                    -
                  </button>
                  <div className="flex-1 text-center font-mono text-xs text-reading py-1">
                    {selectedElement.scale.toFixed(2)}x
                  </div>
                  <button
                    onClick={() => handleSizeChange(0.1)}
                    className="px-3 py-1 font-ui text-xs border-2 border-muted text-muted hover:border-active hover:text-active"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => copyToClipboard(
                `transform: translate(${selectedElement.x.toFixed(0)}px, ${selectedElement.y.toFixed(0)}px)${selectedElement.scale !== 1 ? ` scale(${selectedElement.scale.toFixed(2)})` : ''};\nwidth: ${selectedElement.width.toFixed(0)}px;\nheight: ${selectedElement.height.toFixed(0)}px;`
              )}
              className="font-ui text-xs px-2 py-1 border-2 border-active text-active hover:bg-active hover:text-surface w-full"
            >
              COPY CSS
            </button>
          </div>
        )}

        {elements.length > 0 && (
          <div className="p-3 border-b-3 border-muted">
            <FlickerLabel text={`ALL_ELEMENTS (${elements.length})`} className="font-ui text-xs text-muted mb-2" />
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {elements.map(el => (
                <div 
                  key={el.id}
                  className={`font-mono text-xs p-2 cursor-pointer flex justify-between items-start ${
                    selectedElement?.id === el.id 
                      ? 'bg-active/20 text-active' 
                      : 'text-reading bg-background hover:bg-muted/20'
                  }`}
                  onClick={() => setSelectedElement(el)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{el.id}</div>
                    <div className="text-muted">({el.x.toFixed(0)}, {el.y.toFixed(0)}) {el.width.toFixed(0)}x{el.height.toFixed(0)}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveElement(el);
                    }}
                    className="font-ui text-xs text-muted hover:text-active ml-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-3">
          <div className="font-ui text-xs text-muted">CTRL+` to toggle</div>
        </div>
      </div>
    </>
  );
};

export default DebugMenu;
