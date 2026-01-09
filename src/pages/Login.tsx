import PageLayout from '@/components/PageLayout';
import { Link } from 'react-router-dom';

const CLERK_ENABLED = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

const Login = () => {
  if (!CLERK_ENABLED) {
    return (
      <PageLayout showContentOnly>
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="font-ui text-muted text-sm uppercase tracking-widest">
            Authentication not configured
          </p>
          <Link 
            to="/"
            className="font-ui text-xs text-active border-3 border-active px-4 py-2 hover:bg-active hover:text-surface transition-none font-bold"
          >
            BACK TO HOME
          </Link>
        </div>
      </PageLayout>
    );
  }

  const { SignIn } = require("@clerk/clerk-react");
  
  return (
    <PageLayout showContentOnly>
      <div className="flex flex-col items-center justify-center">
        <SignIn />
      </div>
    </PageLayout>
  );
};

export default Login;
