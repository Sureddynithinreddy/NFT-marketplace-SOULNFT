import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Link } from "react-router-dom";
import NFTMarketplace from "../abi/NFTMarketplace.json";

const CONTRACT_ADDRESS = "0x9f092F4053EdB03D88E92830863CA9e4F200FbA1";
const AMOY_RPC = "https://rpc-amoy.polygon.technology";

function Preview() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPreviewNFTs = async () => {
    try {
      setLoading(true);

      const provider = new ethers.JsonRpcProvider(AMOY_RPC);

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        NFTMarketplace,
        provider
      );

      const totalMinted = await contract.getCurrentTokenId();
      const previewNFTs = [];

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

            previewNFTs.push({
              id: tokenId,
              name: metadata.name,
              image: metadata.image.replace(
                "ipfs://",
                "https://ipfs.io/ipfs/"
              ),
              price: ethers.formatEther(item.price),
            });
          }

          if (previewNFTs.length === 4) break;

        } catch (err) {
          console.log("Skipping token:", tokenId);
        }
      }

      setNfts(previewNFTs);
      setLoading(false);

    } catch (error) {
      console.error("Preview fetch error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreviewNFTs();
  }, []);

  return (
    <section className="relative py-40 px-10 overflow-hidden">

      {/* Subtle Background Glow */}
      <div className="absolute w-[700px] h-[700px] bg-primary opacity-10 blur-[200px] rounded-full left-1/2 -translate-x-1/2 -z-10"></div>

      <h2 className="text-5xl font-bold text-center mb-24">
        Trending <span className="text-primary">NFTs</span>
      </h2>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">

        {/* Loading */}
        {loading && [...Array(4)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-3xl 
                       bg-white/5 backdrop-blur-xl 
                       border border-white/10 
                       overflow-hidden p-6"
          >
            <div className="h-64 bg-gray-700 rounded-2xl mb-6"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}

        {/* NFT Cards */}
        {!loading && nfts.map((nft) => (
          <div
            key={nft.id}
            className="group relative rounded-3xl 
                       bg-white/5 backdrop-blur-xl 
                       border border-white/10 
                       overflow-hidden 
                       transition duration-500 
                       hover:-translate-y-4 
                       hover:border-primary 
                       hover:shadow-xl hover:shadow-primary/20"
          >
            <Link to={`/nft/${nft.id}`}>
              <div className="h-64 overflow-hidden">
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </Link>

            <div className="p-6">
              <h3 className="font-semibold text-lg group-hover:text-primary transition duration-300">
                {nft.name}
              </h3>

              <div className="flex justify-between items-center mt-4">
                <p className="text-gray-400 text-sm">Current Price</p>
                <p className="text-primary font-semibold">
                  {nft.price} MATIC
                </p>
              </div>
            </div>
          </div>
        ))}

        {!loading && nfts.length === 0 && (
          <div className="col-span-full text-center text-gray-400">
            No NFTs Listed Yet
          </div>
        )}

      </div>

      {/* 🔥 SEE ALL BUTTON */}
      {!loading && nfts.length > 0 && (
        <div className="text-center mt-16">
          <Link
            to="/marketplace"
            className="text-red-500 text-lg font-semibold hover:underline hover:text-red-400 transition"
          >
            See All →
          </Link>
        </div>
      )}

    </section>
  );
}

export default Preview;