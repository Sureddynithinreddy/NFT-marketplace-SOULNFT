function Features() {
  return (
    <section className="relative py-30 px-10 overflow-hidden">

      {/* Background Glow */}
      <div className="absolute w-[600px] h-[600px] bg-primary opacity-10 blur-[180px] rounded-full left-1/2 -translate-x-1/2 top-10 -z-10"></div>

      <h2 className="text-5xl font-bold text-center mb-24 leading-tight">
        Why Choose <span className="text-primary">SolNFT</span>
      </h2>

      <div className="grid md:grid-cols-3 gap-12">

        {[
          {
            title: "⚡ Lightning Fast",
            desc: "Experience instant NFT minting and transfers powered by Solana’s high-speed network."
          },
          {
            title: "💸 Ultra Low Fees",
            desc: "Trade and create NFTs without worrying about expensive gas fees."
          },
          {
            title: "🔐 Secure & Non-Custodial",
            desc: "Maintain full ownership and control over your digital assets at all times."
          }
        ].map((item, i) => (
          <div
            key={i}
            className="group p-10 rounded-3xl 
                       backdrop-blur-xl bg-white/5 
                       border border-white/10 
                       hover:border-primary 
                       hover:shadow-lg hover:shadow-primary/20
                       transition duration-500 
                       hover:-translate-y-3"
          >
            <h3 className="text-2xl font-semibold mb-5 group-hover:text-primary transition duration-300">
              {item.title}
            </h3>

            <p className="text-gray-400 leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}

      </div>
    </section>
  );
}

export default Features;
