import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import NFTMarketplace from "../abi/NFTMarketplace.json";

const CONTRACT_ADDRESS = "0x9f092F4053EdB03D88E92830863CA9e4F200FbA1";
const AMOY_CHAIN_ID = 80002; // Polygon Amoy

function Marketplace() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("all");
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState(null);
  const [buyingId, setBuyingId] = useState(null);

  // 🔥 Detect wallet + force connect
  useEffect(() => {
    const loadWallet = async () => {
      try {
        if (!window.ethereum) return;

        await window.ethereum.request({ method: "eth_requestAccounts" });

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address.toLowerCase());

        const network = await provider.getNetwork();
        console.log("Connected Network ChainId:", Number(network.chainId));

        if (Number(network.chainId) !== AMOY_CHAIN_ID) {
          alert("Please switch to Polygon Amoy Network");
        }

      } catch (err) {
        console.log("Wallet connection failed:", err);
      }
    };

    loadWallet();
  }, []);

  // 🔥 Fetch ALL LISTED NFTs
  const fetchMarketplaceNFTs = async () => {
    try {
      if (!window.ethereum) return;

      setLoading(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        NFTMarketplace,
        provider
      );

      const totalMinted = await contract.getCurrentTokenId();
      const listedNFTs = [];

      for (let tokenId = 1; tokenId <= Number(totalMinted); tokenId++) {
        try {
          const item = await contract.idToMarketItem(tokenId);

          if (item.listed && !item.sold) {
            const tokenURI = await contract.tokenURI(tokenId);

            const metadataURL = tokenURI.replace(
              "ipfs://",
              "https://ipfs.io/ipfs/"
            );

            const response = await fetch(metadataURL);
            const metadata = await response.json();

            listedNFTs.push({
              id: tokenId,
              name: metadata.name,
              image: metadata.image.replace(
                "ipfs://",
                "https://ipfs.io/ipfs/"
              ),
              category: metadata.category || "General",

              // 🔥 IMPORTANT CHANGE
              type: item.isAuction ? "auction" : "fixed",

              price: ethers.formatEther(item.price),
              priceWei: item.price,
              seller: item.seller.toLowerCase(),
            });
          }
        } catch (err) {
          console.log("Skipping token:", tokenId);
        }
      }

      console.log("Final Listed NFTs:", listedNFTs);

      setNfts(listedNFTs);
      setLoading(false);
    } catch (error) {
      console.error("Marketplace fetch error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplaceNFTs();
  }, []);

  // 🔥 FINAL BUY FUNCTION (Polygon Amoy Stable)
  const handleBuy = async (nft) => {
    try {
      if (!window.ethereum) {
        alert("Install MetaMask");
        return;
      }

      setBuyingId(nft.id);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const network = await provider.getNetwork();
      if (Number(network.chainId) !== AMOY_CHAIN_ID) {
        alert("Switch to Polygon Amoy Network");
        setBuyingId(null);
        return;
      }

      const buyerAddress = (await signer.getAddress()).toLowerCase();

      if (buyerAddress === nft.seller) {
        alert("You cannot buy your own NFT");
        setBuyingId(null);
        return;
      }

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        NFTMarketplace,
        signer
      );

      const item = await contract.idToMarketItem(nft.id);

      console.log("ON-CHAIN ITEM:", {
        tokenId: item.tokenId.toString(),
        seller: item.seller,
        price: item.price.toString(),
        listed: item.listed,
        sold: item.sold,
      });

      if (!item.listed || item.sold) {
        alert("NFT is no longer available");
        fetchMarketplaceNFTs();
        setBuyingId(null);
        return;
      }

      const owner = await contract.ownerOf(nft.id);
      console.log("CURRENT OWNER:", owner);

      if (owner.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) {
        alert("NFT not in marketplace escrow");
        setBuyingId(null);
        return;
      }

      console.log("Buying with value (wei):", item.price.toString());

      // ✅ Polygon Amoy Legacy Gas (Stable Fix)
      const gasPrice = ethers.parseUnits("40", "gwei");

      const tx = await contract.buyNFT(nft.id, {
        value: item.price,
        gasPrice: gasPrice,
      });

      console.log("TX SENT:", tx.hash);

      const receipt = await tx.wait();

      console.log("TX CONFIRMED:", receipt);

      alert("NFT Purchased Successfully!");

      fetchMarketplaceNFTs();
      setBuyingId(null);

    } catch (error) {

      console.log("======== FULL ERROR START ========");
      console.log("Error object:", error);
      console.log("Message:", error?.message);
      console.log("Reason:", error?.reason);
      console.log("Code:", error?.code);
      console.log("Data:", error?.data);
      console.log("======== FULL ERROR END ========");

      if (error?.code === 4001) {
        alert("Transaction rejected by user");
      } else {
        alert(error?.reason || error?.message || "Purchase failed");
      }

      setBuyingId(null);
    }
  };

  const filteredNFTs = nfts.filter((nft) => {
    const matchesSearch = nft.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || nft.category === category;

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "fixed" && nft.type === "fixed") ||
      (activeTab === "auction" && nft.type === "auction");

    return matchesSearch && matchesCategory && matchesTab;
  });

  return (
    <div className="min-h-screen bg-darkBg text-white py-24 px-6">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold">
          Explore <span className="text-primary">Marketplace</span>
        </h1>
      </div>

      <div className="flex justify-center gap-6 mb-12">
        {["all", "fixed", "auction"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl transition ${activeTab === tab
              ? "bg-primary text-black"
              : "border border-white/20"
              }`}
          >
            {tab === "all"
              ? "All"
              : tab === "fixed"
                ? "Fixed Price"
                : "Auction"}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 max-w-6xl mx-auto">
        {loading &&
          [...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <div className="h-56 bg-gray-700 rounded-2xl mb-6"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}

        {!loading &&
          filteredNFTs.map((nft) => (
            <div key={nft.id} className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden transition duration-500 hover:-translate-y-4 hover:border-primary hover:shadow-glow p-6">
              <Link to={`/nft/${nft.id}`}>
                <div className="h-56 overflow-hidden rounded-2xl mb-6">
                  <img src={nft.image} alt={nft.name} className="h-full w-full object-cover" />
                </div>
              </Link>

              <h3 className="font-semibold text-lg">{nft.name}</h3>
              <p className="text-gray-400 text-sm mt-2">{nft.category}</p>

              <div className="mt-4">
                <p className="text-primary font-semibold">{nft.price} MATIC</p>
              </div>

              <p className="text-gray-500 text-xs mt-2">
                Seller: {nft.seller.slice(0, 6)}...
              </p>

              {nft.type === "fixed" && (
                <button
                  onClick={() => handleBuy(nft)}
                  disabled={buyingId === nft.id}
                  className="w-full mt-4 bg-primary text-black py-2 rounded-xl font-semibold hover:bg-primaryDark transition disabled:opacity-50"
                >
                  {buyingId === nft.id ? "Processing..." : "Buy Now"}
                </button>
              )}
              {nft.type === "auction" && (
                <div className="w-full mt-4 text-center text-yellow-400 font-semibold">
                  Auction Active
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default Marketplace;