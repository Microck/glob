import PageLayout from '@/components/PageLayout';

const Terms = () => {
  return (
    <PageLayout isCentered={false}>
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-4xl mb-8 tracking-brutal uppercase">Terms of Service</h1>
        
        <div className="space-y-10 font-ui text-reading">
          <section>
            <h2 className="text-xl font-bold mb-4 uppercase tracking-widest border-b-2 border-muted pb-2">1. The Agreement</h2>
            <p className="leading-relaxed">
              By accessing or using glob, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must immediately stop using the service. I operate on a logic-first basis; expectations should match the technical capabilities of the tools provided.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 uppercase tracking-widest border-b-2 border-muted pb-2">2. Usage Rights & Ownership</h2>
            <p className="leading-relaxed mb-4">
              You retain 100% ownership of any 3D models you upload. glob does not claim any intellectual property rights over your geometry or textures.
            </p>
            <p className="leading-relaxed font-bold text-active uppercase">
              Your models. Your pixels. Your responsibility.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 uppercase tracking-widest border-b-2 border-muted pb-2">3. Service Limitations</h2>
            <p className="leading-relaxed mb-4">
              Optimization is a destructive process. Decimation, quantization, and texture compression will alter your model's data. 
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>I am not responsible for broken topology or lost details.</li>
              <li>Always keep local backups of your original models.</li>
              <li>The "approximate" targets in Simple Mode are just that: approximate.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 uppercase tracking-widest border-b-2 border-muted pb-2">4. globber Subscription</h2>
            <p className="leading-relaxed mb-4">
              Subscribing to the <span className="text-active font-bold italic">globber</span> tier grants you increased limits and extended file retention.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Subscriptions are processed via Polar.sh and are subject to their billing terms.</li>
              <li>I reserve the right to modify tier limits based on infrastructure costs.</li>
              <li>Abuse of high-priority queues or storage may result in temporary suspension.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 uppercase tracking-widest border-b-2 border-muted pb-2">5. Disclaimer of Warranty</h2>
            <p className="leading-relaxed bg-surface p-4 border-l-4 border-active italic">
              glob is provided "AS IS", without warranty of any kind, express or implied. I do not guarantee that the service will be uninterrupted or error-free. You use these tools at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 uppercase tracking-widest border-b-2 border-muted pb-2">6. Changes to Terms</h2>
            <p className="leading-relaxed">
              I reserve the right to update these terms at any time. Your continued use of the service after such changes constitutes acceptance of the new terms.
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
};

export default Terms;
