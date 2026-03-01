import { NavLink } from "react-router-dom";
import { FaTwitter, FaGithub, FaDiscord } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-[#00BFFF] border-t border-white/10 mt-10">
      
      <div className="max-w-7xl mx-auto px-6 py-0 grid md:grid-cols-4 gap-4 h-35">

        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            SolNFT
          </h2>
          <p className="text-gray-700 text-sm leading-6">
            A decentralized NFT marketplace built on PolyGon.
            Create, buy, sell and auction NFTs seamlessly.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-gray-700 font-semibold mb-2">
            Navigation
          </h3>
          <div className="flex flex-col gap-1 text-gray-700 text-sm">
            <NavLink to="/" className="hover:text-black transition">
              Home
            </NavLink>
            <NavLink to="/marketplace" className="hover:text-gray-900 transition">
              Marketplace
            </NavLink>
            <NavLink to="/my-nfts" className="hover:text-gray-900 transition">
              My NFTs
            </NavLink>
            <NavLink to="/create" className="hover:text-gray-900 transition">
              Create NFT
            </NavLink>
          </div>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-gray-700 font-semibold mb-2">
            Resources
          </h3>
          <div className="flex flex-col gap-1 text-gray-700 text-sm">
            <a href="#" className="hover:text-gray-900 transition">
              Docs
            </a>
            <a href="#" className="hover:text-gray-900 transition">
              Support
            </a>
            <a href="#" className="hover:text-gray-900 transition">
              Terms
            </a>
            <a href="#" className="hover:text-gray-900 transition">
              Privacy
            </a>
          </div>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-gray-700 font-semibold mb-4">
            Community
          </h3>
          <div className="flex gap-6 text-2xl text-gray-700">
            <a href="#" className="hover:text-gray-900 transition">
              <FaTwitter />
            </a>
            <a href="#" className="hover:text-gray-900 transition">
              <FaGithub />
            </a>
            <a href="#" className="hover:text-gray-900 transition">
              <FaDiscord />
            </a>
          </div>
        </div>

      </div>

      {/* Bottom */}
      <div className="border-t border-white/10 py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} SolNFT. All rights reserved.
      </div>

    </footer>
  );
}

export default Footer;