import axios from "axios";
import { ethers } from "ethers";
import NFTMarketplace from "../abi/NFTMarketplace.json";

const CONTRACT_ADDRESS = "0x9f092F4053EdB03D88E92830863CA9e4F200FbA1";


export const mintNFT = async (
  signer,
  imageFile,
  name,
  description,
  price,
  category
) => {
  try {
    // 1️⃣ Upload Image to IPFS
    const formData = new FormData();
    formData.append("file", imageFile);

    const imageRes = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET
,
        },
      }
    );

    const imageCID = imageRes.data.IpfsHash;
    const imageURI = `ipfs://${imageCID}`;

    // 2️⃣ Create Metadata
    const metadata = {
      name,
      description,
      image: imageURI,
      attributes: [
        {
          trait_type: "Category",
          value: category,
        },
      ],
    };

    // 3️⃣ Upload Metadata to IPFS
    const metadataRes = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      metadata,
      {
        headers: {
          pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET,

        },
      }
    );

    const metadataCID = metadataRes.data.IpfsHash;
    const metadataURI = `ipfs://${metadataCID}`;

    // 4️⃣ Call Smart Contract
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      NFTMarketplace,
      signer
    );

    const priceInWei = ethers.parseUnits(price, "ether");

    const tx = await contract.mintNFT(metadataURI, priceInWei, {
  maxPriorityFeePerGas: ethers.parseUnits("30", "gwei"),
  maxFeePerGas: ethers.parseUnits("40", "gwei"),
});


    await tx.wait();

    alert("NFT Minted Successfully!");

  } catch (error) {
    console.error(error);
    alert("Minting Failed!");
  }
};
