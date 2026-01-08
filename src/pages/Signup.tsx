import { SignUp } from "@clerk/clerk-react";
import PageLayout from '@/components/PageLayout';

const Signup = () => {
  return (
    <PageLayout showContentOnly>
      <div className="flex flex-col items-center justify-center">
        <SignUp />
      </div>
    </PageLayout>
  );
};

export default Signup;
