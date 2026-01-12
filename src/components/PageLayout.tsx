import { ReactNode } from "react";
import Header from "./Header";
import FloatingLinks from "./FloatingLinks";
import GridBackground from "./GridBackground";
import NoiseOverlay from "./NoiseOverlay";

interface PageLayoutProps {
  children: ReactNode;
  showContentOnly?: boolean;
  isCentered?: boolean;
  disableScroll?: boolean;
}


const PageLayout = ({ 
  children, 
  showContentOnly = false, 
  isCentered = true, 
  disableScroll = false
}: PageLayoutProps) => {
  const mainPadding = showContentOnly ? 'pt-8 pb-8' : 'pt-24 pb-32';
  const contentScale = showContentOnly ? 'scale-100' : 'scale-90';
  const contentWidth = showContentOnly ? 'max-w-md' : 'max-w-4xl';

  return (
    <div className="h-screen w-screen flex flex-col relative overflow-hidden bg-background">
      <GridBackground />
      <NoiseOverlay />
      
      {!showContentOnly && <Header />}
      
      <main className={`flex-1 relative z-10 scrollbar-none ${mainPadding} ${disableScroll ? 'overflow-hidden' : 'overflow-y-auto'} ${isCentered ? 'flex flex-col items-center justify-center' : ''}`}>
        <div className={`w-full ${contentWidth} mx-auto px-6 ${contentScale} ${isCentered ? 'origin-center' : 'origin-top'}`}>
          {children}
        </div>
      </main>

      {!showContentOnly && <FloatingLinks />}
    </div>
  );
};

export default PageLayout;
