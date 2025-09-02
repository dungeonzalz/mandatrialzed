import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Shuffle, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import DepositPopup from "@/components/deposit-popup";
import { insertPurchaseSchema } from "@shared/schema";

export default function PurchaseForm() {
  const [calculationData, setCalculationData] = useState<any>(null);
  const [showDepositPopup, setShowDepositPopup] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(insertPurchaseSchema.pick({
      amount: true,
      email: true,
      referralCode: true
    })),
    defaultValues: {
      amount: 70,
      email: "",
      referralCode: ""
    }
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: qrData } = useQuery({
    queryKey: ["/api/qr-code"],
  });

  const calculateMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiRequest("POST", "/api/calculate-purchase", { amount });
      return res.json();
    },
    onSuccess: (data) => {
      setCalculationData(data);
    },
  });

  const handleDepositComplete = () => {
    toast({
      title: "Purchase Successful",
      description: "Your BDC coin purchase has been processed successfully.",
    });
    queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    form.reset();
    setCalculationData(null);
    setShowDepositPopup(false);
  };

  const generateRandomAmount = async () => {
    try {
      const res = await apiRequest("GET", "/api/random-amount?min=70&max=1000");
      const data = await res.json();
      form.setValue("amount", data.amount);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate random amount",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "amount" && value.amount && value.amount >= 70) {
        calculateMutation.mutate(value.amount);
      } else if (name === "amount") {
        setCalculationData(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const handlePurchase = (data: any) => {
    if (!calculationData) {
      toast({
        title: "Invalid Purchase",
        description: "Please wait for calculation to complete.",
        variant: "destructive",
      });
      return;
    }

    setShowDepositPopup(true);
  };

  return (
    <>
      <Card className="crypto-glow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold" data-testid="heading-purchase">Purchase BDC Coin</CardTitle>
            <div className="text-right">
              <div className="text-3xl font-bold text-accent" data-testid="text-current-price">
                {stats?.currentPrice?.toFixed(4) || "17.0000"} USDC
              </div>
              <div className="text-sm text-muted-foreground">Current Price</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Price Chart Simulation */}
          <div className="bg-secondary/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">24h Price Movement</span>
              <span className="text-green-400 text-sm font-medium" data-testid="text-price-change">+0.0081%</span>
            </div>
            <div className="h-24 bg-gradient-to-r from-green-500/20 to-primary/20 rounded relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-primary"></div>
            </div>
          </div>

          {/* Purchase Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handlePurchase)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Amount (USDC) - Minimal 70 USDC</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="70"
                          min="70"
                          step="0.0001"
                          className="text-lg pr-20"
                          data-testid="input-purchase-amount"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                        <Button
                          type="button"
                          onClick={generateRandomAmount}
                          size="sm"
                          variant="secondary"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          data-testid="button-random-amount"
                        >
                          <Shuffle className="w-4 h-4 mr-1" />
                          Random
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        data-testid="input-email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="referralCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Referral (Opsional)</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="5 huruf/angka (opsional)"
                        maxLength={5}
                        data-testid="input-referral"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {calculationData && (
                <div className="bg-secondary/50 rounded-lg p-4" data-testid="card-calculation">
                  <div className="flex justify-between items-center">
                    <span>You will receive:</span>
                    <span className="font-bold text-accent" data-testid="text-bdc-amount">
                      {calculationData.bdcAmount} BDC
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-muted-foreground">New price after purchase:</span>
                    <span className="text-sm font-medium" data-testid="text-new-price">
                      {calculationData.newPrice.toFixed(4)} USDC
                    </span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={!calculationData}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-background font-bold py-4 rounded-lg transition-all transform hover:scale-[1.02] pulse-glow"
                data-testid="button-purchase"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Lanjut ke Deposit
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Deposit Popup */}
      {qrData && calculationData && (
        <DepositPopup
          isOpen={showDepositPopup}
          onClose={() => setShowDepositPopup(false)}
          purchaseAmount={form.getValues("amount")}
          bdcAmount={calculationData.bdcAmount}
          depositAddress={qrData.address}
          qrCode={qrData.qrCode}
          formData={{
            email: form.getValues("email"),
            referralCode: form.getValues("referralCode")
          }}
        />
      )}
    </>
  );
}
