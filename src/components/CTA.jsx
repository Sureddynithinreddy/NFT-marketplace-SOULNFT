function CTA() {
  return (
    <section className="relative py-30 text-center overflow-hidden">

      {/* Soft Glow Background */}
      <div className="absolute w-[500px] h-[500px] bg-primary opacity-20 blur-[160px] rounded-full left-1/2 -translate-x-1/2 -z-10"></div>

      <h2 className="text-5xl font-bold leading-tight">
        Ready to dive into the
        <span className="block text-primary mt-4">
          NFT world?
        </span>
      </h2>

      <p className="text-gray-400 mt-6 max-w-xl mx-auto">
        Join the next generation NFT marketplace built on Solana.
        Create, explore and trade seamlessly.
      </p>

      <button
        className="mt-12 bg-primary text-black px-12 py-4 rounded-2xl 
                   font-semibold text-lg 
                   hover:bg-primaryDark 
                   hover:scale-110 
                   transition duration-300 
                   shadow-xl shadow-primary/30"
      >
        Get Started
      </button>

    </section>
  );
}

export default CTA;
