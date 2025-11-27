import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Trophy, Lock, Lightbulb, AlertCircle } from "lucide-react";

export default function HowToPlay() {
  return (
    <div className="min-h-screen relative">
      <div className="container mx-auto px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-orbitron font-bold mb-2">How to Play</h1>
          <p className="text-muted-foreground mb-8">
            Understanding StormlineAuction's Core Gameplay Mechanics
          </p>

          {/* Demo Video */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <Card className="glass border-primary/20 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black">
                  <video
                    className="w-full h-full"
                    controls
                    poster="/demo-poster.jpg"
                  >
                    <source src="/demo.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Core Gameplay Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <Card className="glass border-accent/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-orbitron">Core Gameplay: Minority Wins</CardTitle>
                    <CardDescription>The tier with the fewest bidders takes the prize</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-lg leading-relaxed">
                  <p className="mb-4">
                    StormlineAuction is an encrypted auction platform based on the <strong className="text-primary">Minority Game</strong> theory.
                    The rules appear simple, but contain deep strategic gameplay:
                  </p>
                  <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <p className="font-semibold text-accent mb-2">🎯 Winning Condition</p>
                    <p className="text-base">
                      Choose the tier with the <strong>fewest bidders</strong> to win and share the prize pool equally with other winners.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Strategic Paradox */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <Card className="glass border-tier-ember/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-tier-ember/20 flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-tier-ember" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-orbitron">The Strategic Paradox</CardTitle>
                    <CardDescription>The essence of game theory</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-tier-ember/10 border border-tier-ember/20">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertCircle className="w-5 h-5 text-tier-ember mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-tier-ember mb-2">This is the core contradiction!</p>
                      <p className="text-base leading-relaxed">
                        If <strong>everyone chooses what seems like the minority option</strong>, that option becomes the majority!
                        This creates an opportunity for players who chose other tiers.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 rounded bg-background/50">
                    <p className="text-sm text-muted-foreground">
                      💡 <strong>Example:</strong> If most players think Ember will have few bidders and choose it,
                      Ember becomes the most crowded tier, and the minority who chose Gale or Flash will win instead.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 rounded-lg bg-tier-gale/10 border border-tier-gale/20">
                    <p className="font-semibold text-tier-gale mb-2">✅ Strategic Thinking</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Predict other players' choices</li>
                      <li>Contrarian thinking: popular ≠ good choice</li>
                      <li>Analyze historical patterns</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-tier-flash/10 border border-tier-flash/20">
                    <p className="font-semibold text-tier-flash mb-2">⚠️ Avoid Traps</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Don't always follow the crowd</li>
                      <li>Unpopular options aren't guaranteed wins</li>
                      <li>Each round is independent</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Game Flow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-orbitron font-bold mb-4">Game Flow</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="glass border-primary/20">
                <CardHeader>
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                    <span className="font-orbitron font-bold text-primary">1</span>
                  </div>
                  <CardTitle className="text-lg">Choose Auction</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Browse open auction series and review prize pool and participant count
                  </p>
                </CardContent>
              </Card>

              <Card className="glass border-tier-ember/20">
                <CardHeader>
                  <div className="w-10 h-10 rounded-full bg-tier-ember/20 flex items-center justify-center mb-2">
                    <span className="font-orbitron font-bold text-tier-ember">2</span>
                  </div>
                  <CardTitle className="text-lg">Encrypted Bid</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Select Ember, Gale, or Flash tier and submit your encrypted bid using FHE technology
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                    <Lock className="w-3 h-3" />
                    <span>Fully Private</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-tier-gale/20">
                <CardHeader>
                  <div className="w-10 h-10 rounded-full bg-tier-gale/20 flex items-center justify-center mb-2">
                    <span className="font-orbitron font-bold text-tier-gale">3</span>
                  </div>
                  <CardTitle className="text-lg">Wait for Settlement</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    After the auction ends, anyone can trigger on-chain settlement
                  </p>
                </CardContent>
              </Card>

              <Card className="glass border-tier-flash/20">
                <CardHeader>
                  <div className="w-10 h-10 rounded-full bg-tier-flash/20 flex items-center justify-center mb-2">
                    <span className="font-orbitron font-bold text-tier-flash">4</span>
                  </div>
                  <CardTitle className="text-lg">Claim Rewards</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    If you're in the winning tier, visit My Bids to claim your share of the prize
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-accent">
                    <Trophy className="w-3 h-3" />
                    <span>Split Prize Pool</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Three Tiers Explanation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-orbitron font-bold mb-4">The Three Tiers</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="glass border-tier-ember/30">
                <CardHeader>
                  <Badge variant="outline" className="w-fit border-tier-ember text-tier-ember mb-2">
                    Ember
                  </Badge>
                  <CardTitle>Conservative Choice</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Often chosen by risk-averse players, but if too many choose it, it becomes the most crowded tier.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass border-tier-gale/30">
                <CardHeader>
                  <Badge variant="outline" className="w-fit border-tier-gale text-tier-gale mb-2">
                    Gale
                  </Badge>
                  <CardTitle>Balanced Choice</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    The middle ground that attracts moderate risk-takers, or could be overlooked entirely.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass border-tier-flash/30">
                <CardHeader>
                  <Badge variant="outline" className="w-fit border-tier-flash text-tier-flash mb-2">
                    Flash
                  </Badge>
                  <CardTitle>Aggressive Choice</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Seems risky, but if everyone avoids it, it could become the winning minority.
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Important:</strong>
                No tier is inherently better than others. Success depends on predicting other players' choices and finding the true minority.
                This is the beauty of the game!
              </p>
            </div>
          </motion.div>

          {/* Privacy & Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="glass border-primary/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-orbitron">Privacy Protection</CardTitle>
                    <CardDescription>Zama Fully Homomorphic Encryption (FHE)</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  StormlineAuction uses Zama's fhEVM technology to ensure your tier choice is fully encrypted on-chain.
                  Before settlement, <strong className="text-foreground">nobody (including the contract creator) can know which tier you selected</strong>.
                </p>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Encrypted on-chain storage, cannot be decrypted early</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Automatic settlement calculation, fair and transparent</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Prevents manipulation, ensures fair gameplay</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Open-source smart contracts, fully verifiable</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
