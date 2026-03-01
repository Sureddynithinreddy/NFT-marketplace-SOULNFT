import { NavLink } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import logo from "../assets/logo.png";

function Navbar() {
  const {
    connected,
    walletAddress,
    connectWallet,
    disconnectWallet,
  } = useWallet();

  return (
    <div
      className="flex justify-between items-center px-10 py-5 
                 bg-darkBg/80 backdrop-blur-md 
                 border-b border-white/10 sticky top-0 z-50"
    >

      {/* Logo (Clickable → Home) */}
      <NavLink
  to="/"
  className="flex items-center gap-2 text-2xl font-bold text-primary tracking-wide hover:opacity-80 transition"
>
  <img
    src={logo}
    alt="SoulNFT Logo"
    className="w-8 h-8 object-contain"
  />
  <span>SoulNFT's</span>
</NavLink>

      {/* Menu */}
      <div className="flex gap-8 items-center text-gray-300 font-medium">

        <NavLink
          to="/"
          className={({ isActive }) =>
            `transition duration-300 hover:text-primary ${
              isActive ? "text-primary" : ""
            }`
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/marketplace"
          className={({ isActive }) =>
            `transition duration-300 hover:text-primary ${
              isActive ? "text-primary" : ""
            }`
          }
        >
          Marketplace
        </NavLink>

        <NavLink
          to="/my-nfts"
          className={({ isActive }) =>
            `transition duration-300 hover:text-primary ${
              isActive ? "text-primary" : ""
            }`
          }
        >
          My NFTs
        </NavLink>

        <NavLink
          to="/create"
          className={({ isActive }) =>
            `transition duration-300 hover:text-primary ${
              isActive ? "text-primary" : ""
            }`
          }
        >
          Create
        </NavLink>

        {/* Wallet Section */}
        {connected ? (
          <div className="flex items-center gap-4">

            {/* Wallet Address */}
            <span className="text-primary text-sm bg-white/5 px-4 py-2 rounded-xl border border-white/10">
              {walletAddress.slice(0, 4)}...
              {walletAddress.slice(-4)}
            </span>

            {/* Disconnect */}
            <button
              onClick={disconnectWallet}
              className="w-full border border-red-500 px-4 py-2 rounded-xl 
                         hover:bg-red-800 hover:text-black transition"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className="bg-primary text-black px-6 py-2.5 rounded-xl 
                       font-semibold 
                       hover:bg-primaryDark 
                       hover:scale-105 
                       transition duration-300 
                       shadow-glow"
          >
            Connect Wallet
          </button>
        )}

      </div>
    </div>
  );
}

export default Navbar;
