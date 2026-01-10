import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/clerk-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const CLERK_ENABLED = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

const ClerkAuthSection = () => {
  if (!CLERK_ENABLED) {
    return (
      <Link 
        to="/login"
        className="flex items-center gap-2 font-ui text-xs text-reading hover:text-active font-bold"
      >
        <LogIn className="w-4 h-4" />
        LOGIN
      </Link>
    );
  }

  return (
    <>
      <SignedIn>
        <UserButton 
          appearance={{
            elements: {
              userButtonAvatarBox: "border-2 border-muted",
              userButtonTrigger: "focus:ring-0 focus:ring-offset-0 focus:shadow-none"
            }
          }}
        />
      </SignedIn>
      
      <SignedOut>
        <SignInButton mode="modal">
          <button className="flex items-center gap-2 font-ui text-xs text-reading hover:text-active font-bold">
            <LogIn className="w-4 h-4" />
            LOGIN
          </button>
        </SignInButton>
      </SignedOut>
    </>
  );
};

const Header = () => {
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    
    tl.fromTo(logoRef.current,
      { x: -30, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5 }
    )
    .fromTo(navRef.current?.children || [],
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.1 },
      '-=0.3'
    );
  }, []);

  return (
    <header ref={headerRef} className="fixed top-0 left-0 right-0 z-40 p-6 flex justify-between items-center">
      <Link ref={logoRef} to="/" className="flex items-center group">
        <img 
          src="/glob.svg" 
          alt="glob" 
          className="w-[66px] group-hover:opacity-80 transition-opacity"
          style={{ 
            transform: 'translate(-4px, -5px)',
            filter: 'invert(92%) sepia(8%) saturate(200%) hue-rotate(330deg) brightness(103%) contrast(92%)'
          }}
        />
        <h1 
          className="font-display text-xl tracking-brutal group-hover:text-active transition-colors"
          style={{ 
            transform: 'translate(8px, -6px)',
            width: '65px',
            color: '#E7D9D5'
          }}
        >
          glob
        </h1>
      </Link>

      <div ref={navRef} className="flex items-center gap-4">
        <Link 
          to="/history" 
          className="font-ui text-xs text-reading hover:text-active transition-none font-bold"
        >
          DASHBOARD
        </Link>
        <Link 
          to="/pricing" 
          className="font-ui text-xs text-active border-3 border-active px-3 py-1 hover:bg-active hover:text-surface transition-none font-bold"
        >
          UPGRADE
        </Link>
        
        <ClerkAuthSection />
      </div>
    </header>
  );
};

export default Header;
