import PageLayout from '@/components/PageLayout';

const PrivacyPolicy = () => {
  return (
    <PageLayout isCentered={false}>
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-4xl mb-12 tracking-tight uppercase border-b-3 border-active pb-4 inline-block">Privacy</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 font-ui text-reading">
          <section>
            <h2 className="text-sm font-bold mb-3 uppercase tracking-widest text-active">1. General Principles</h2>
            <p className="leading-relaxed text-sm">
              glob is built on the principle of minimal data collection. I don't want your data; I only want to optimize your 3D models. Your privacy is paramount, and my policy is simple: if I don't need it, I don't collect it.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold mb-3 uppercase tracking-widest text-active">2. Model Processing</h2>
            <p className="leading-relaxed text-sm mb-4">
              When you upload a file for optimization, it is processed on my secure backend. I use temporary storage to hold the files during the transition:
            </p>
            <ul className="space-y-2 ml-4 text-xs font-bold uppercase">
              <li><span className="text-active">Free Tier:</span> Deleted after 10 minutes (Extended if shared).</li>
              <li><span className="text-active">globber Tier:</span> Deleted after 48 hours.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-bold mb-3 uppercase tracking-widest text-active">3. Authentication</h2>
            <p className="leading-relaxed text-sm">
              I use <span className="font-bold">Clerk</span> for authentication and <span className="font-bold">Supabase</span> for storing user profile metadata. I only store what is necessary to manage your subscription tier and show your history. I never sell your information.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold mb-3 uppercase tracking-widest text-active">4. Payments</h2>
            <p className="leading-relaxed text-sm">
              Payments are handled via <span className="font-bold text-active">Polar.sh</span>. I never see or store your credit card information. Polar handles the secure transaction and global tax compliance entirely.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold mb-3 uppercase tracking-widest text-active">5. Third Parties</h2>
            <p className="leading-relaxed text-sm">
              I use <span className="font-bold">Cloudflare</span> for network protection. Cloudflare may process basic technical information (like IP addresses) to ensure the security and availability of my services.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold mb-3 uppercase tracking-widest text-active">6. Contact</h2>
            <p className="leading-relaxed text-sm">
              For any inquiries, reach out via the GitHub repository or contact me directly at <span className="text-active select-all font-bold">contact@micr.dev</span>.
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
};

export default PrivacyPolicy;
