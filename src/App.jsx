import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Preview from "./components/Preview";
import CTA from "./components/CTA";
import Marketplace from "./pages/Marketplace";
import CreateNFT from "./pages/CreateNFT";
import NFTDetails from "./pages/NFTDetails";
import MyNFTs from "./pages/MyNFTs";
import Footer from "./components/Footer";




function App() {
  return (
    <div className="min-h-screen bg-darkBg text-white">

      <Navbar />

      <Routes>
        <Route 
          path="/" 
          element={
            <>
              <Hero />
              <Features />
              <Preview />
              <CTA />
            </>
          } 
        />

        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/create" element={<CreateNFT />} />
        <Route path="/nft/:id" element={<NFTDetails />} />
        <Route path="/my-nfts" element={<MyNFTs />} />



      </Routes>
      <Footer />

    </div>
  );
}

export default App;
