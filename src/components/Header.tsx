import { Link } from "react-router-dom";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/clerk-react";
import { LogIn } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 p-6 flex justify-between items-center">
      <Link to="/" className="flex items-center group">
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

      <div className="flex items-center gap-4">
        <Link 
          to="/pricing" 
          className="font-ui text-xs text-active border-3 border-active px-3 py-1 hover:bg-active hover:text-surface transition-none font-bold"
        >
          UPGRADE
        </Link>
        
        <SignedIn>
          <Link 
            to="/history" 
            className="font-ui text-xs text-reading hover:text-active transition-none font-bold"
          >
            DASHBOARD
          </Link>
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
      </div>
    </header>
  );
};

export default Header;
