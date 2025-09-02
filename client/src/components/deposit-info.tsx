import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DepositInfo() {
  const { toast } = useToast();
  
  const { data: qrData } = useQuery({
    queryKey: ["/api/qr-code"],
  });

  const copyAddress = async () => {
    if (!qrData?.address) return;
    
    try {
      await navigator.clipboard.writeText(qrData.address);
      toast({
        title: "Address Copied",
        description: "Deposit address has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy address to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center" data-testid="heading-deposit">
          USDC Deposit Address
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="inline-block bg-white p-4 rounded-lg">
            {qrData?.qrCode ? (
              <img
                src={qrData.qrCode}
                alt="USDC Deposit Address QR Code"
                className="w-32 h-32 mx-auto"
                data-testid="img-qr-code"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-200 animate-pulse rounded" data-testid="skeleton-qr-code"></div>
            )}
          </div>
        </div>
        
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">Solana Network Address:</div>
          <div className="font-mono text-sm break-all" data-testid="text-deposit-address">
            {qrData?.address || "Loading..."}
          </div>
          <Button
            onClick={copyAddress}
            variant="ghost"
            size="sm"
            className="mt-2 text-primary hover:text-primary/80 p-0 h-auto"
            data-testid="button-copy-address"
          >
            <Copy className="w-4 h-4 mr-1" />
            Copy Address
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground text-center" data-testid="text-network-warning">
          <Shield className="w-4 h-4 inline mr-1" />
          Solana Network Only
        </div>
      </CardContent>
    </Card>
  );
}
