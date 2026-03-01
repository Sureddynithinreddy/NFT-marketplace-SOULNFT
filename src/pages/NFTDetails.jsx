import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { ethers } from "ethers";
import NFTMarketplace from "../abi/NFTMarketplace.json";

const CONTRACT_ADDRESS = "0x9f092F4053EdB03D88E92830863CA9e4F200FbA1";

function NFTDetails() {
  const { id } = useParams();
  const { signer, walletAddress } = useWallet();

  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeNow, setTimeNow] = useState(Date.now());
  const [bidAmount, setBidAmount] = useState("");

  // 🔥 Live Clock
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 Fetch NFT
  useEffect(() => {
    const fetchNFT = async () => {
      try {
        if (!signer) return;

        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          NFTMarketplace,
          signer
        );

        const owner = await contract.ownerOf(id);
        const tokenURI = await contract.tokenURI(id);

        const metadataURL = tokenURI.replace(
          "ipfs://",
          "https://gateway.pinata.cloud/ipfs/"
        );

        const response = await fetch(metadataURL);
        const metadata = await response.json();

        const item = await contract.idToMarketItem(id);

        setNft({
          name: metadata.name,
          description: metadata.description,
          image: metadata.image.replace(
            "ipfs://",
            "https://gateway.pinata.cloud/ipfs/"
          ),
          owner,
          price: ethers.formatEther(item.price),
          sold: item.sold,
          isAuction: item.isAuction,
          highestBid: ethers.formatEther(item.highestBid),
          highestBidder: item.highestBidder,
          endTime: Number(item.auctionEndTime) * 1000,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error loading NFT:", error);
        setLoading(false);
      }
    };

    fetchNFT();
  }, [id, signer]);

  const auctionEnded = nft?.isAuction && timeNow >= nft.endTime;
  const isSeller =
    walletAddress?.toLowerCase() === nft?.owner?.toLowerCase();

  // 🔥 Buy Fixed NFT
  const handleBuy = async () => {
    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        NFTMarketplace,
        signer
      );

      const tx = await contract.buyNFT(id, {
        value: ethers.parseEther(nft.price),
        maxFeePerGas: ethers.parseUnits("120", "gwei"),
        maxPriorityFeePerGas: ethers.parseUnits("60", "gwei"),
      });

      await tx.wait();
      alert("NFT Purchased Successfully!");
      window.location.reload();
    } catch (error) {
      alert(error?.reason || "Transaction failed");
    }
  };

  // 🔥 Place Bid
  const handleBid = async () => {
    try {
      if (!bidAmount || Number(bidAmount) <= 0) {
        alert("Enter valid bid amount");
        return;
      }

      if (!nft.isAuction) {
        alert("This is not an auction NFT");
        return;
      }

      if (auctionEnded) {
        alert("Auction already ended");
        return;
      }

      if (isSeller) {
        alert("Seller cannot bid");
        return;
      }

      if (Number(bidAmount) <= Number(nft.highestBid)) {
        alert("Bid must be higher than current highest bid");
        return;
      }

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        NFTMarketplace,
        signer
      );

      const value = ethers.parseEther(bidAmount);

      await contract.placeBid.staticCall(id, { value });

      const tx = await contract.placeBid(id, {
        value,
        maxFeePerGas: ethers.parseUnits("120", "gwei"),
        maxPriorityFeePerGas: ethers.parseUnits("60", "gwei"),
      });

      await tx.wait();

      alert("Bid placed successfully!");
      window.location.reload();
    } catch (error) {
      alert(error?.reason || error?.shortMessage || "Bid failed");
    }
  };

  // 🔥 Finalize Auction (NEW ADDITION)
  const handleFinalizeAuction = async () => {
    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        NFTMarketplace,
        signer
      );

      const tx = await contract.endAuction(id, {
        maxFeePerGas: ethers.parseUnits("120", "gwei"),
        maxPriorityFeePerGas: ethers.parseUnits("60", "gwei"),
      });

      await tx.wait();

      alert("Auction finalized!");
      window.location.reload();
    } catch (error) {
      alert(error?.reason || "Finalize failed");
    }
  };

  const formatTime = (ms) => {
    if (!ms) return "";
    const diff = ms - timeNow;
    if (diff <= 0) return "Auction Ended";

    const totalSeconds = Math.floor(diff / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading NFT...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkBg text-white py-24 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">

        <div className="rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-glow">
          <img
            src={nft.image}
            alt={nft.name}
            className="h-[500px] w-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">

          <h1 className="text-5xl font-bold mb-6">
            {nft.name}
          </h1>

          <p className="text-gray-400 leading-relaxed mb-8">
            {nft.description || "No description available."}
          </p>

          {nft.isAuction ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">

              <p className="text-gray-400 text-sm">Highest Bid</p>
              <p className="text-3xl font-semibold text-primary mt-2">
                {nft.highestBid || nft.price} MATIC
              </p>

              <p className="text-gray-400 text-sm mt-4">
                Ends In: {formatTime(nft.endTime)}
              </p>

              {!auctionEnded && !isSeller && (
                <>
                  <input
                    type="number"
                    placeholder="Enter bid amount"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full mt-6 px-4 py-2 rounded-xl bg-white/5 border border-white/10"
                  />

                  <button
                    onClick={handleBid}
                    className="w-full mt-4 bg-primary text-black py-4 rounded-2xl font-semibold text-lg"
                  >
                    Place Bid
                  </button>
                </>
              )}

              {auctionEnded && (
                <button
                  onClick={handleFinalizeAuction}
                  className="w-full mt-6 bg-green-500 text-black py-4 rounded-2xl font-semibold text-lg"
                >
                  Finalize Auction
                </button>
              )}

            </div>
          ) : (
            <>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                <p className="text-gray-400 text-sm">Current Price</p>
                <p className="text-3xl font-semibold text-primary mt-2">
                  {nft.price} MATIC
                </p>
              </div>

              {!isSeller && !nft.sold && (
                <button
                  onClick={handleBuy}
                  className="bg-primary text-black py-4 rounded-2xl font-semibold text-lg"
                >
                  Buy Now
                </button>
              )}
            </>
          )}

          <div className="mt-10">
            <p className="text-gray-400 text-sm">Owner</p>
            <p className="text-white mt-1 break-all">
              {nft.owner}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default NFTDetails;