import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TokenStats } from "@shared/schema";

interface StatisticsCardProps {
  stats?: TokenStats;
}

export default function StatisticsCard({ stats }: StatisticsCardProps) {
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const getProgressPercentage = () => {
    if (!stats) return 45.3;
    return (stats.soldSupply / stats.totalSupply) * 100;
  };

  const getRemainingSupply = () => {
    if (!stats) return 328161816823;
    return stats.totalSupply - stats.soldSupply;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold" data-testid="heading-token-statistics">Token Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-muted-foreground">Total Supply</span>
            <span className="font-bold number-counter" data-testid="text-total-supply">
              {formatNumber(stats?.totalSupply || 600000000000)}
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500" 
              style={{ width: `${getProgressPercentage()}%` }}
              data-testid="progress-supply"
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Tokens Sold</span>
            <span className="font-bold text-accent number-counter" data-testid="text-tokens-sold">
              {formatNumber(stats?.soldSupply || 271838183177)}
            </span>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Remaining Supply</span>
            <span className="font-bold text-green-400 number-counter" data-testid="text-remaining-supply">
              {formatNumber(getRemainingSupply())}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
