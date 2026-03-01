import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [connected, setConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask not found!");
        return;
      }

      // Switch to Polygon Amoy first
      await switchToPolygonAmoy();

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      const ethSigner = await ethProvider.getSigner();

      setProvider(ethProvider);
      setSigner(ethSigner);
      setWalletAddress(accounts[0]);
      setConnected(true);

    } catch (error) {
      console.error(error);
    }
  };

  const switchToPolygonAmoy = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x13882" }], // 80002 in hex
      });
    } catch (switchError) {

      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x13882",
              chainName: "Polygon Amoy",
              nativeCurrency: {
                name: "POL",
                symbol: "POL",
                decimals: 18,
              },
              rpcUrls: ["https://rpc-amoy.polygon.technology/"],
              blockExplorerUrls: ["https://amoy.polygonscan.com/"],
            },
          ],
        });
      }
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setConnected(false);
    setProvider(null);
    setSigner(null);
  };

  useEffect(() => {
  const checkConnection = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        const ethProvider = new ethers.BrowserProvider(window.ethereum);
        const ethSigner = await ethProvider.getSigner();

        setProvider(ethProvider);
        setSigner(ethSigner);
        setWalletAddress(accounts[0]);
        setConnected(true);
      }
    }
  };

  checkConnection();
}, []);


  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        connected,
        provider,
        signer,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
