import PageLayout from '@/components/PageLayout';

const PrivacyPolicy = () => {
  return (
    <PageLayout isCentered={false}>
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-4xl mb-8 tracking-brutal uppercase">Privacy Policy</h1>
        
        <div className="space-y-10 font-ui text-reading">
          <section>
            <h2 className="text-xl font-bold mb-4 uppercase tracking-widest border-b-2 border-muted pb-2">1. General Principles</h2>
            <p className="leading-relaxed">
              glob is built on the principle of minimal data collection. I don't want your data; I only want to optimize your 3D models. Your privacy is paramount, and my policy is simple: if I don't need it, I don't collect it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 uppercase tracking-widest border-b-2 border-muted pb-2">2. Model Processing</h2>
            <p className="leading-relaxed mb-4">
              When you upload a file for optimization, it is processed on my secure backend. I use temporary storage to hold the files during the transition:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><span className="text-active font-bold">Free Tier:</span> Files are purged permanently after 1 hour.</li>
              <li><span className="text-active font-bold">globber Tier:</span> Files are purged permanently after 48 hours.</li>
            </ul>
            <p className="mt-4 italic text-muted text-sm uppercase tracking-tighter">
              I do not keep backups or logs of your geometry once deleted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 uppercase tracking-widest border-b-2 border-muted pb-2">3. Authentication & Account</h2>
            <p className="leading-relaxed">
              I use <span className="font-bold">Memberstack</span> for authentication and <span className="font-bold">Supabase</span> for storing user profile metadata. I only store what is necessary to manage your subscription tier and show your recent optimization history. I do not sell or share your account information with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 uppercase tracking-widest border-b-2 border-muted pb-2">4. Payments</h2>
            <p className="leading-relaxed">
              Payments are handled via <span className="font-bold text-active">Polar.sh</span>. I never see or store your credit card information. Polar handles the secure transaction and global tax compliance, simply notifying my system when a subscription is active.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 uppercase tracking-widest border-b-2 border-muted pb-2">5. Third Parties</h2>
            <p className="leading-relaxed">
              I use <span className="font-bold">Cloudflare</span> for network protection and DDoS mitigation. Cloudflare may process basic technical information (like IP addresses) to ensure the security and availability of my services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 uppercase tracking-widest border-b-2 border-muted pb-2">6. Contact</h2>
            <p className="leading-relaxed">
              For any privacy-related inquiries, reach out via the GitHub repository or contact me directly at <span className="text-active select-all">contact@micr.dev</span>.
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
};

export default PrivacyPolicy;
