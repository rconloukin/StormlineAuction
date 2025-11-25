import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAccount } from "wagmi";
import AuctionHall from "./pages/AuctionHall";
import AuctionDetail from "./pages/AuctionDetail";
import MyBids from "./pages/MyBids";
import HowToPlay from "./pages/HowToPlay";
import NotFound from "./pages/NotFound";
import { Navbar } from "./components/Navbar";
import { BackgroundEffects } from "./components/BackgroundEffects";
import { initializeFHE } from "./lib/fhe";
import { toast } from "sonner";

const App = () => {
  const { isConnected } = useAccount();
  const [isFheInitialized, setIsFheInitialized] = useState(false);

  // Initialize FHE when wallet connects
  useEffect(() => {
    if (isConnected && !isFheInitialized) {
      initializeFHE()
        .then(() => {
          setIsFheInitialized(true);
          console.log("FHE SDK initialized successfully");
        })
        .catch((error) => {
          console.error("Failed to initialize FHE:", error);
          toast.error("Failed to initialize FHE SDK. Please refresh the page.");
        });
    }
  }, [isConnected, isFheInitialized]);

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen w-full bg-background text-foreground">
          <BackgroundEffects />
          <Navbar />
          <main className="relative z-10">
            <Routes>
              <Route path="/" element={<AuctionHall />} />
              <Route path="/auction/:seriesId" element={<AuctionDetail />} />
              <Route path="/my-bids" element={<MyBids />} />
              <Route path="/how-to-play" element={<HowToPlay />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
