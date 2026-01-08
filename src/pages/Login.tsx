import { SignIn } from "@clerk/clerk-react";
import PageLayout from '@/components/PageLayout';

const Login = () => {
  return (
    <PageLayout showContentOnly>
      <div className="flex flex-col items-center justify-center">
        <SignIn />
      </div>
    </PageLayout>
  );
};

export default Login;
