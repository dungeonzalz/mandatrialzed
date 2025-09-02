import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TokenStats } from "@shared/schema";
import { Coins, Building, Pickaxe, Bot, Smartphone } from "lucide-react";

interface DividendInfoProps {
  stats?: TokenStats;
}

export default function DividendInfo({ stats }: DividendInfoProps) {
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="mt-12 grid md:grid-cols-2 gap-8">
      <Card className="gold-glow">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-accent" data-testid="heading-dividend-returns">
            <Coins className="w-6 h-6 inline mr-2" />
            Dividend Returns
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-4xl font-bold text-accent" data-testid="text-apy">20% APY</div>
          <p className="text-muted-foreground" data-testid="text-dividend-description">
            Earn substantial dividends from our real-world asset portfolio including industry operations, 
            mining ventures, AI development, and smartphone manufacturing.
          </p>
          <div className="bg-secondary/50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span>Total Dividends Distributed:</span>
              <span className="font-bold text-accent" data-testid="text-total-dividends">
                {formatNumber(stats?.totalDividendsDistributed || 2847293.47)} USDC
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Active Dividend Holders:</span>
              <span className="font-bold" data-testid="text-dividend-holders">
                {formatNumber(stats?.activeDividendHolders || 15847)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold" data-testid="heading-asset-portfolio">
            <Building className="w-6 h-6 inline mr-2 text-primary" />
            Asset Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-secondary/50 rounded-lg" data-testid="card-industrial">
              <Building className="w-8 h-8 text-accent mb-2 mx-auto" />
              <div className="text-sm font-medium">Industrial Operations</div>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-lg" data-testid="card-mining">
              <Pickaxe className="w-8 h-8 text-accent mb-2 mx-auto" />
              <div className="text-sm font-medium">Mining Ventures</div>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-lg" data-testid="card-ai">
              <Bot className="w-8 h-8 text-accent mb-2 mx-auto" />
              <div className="text-sm font-medium">AI Development</div>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-lg" data-testid="card-smartphone">
              <Smartphone className="w-8 h-8 text-accent mb-2 mx-auto" />
              <div className="text-sm font-medium">Smartphone Tech</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4" data-testid="text-portfolio-description">
            Our diversified real-world asset portfolio generates consistent returns that are 
            distributed as dividends to BDC holders.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
