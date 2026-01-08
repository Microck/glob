import { ReactNode } from "react";
import Header from "./Header";
import FloatingLinks from "./FloatingLinks";
import GridBackground from "./GridBackground";
import NoiseOverlay from "./NoiseOverlay";
import DebugMenu from "./DebugMenu";

type AppState = 'idle' | 'preview' | 'processing' | 'complete';

interface PageLayoutProps {
  children: ReactNode;
  showContentOnly?: boolean;
  isCentered?: boolean;
  disableScroll?: boolean;
  appState?: AppState;
  onStateChange?: (state: AppState) => void;
}

const PageLayout = ({ 
  children, 
  showContentOnly = false, 
  isCentered = true, 
  disableScroll = false,
  appState,
  onStateChange
}: PageLayoutProps) => {
  return (
    <div className="h-screen w-screen flex flex-col relative overflow-hidden bg-background">
      <GridBackground />
      <NoiseOverlay />
      
      {!showContentOnly && <Header />}
      
      <main className={`flex-1 relative z-10 scrollbar-none pt-24 pb-32 ${disableScroll ? 'overflow-hidden' : 'overflow-y-auto'} ${isCentered ? 'flex flex-col items-center justify-center' : ''}`}>
        <div className={`w-full max-w-4xl mx-auto px-6 scale-90 ${isCentered ? 'origin-center' : 'origin-top'}`}>
          {children}
        </div>
      </main>

      {!showContentOnly && <FloatingLinks />}

      <DebugMenu appState={appState} onStateChange={onStateChange} />
    </div>
  );
};

export default PageLayout;
