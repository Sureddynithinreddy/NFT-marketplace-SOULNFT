import { Link } from "react-router-dom";
function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center py-40 px-6 overflow-hidden">

      {/* Soft Glow Background */}
      <div className="absolute w-[700px] h-[700px] bg-primary opacity-25 blur-[180px] rounded-full -z-10"></div>

      <h1 className="text-6xl md:text-7xl font-extrabold leading-tight tracking-tight">
        Discover, Collect & Sell
        <span className="block mt-6 bg-gradient-to-r from-primary to-primaryDark bg-clip-text text-transparent">
          NFTs
        </span>
      </h1>

      <p className="text-gray-400 mt-10 max-w-2xl text-lg leading-relaxed">
        The next-generation NFT marketplace built for speed,
        scalability and seamless digital ownership on PolyGon.
      </p>

      <div className="mt-14 flex flex-col sm:flex-row gap-6">

        {/* Primary Button */}
        <Link to="/marketplace">
          <button
            className="bg-primary text-black px-12 py-4 rounded-2xl 
               font-semibold text-lg
               hover:bg-primaryDark 
               hover:scale-105 
               transition duration-300
               shadow-xl shadow-primary/30"
          >
            Explore Marketplace
          </button>
        </Link>

        {/* Secondary Button */}
        <Link to="/create">
        <button className="border border-primary px-12 py-4 rounded-2xl 
                           hover:bg-primary hover:text-black 
                           transition duration-300">
          Create NFT
        </button>
        </Link>
      </div>
      

    </section>
  );
}

export default Hero;
