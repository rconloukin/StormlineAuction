import { useState } from "react";
import { Link } from "react-router-dom";
import { Zap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CreateAuctionDialog } from "./CreateAuctionDialog";

export function Navbar() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 glass">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center glow-primary transition-all group-hover:scale-110">
            <Zap className="w-6 h-6 text-background" />
          </div>
          <span className="text-xl font-bold font-orbitron bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            STORMLINE
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink
            to="/"
            end
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background-hover"
            activeClassName="text-primary bg-background-hover"
          >
            Auction Hall
          </NavLink>
          <NavLink
            to="/my-bids"
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background-hover"
            activeClassName="text-primary bg-background-hover"
          >
            My Bids
          </NavLink>
          <NavLink
            to="/how-to-play"
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background-hover"
            activeClassName="text-primary bg-background-hover"
          >
            How to Play
          </NavLink>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            className="bg-gradient-primary hover:glow-primary text-background font-semibold"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Create Auction</span>
          </Button>

          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-primary/50 hover:bg-primary/10 hover:border-primary"
                          onClick={openConnectModal}
                        >
                          Connect Wallet
                        </Button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={openChainModal}
                        >
                          Wrong Network
                        </Button>
                      );
                    }

                    return (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-sm text-muted-foreground"
                          onClick={openChainModal}
                        >
                          {chain.name}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-primary/50 hover:bg-primary/10 hover:border-primary font-mono"
                          onClick={openAccountModal}
                        >
                          {account.displayName}
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>

      <CreateAuctionDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </header>
  );
}
