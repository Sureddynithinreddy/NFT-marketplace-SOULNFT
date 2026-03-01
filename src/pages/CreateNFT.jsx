import { useState } from "react";
import { mintNFT } from "../utils/mintNFT";

import { useWallet } from "../context/WalletContext";

function CreateNFT() {
  const { signer, connected } = useWallet();

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Art");

  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleMint = async () => {
    if (!connected) {
      alert("Please connect your wallet");
      return;
    }

    if (!image || !name || !description || !price) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await mintNFT(
        signer,
        image,
        name,
        description,
        price,
        category
      );

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg text-white py-20 px-6">

      {/* Title */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold">
          Create <span className="text-primary">NFT</span>
        </h1>
        <p className="text-gray-400 mt-4">
          Upload your digital asset and mint it on Polygon
        </p>
      </div>

      {/* Form Container */}
      <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-xl 
                      border border-white/10 rounded-3xl p-10">

        {/* Image Upload */}
        <label className="block mb-6">
          <span className="text-gray-300">Upload Image</span>

          <div className="mt-4 h-64 border-2 border-dashed border-white/20 
                          rounded-2xl flex items-center justify-center 
                          cursor-pointer hover:border-primary transition">

            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="h-full object-cover rounded-2xl"
              />
            ) : (
              <p className="text-gray-500">Click to upload</p>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </label>

        {/* Name */}
        <div className="mb-6">
          <label className="block text-gray-300 mb-2">NFT Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter NFT name"
            className="w-full px-5 py-3 rounded-2xl 
                       bg-white/5 border border-white/10 
                       focus:outline-none focus:border-primary transition"
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-gray-300 mb-2">Description</label>
          <textarea
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your NFT"
            className="w-full px-5 py-3 rounded-2xl 
                       bg-white/5 border border-white/10 
                       focus:outline-none focus:border-primary transition"
          ></textarea>
        </div>

        {/* Price */}
        <div className="mb-6">
          <label className="block text-gray-300 mb-2">Price (MATIC)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
            className="w-full px-5 py-3 rounded-2xl 
                       bg-white/5 border border-white/10 
                       focus:outline-none focus:border-primary transition"
          />
        </div>

        {/* Category */}
        <div className="mb-8">
          <label className="block text-gray-300 mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-5 py-3 rounded-2xl 
                       bg-white/5 border border-white/10 
                       focus:outline-none focus:border-primary transition"
          >
            <option>Art</option>
            <option>Gaming</option>
            <option>Music</option>
          </select>
        </div>

        {/* Mint Button */}
        <button
          onClick={handleMint}
          disabled={loading}
          className="w-full bg-primary text-black py-4 rounded-2xl 
                     font-semibold text-lg 
                     hover:bg-primaryDark 
                     hover:scale-105 
                     transition duration-300 
                     shadow-glow"
        >
          {loading ? "Minting..." : "Mint NFT"}
        </button>

      </div>
    </div>
  );
}

export default CreateNFT;
