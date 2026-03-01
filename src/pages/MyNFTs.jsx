import { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { ethers } from "ethers";
import NFTMarketplace from "../abi/NFTMarketplace.json";
import { Link } from "react-router-dom";


const now = Date.now();
const CONTRACT_ADDRESS = "0x9f092F4053EdB03D88E92830863CA9e4F200FbA1";

function MyNFTs() {
  const { signer, walletAddress, connected } = useWallet();

  const [activeTab, setActiveTab] = useState("owned");
  const [nfts, setNfts] = useState([]);
  const [sellType, setSellType] = useState("fixed");
  const [sellPrice, setSellPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [activeNFT, setActiveNFT] = useState(null);
  const [bidAmounts, setBidAmounts] = useState({});
  const [timeNow, setTimeNow] = useState(Date.now());

  // 🔥 FETCH MINTED NFTs FROM BLOCKCHAIN
  useEffect(() => {
    if (!connected || !signer || !walletAddress) return;

    let isMounted = true;

    const fetchOwnedNFTs = async () => {
      try {
        console.log("Wallet Connected:", walletAddress);

        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          NFTMarketplace,
          signer
        );

        const totalMinted = await contract.getCurrentTokenId();
        console.log("Total Minted:", totalMinted.toString());

        const fetchedNFTs = [];

        for (let tokenId = 1; tokenId <= Number(totalMinted); tokenId++) {
          try {
            console.log("Checking token:", tokenId);

            const owner = await contract.ownerOf(tokenId);
            console.log(`Token ${tokenId} owner:`, owner);

            const item = await contract.idToMarketItem(tokenId);

            const isOwner =
              owner.toLowerCase() === walletAddress.toLowerCase();

            const isSeller =
              item.seller.toLowerCase() === walletAddress.toLowerCase();

            if (
              (isOwner && !item.listed) || // Owned NFTs
              (isSeller && item.listed)    // Listed NFTs
            ) {
              console.log("MATCH FOUND for token:", tokenId);

              const tokenURI = await contract.tokenURI(tokenId);

              const metadataURL = tokenURI.replace(
                "ipfs://",
                "https://ipfs.io/ipfs/"
              );

              console.log("Metadata URL:", metadataURL);

              const response = await fetch(metadataURL);
              const metadata = await response.json();

              const item = await contract.idToMarketItem(tokenId);

              const isAuction = item.isAuction;

              fetchedNFTs.push({
                id: tokenId,
                name: metadata.name,
                image: metadata.image.replace(
                  "ipfs://",
                  "https://ipfs.io/ipfs/"
                ),

                price: ethers.formatEther(item.price),
                listed: item.listed,
                owner: owner.toLowerCase(),
                seller: item.seller.toLowerCase(),

                // 🔥 Auction fields
                type: isAuction ? "auction" : "fixed",
                highestBid: isAuction
                  ? ethers.formatEther(item.highestBid)
                  : null,
                highestBidder: isAuction
                  ? item.highestBidder
                  : null,
                endTime: isAuction
                  ? Number(item.auctionEndTime) * 1000
                  : null,
                ended: isAuction
                  ? Number(item.auctionEndTime) * 1000 <= Date.now()
                  : false,
              });
            }
          } catch (err) {
            console.log("Skipping token:", tokenId);
          }
        }

        console.log("Final Fetched NFTs:", fetchedNFTs);

        if (isMounted) {
          setNfts(fetchedNFTs);
        }

      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    //fetchOwnedNFTs();

    const interval = setInterval(() => {
      fetchOwnedNFTs();
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };

  }, [connected, signer, walletAddress]);




  // Live clock
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-close auctions
  useEffect(() => {
    setNfts((prev) =>
      prev.map((nft) =>
        nft.type === "auction" &&
          nft.listed &&
          !nft.ended &&
          nft.endTime - timeNow <= 0
          ? { ...nft, ended: true }
          : nft
      )
    );
  }, [timeNow]);

  const formatTime = (ms) => {
    if (ms <= 0) return "Ended";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const owned = nfts.filter(
    (nft) => !nft.listed && nft.owner === walletAddress?.toLowerCase()
  );

  const listed = nfts.filter(
    (nft) => nft.listed && nft.seller === walletAddress?.toLowerCase()
  );
  const currentList = activeTab === "owned" ? owned : listed;

  // 🔥 LIST NFT (On-Chain)
  const handleList = async (id) => {
    try {
      if (!sellPrice || Number(sellPrice) <= 0) {
        alert("Enter valid price");
        return;
      }

      if (!signer) {
        alert("Wallet not connected");
        return;
      }

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        NFTMarketplace,
        signer
      );

      const priceInWei = ethers.parseEther(sellPrice);

      // 🔥 Polygon Amoy requires higher EIP-1559 gas
      let tx;

      if (sellType === "fixed") {

        tx = await contract.listNFT(id, priceInWei, {
          maxFeePerGas: ethers.parseUnits("120", "gwei"),
          maxPriorityFeePerGas: ethers.parseUnits("60", "gwei"),
        });

      } else {

        if (!duration || Number(duration) <= 0) {
          alert("Enter auction duration");
          return;
        }

        const durationInSeconds = Number(duration) * 60;

        tx = await contract.listAuctionNFT(
          id,
          priceInWei,
          durationInSeconds,
          {
            maxFeePerGas: ethers.parseUnits("120", "gwei"),
            maxPriorityFeePerGas: ethers.parseUnits("60", "gwei"),
          }
        );
      }

      await tx.wait();

     // await tx.wait();

      alert("NFT Listed Successfully!");

      setActiveNFT(null);
      setSellPrice("");
      setDuration("");

    } catch (error) {
      console.error("List error:", error);
      alert("Listing failed");
    }
  };


  // 🔥 UNLIST NFT (On-Chain)
  const handleUnlist = async (id) => {
    try {
      if (!signer) {
        alert("Wallet not connected");
        return;
      }

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        NFTMarketplace,
        signer
      );

      const provider = signer.provider;

      // 🔥 Get current network fee data
      const feeData = await provider.getFeeData();

      // Force minimum required on Amoy
      const tx = await contract.unlistNFT(id, {
        maxFeePerGas: ethers.parseUnits("120", "gwei"),
        maxPriorityFeePerGas: ethers.parseUnits("60", "gwei"),
      });

      await tx.wait();

      alert("NFT Unlisted Successfully!");

    } catch (error) {
      console.error("Unlist error:", error);
      alert("Unlisting failed");
    }
  };
  const handleBidChange = (id, value) => {
    setBidAmounts((prev) => ({
      ...prev,
      [id]: value,
    }));
  };
  const handleBid = async (id, nft) => {
  try {
    if (!bidAmounts[id] || Number(bidAmounts[id]) <= 0) {
      alert("Enter valid bid amount");
      return;
    }

    if (nft.ended) {
      alert("Auction ended");
      return;
    }

    if (walletAddress.toLowerCase() === nft.seller) {
      alert("Seller cannot bid");
      return;
    }

    if (Number(bidAmounts[id]) <= Number(nft.highestBid)) {
      alert("Bid must be higher than highest bid");
      return;
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      NFTMarketplace,
      signer
    );

    const tx = await contract.placeBid(id, {
      value: ethers.parseEther(bidAmounts[id]),
      maxFeePerGas: ethers.parseUnits("120", "gwei"),
      maxPriorityFeePerGas: ethers.parseUnits("60", "gwei"),
    });

    await tx.wait();

    alert("Bid placed successfully!");

  } catch (err) {
    console.error("Bid error:", err);
    alert(err?.reason || "Bid failed");
  }
};



  return (
    <div className="min-h-screen bg-darkBg text-white py-24 px-6">

      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold">
          My <span className="text-primary">NFTs</span>
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-8 mb-16">
        <button
          onClick={() => setActiveTab("owned")}
          className={`px-6 py-2 rounded-xl transition ${activeTab === "owned"
            ? "bg-primary text-black"
            : "border border-white/20"
            }`}
        >
          Owned
        </button>

        <button
          onClick={() => setActiveTab("listed")}
          className={`px-6 py-2 rounded-xl transition ${activeTab === "listed"
            ? "bg-primary text-black"
            : "border border-white/20"
            }`}
        >
          Listed
        </button>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 max-w-6xl mx-auto">


        {currentList.map((nft) => (
          <div
            key={nft.id}
            className="group bg-white/5 backdrop-blur-xl 
               border border-white/10 
               rounded-3xl overflow-hidden 
               transition duration-500 
               hover:-translate-y-4 
               hover:border-primary 
               hover:shadow-glow p-6"
          >

            <Link to={`/nft/${nft.id}`}>
              <div className="h-56 bg-gradient-to-br from-gray-800 to-gray-900 
                  flex items-center justify-center 
                  text-gray-500 text-sm mb-6 rounded-2xl overflow-hidden">


                {nft.image ? (
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="h-full w-full object-cover rounded-2xl"
                  />
                ) : (
                  nft.name
                )}
              </div>
            </Link>


            <h3 className="text-xl font-semibold mb-4">
              {nft.name}
            </h3>


            {/* LISTED INFO */}
            {nft.listed && (
              <div className="mb-4">
                <p className="text-gray-400 text-sm">
                  {nft.type === "auction"
                    ? "Auction"
                    : "Fixed Price"}
                </p>

                {nft.type === "auction" ? (
                  <>
                    <p className="text-primary text-lg font-semibold">
                      Highest Bid: {nft.highestBid} POLY
                    </p>
                    <p className="text-gray-400 text-sm">
                      Bidder: {nft.highestBidder}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Ends In:{" "}
                      {formatTime(nft.endTime - timeNow)}
                    </p>

                    {nft.ended && (
                      <p className="text-green-400 text-sm font-semibold mt-2">
                        🏆 Winner: {nft.highestBidder}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-primary text-lg font-semibold">
                    {nft.price} POLY
                  </p>
                )}
              </div>
            )}

            {/* ACTIONS */}
            {activeTab === "owned" ? (
              <>
                {activeNFT === nft.id ? (
                  <>
                    <select
                      value={sellType}
                      onChange={(e) =>
                        setSellType(e.target.value)
                      }
                      className="w-full mb-4 px-4 py-2 rounded-xl 
                                 bg-white/5 border border-white/10"
                    >
                      <option value="fixed">Fixed Price</option>
                      <option value="auction">Auction</option>
                    </select>

                    <input
                      type="number"
                      placeholder="Enter price"
                      value={sellPrice}
                      onChange={(e) =>
                        setSellPrice(e.target.value)
                      }
                      className="w-full mb-4 px-4 py-2 rounded-xl 
                                 bg-white/5 border border-white/10"
                    />

                    {sellType === "auction" && (
                      <input
                        type="number"
                        placeholder="Duration (minutes)"
                        value={duration}
                        onChange={(e) =>
                          setDuration(e.target.value)
                        }
                        className="w-full mb-4 px-4 py-2 rounded-xl 
                                   bg-white/5 border border-white/10"
                      />
                    )}

                    <button
                      onClick={() => handleList(nft.id)}
                      className="w-full bg-primary text-black py-2 rounded-xl 
                                 font-semibold hover:bg-primaryDark transition"
                    >
                      Confirm
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() =>
                      setActiveNFT(nft.id)
                    }
                    className="w-full bg-primary text-black py-2 rounded-xl 
                               font-semibold hover:bg-primaryDark transition"
                  >
                    Sell NFT
                  </button>
                )}
              </>
            ) : (
              <>
                {nft.type === "auction" && !nft.ended && (
                  <>
                    <input
                      type="number"
                      placeholder="Enter bid amount"
                      value={bidAmounts[nft.id] || ""}
                      onChange={(e) =>
                        handleBidChange(
                          nft.id,
                          e.target.value
                        )
                      }
                      className="w-full mb-4 px-4 py-2 rounded-xl 
                                 bg-white/5 border border-white/10"
                    />

                    <button
                      onClick={() => handleBid(nft.id, nft)}
                      className="w-full bg-primary text-black py-2 rounded-xl 
                                 font-semibold hover:bg-primaryDark transition mb-3"
                    >
                      Place Bid
                    </button>
                  </>
                )}

                <button
                  onClick={() => handleUnlist(nft.id,nft.type)}
                  className="w-full border border-red-500 py-2 rounded-xl 
             hover:bg-red-500 hover:text-black transition"
                >
                  Unlist NFT
                </button>

              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyNFTs;
