import PageLayout from '@/components/PageLayout';

const Terms = () => {
  return (
    <PageLayout isCentered={false}>
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-4xl mb-12 tracking-tight uppercase border-b-3 border-active pb-4 inline-block">Terms</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 font-ui text-reading">
          <section>
            <h2 className="text-sm font-bold mb-3 uppercase tracking-widest text-active">1. The Agreement</h2>
            <p className="leading-relaxed text-sm">
              By using glob, you agree to these Terms. If you do not agree, stop using the service. I operate on a logic-first basis; expectations should match the technical capabilities of the tools provided.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold mb-3 uppercase tracking-widest text-active">2. Ownership</h2>
            <p className="leading-relaxed text-sm mb-4">
              You retain 100% ownership of your models. glob does not claim any rights over your geometry.
            </p>
            <p className="text-xs font-bold text-active uppercase">
              Your models. Your polygons. Your responsibility.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold mb-3 uppercase tracking-widest text-active">3. Limitations</h2>
            <p className="leading-relaxed text-sm mb-4">
              Optimization is destructive. Decimation and compression will alter your model's data. 
            </p>
            <ul className="space-y-1 text-xs font-bold uppercase opacity-80">
              <li>• Not responsible for broken topology.</li>
              <li>• Keep local backups of original files.</li>
              <li>• Simple Mode targets are approximate.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-bold mb-3 uppercase tracking-widest text-active">4. globber Tier</h2>
            <p className="leading-relaxed text-sm mb-4">
              The <span className="text-active font-bold italic">globber</span> tier grants increased limits.
            </p>
            <ul className="space-y-1 text-xs font-bold uppercase opacity-80">
              <li>• Processed via Polar.sh.</li>
              <li>• I reserve the right to modify limits.</li>
              <li>• Abuse may result in suspension.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-bold mb-3 uppercase tracking-widest text-active">5. Bulk Processing Limits</h2>
            <p className="leading-relaxed text-sm mb-4">
              Bulk conversion is limited to 10 files per batch to ensure fair resource usage.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold mb-3 uppercase tracking-widest text-active">6. Storage Quota</h2>
            <p className="leading-relaxed text-sm mb-4">
              Globber tier includes 1GB of total storage for optimized assets. Oldest files may be removed if quota is exceeded.
            </p>
          </section>

          <section className="md:col-span-2">
            <h2 className="text-sm font-bold mb-3 uppercase tracking-widest text-active">7. Disclaimer</h2>
            <p className="leading-relaxed text-xs bg-surface p-4 border-3 border-muted italic">
              glob is provided "AS IS", without warranty of any kind. You use these tools at your own risk.
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
};

export default Terms;
