import { useQuery } from "@tanstack/react-query";
import { Bitcoin, Shield, TrendingUp, Coins } from "lucide-react";
import PurchaseForm from "@/components/purchase-form";
import DepositInfo from "@/components/deposit-info";
import StatisticsCard from "@/components/statistics-card";
import DividendInfo from "@/components/dividend-info";

export default function Home() {
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  return (
    <div className="min-h-screen bg-background text-foreground animated-bg">
      {/* Navigation Header */}
      <nav className="bg-card/80 backdrop-blur-lg border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-primary to-accent rounded-lg p-2">
                <Bitcoin className="text-xl text-background" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                BDC Coin
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <span className="text-muted-foreground" data-testid="text-active-years">
                Active for <span className="text-accent font-semibold">7 Years</span>
              </span>
              <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm" data-testid="status-trading">
                <div className="w-2 h-2 bg-green-400 rounded-full inline-block mr-1"></div>
                Live Trading
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent" data-testid="heading-main">
              BDC Coin
            </h2>
            <p className="text-xl text-muted-foreground mb-6" data-testid="text-subtitle">
              Premium Cryptocurrency with Real-World Asset Backing
            </p>
            
            {/* Referral Notice */}
            <div className="max-w-2xl mx-auto mb-6 p-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl border border-accent/20" data-testid="notice-referral">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="text-2xl">🎁</span>
                <h3 className="text-lg font-bold text-accent">Program Referral</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Ajak teman atau kerabat untuk bergabung dan dapatkan <strong className="text-accent">dividen penghasilan 10%</strong> dari setiap pembelian mereka! 
                Layanan <strong>akses full exchange</strong> akan diberikan kepada pengguna yang sudah melakukan deposit.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-card border border-border px-4 py-2 rounded-lg" data-testid="badge-industry">
                <span className="mr-2 text-accent">🏭</span>Industry Assets
              </span>
              <span className="bg-card border border-border px-4 py-2 rounded-lg" data-testid="badge-ai">
                <span className="mr-2 text-accent">🤖</span>AI Technology
              </span>
              <span className="bg-card border border-border px-4 py-2 rounded-lg" data-testid="badge-smartphone">
                <span className="mr-2 text-accent">📱</span>Smartphone Industry
              </span>
              <span className="bg-card border border-border px-4 py-2 rounded-lg" data-testid="badge-mining">
                <span className="mr-2 text-accent">💎</span>Mining Operations
              </span>
            </div>
          </div>

          {/* Main Trading Interface */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Purchase Form */}
            <div className="lg:col-span-2">
              <PurchaseForm />
            </div>

            {/* Deposit Information */}
            <div className="space-y-6">
              <DepositInfo />
              <StatisticsCard stats={stats} />
            </div>
          </div>

          {/* Dividend Information Section */}
          <DividendInfo stats={stats} />

          {/* Price History Section */}
          <div className="mt-12">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-6" data-testid="heading-price-activity">Recent Price Activity</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-secondary/50 rounded-lg p-4 text-center" data-testid="card-price-1hour">
                  <div className="text-sm text-muted-foreground mb-1">Last Hour</div>
                  <div className="text-lg font-bold text-green-400">+0.0162%</div>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4 text-center" data-testid="card-price-24hours">
                  <div className="text-sm text-muted-foreground mb-1">24 Hours</div>
                  <div className="text-lg font-bold text-green-400">+0.0459%</div>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4 text-center" data-testid="card-price-7days">
                  <div className="text-sm text-muted-foreground mb-1">7 Days</div>
                  <div className="text-lg font-bold text-green-400">+0.1899%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/80 border-t border-border mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4">
              <h4 className="text-lg font-bold mb-2" data-testid="heading-footer">BDC Coin - Solana Network</h4>
              <p className="text-muted-foreground text-sm" data-testid="text-footer-description">
                Established 2017 • Real Asset Backing • 20% Dividend Returns
              </p>
            </div>
            <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
              <span data-testid="text-secure-trading">
                <Shield className="w-4 h-4 inline mr-1" />Secure Trading
              </span>
              <span data-testid="text-realtime-pricing">
                <TrendingUp className="w-4 h-4 inline mr-1" />Real-time Pricing
              </span>
              <span data-testid="text-dividend-distribution">
                <Coins className="w-4 h-4 inline mr-1" />Dividend Distribution
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
