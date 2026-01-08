import { SignIn } from "@clerk/clerk-react";
import PageLayout from '@/components/PageLayout';

const Login = () => {
  return (
    <PageLayout showContentOnly>
      <div className="flex flex-col items-center justify-center">
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-surface border-3 border-muted rounded-none shadow-brutal",
              headerTitle: "font-display text-2xl uppercase tracking-brutal text-reading",
              headerSubtitle: "font-ui text-xs uppercase text-muted",
              socialButtonsBlockButton: "rounded-none border-2 border-muted hover:border-active",
              formButtonPrimary: "bg-active rounded-none hover:bg-reading transition-none uppercase font-ui",
              footerActionLink: "text-active hover:underline"
            }
          }}
        />
      </div>
    </PageLayout>
  );
};

export default Login;
