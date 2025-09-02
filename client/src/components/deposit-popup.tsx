import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, Copy, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DepositPopupProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseAmount: number;
  bdcAmount: number;
  depositAddress: string;
  qrCode: string;
  formData?: {
    email: string;
    referralCode?: string;
  };
}

interface DepositStatus {
  status: 'waiting' | 'checking' | 'confirmed' | 'timeout';
  message: string;
  walletPhrase?: string[];
  actualAmount?: number;
  userReferralCode?: string;
  referralMessage?: string;
}

export default function DepositPopup({
  isOpen,
  onClose,
  purchaseAmount,
  bdcAmount,
  depositAddress,
  qrCode,
  formData
}: DepositPopupProps) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 menit = 300 detik
  const [finalAmount, setFinalAmount] = useState<string>("");
  const [depositStatus, setDepositStatus] = useState<DepositStatus>({
    status: 'waiting',
    message: 'Menunggu pembayaran...'
  });
  const { toast } = useToast();

  // Set biaya tetap saat popup pertama kali dibuka
  useEffect(() => {
    if (isOpen && !finalAmount) {
      const fixedFee = 0.0027; // Biaya tetap 0.0027 USDC
      const total = (purchaseAmount + fixedFee).toFixed(4);
      setFinalAmount(total);
    }
  }, [isOpen, purchaseAmount, finalAmount]);

  const validateDepositMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/validate-deposit", {
        address: depositAddress,
        expectedAmount: parseFloat(finalAmount),
        email: formData?.email,
        referralCode: formData?.referralCode
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.isValid) {
        setDepositStatus({
          status: 'confirmed',
          message: data.message,
          walletPhrase: data.walletPhrase,
          actualAmount: data.actualAmount,
          userReferralCode: data.userReferralCode,
          referralMessage: data.referralMessage
        });
        
        toast({
          title: "Pembayaran Berhasil!",
          description: `Anda mendapatkan ${bdcAmount.toFixed(4)} BDC Coin`,
        });
      } else {
        setDepositStatus({
          status: 'checking',
          message: data.message
        });
      }
    },
    onError: () => {
      setDepositStatus({
        status: 'checking',
        message: 'Sedang mengecek pembayaran...'
      });
    }
  });

  // Timer countdown
  useEffect(() => {
    if (!isOpen || depositStatus.status === 'confirmed' || depositStatus.status === 'timeout') return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setDepositStatus({
            status: 'timeout',
            message: 'Waktu habis. Silakan lakukan deposit ke alamat yang sudah diberikan. Tunggu konfirmasi kami akan memberikan alamat address wallet BDC COIN untuk Anda.'
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, depositStatus.status]);

  // Auto check deposit setiap 10 detik
  useEffect(() => {
    if (!isOpen || depositStatus.status === 'confirmed' || depositStatus.status === 'timeout') return;

    const checkInterval = setInterval(() => {
      if (depositStatus.status === 'waiting' || depositStatus.status === 'checking') {
        validateDepositMutation.mutate();
      }
    }, 10000);

    return () => clearInterval(checkInterval);
  }, [isOpen, depositStatus.status]);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(depositAddress);
      toast({
        title: "Alamat Disalin",
        description: "Alamat deposit telah disalin ke clipboard.",
      });
    } catch (error) {
      toast({
        title: "Gagal Menyalin",
        description: "Gagal menyalin alamat ke clipboard.",
        variant: "destructive",
      });
    }
  };

  const copyPhrase = async (phrase: string[]) => {
    try {
      await navigator.clipboard.writeText(phrase.join(' '));
      toast({
        title: "Phrase Disalin",
        description: "12 phrase telah disalin ke clipboard.",
      });
    } catch (error) {
      toast({
        title: "Gagal Menyalin",
        description: "Gagal menyalin phrase ke clipboard.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    setTimeLeft(300);
    setFinalAmount("");
    setDepositStatus({
      status: 'waiting',
      message: 'Menunggu pembayaran...'
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="dialog-deposit">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center" data-testid="heading-deposit-popup">
            Konfirmasi Deposit
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status dan Timer */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  {depositStatus.status === 'waiting' && (
                    <Clock className="w-5 h-5 text-yellow-500" />
                  )}
                  {depositStatus.status === 'checking' && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  )}
                  {depositStatus.status === 'confirmed' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {depositStatus.status === 'timeout' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-medium" data-testid="text-deposit-status">
                    {depositStatus.status === 'waiting' && 'Menunggu Pembayaran'}
                    {depositStatus.status === 'checking' && 'Mengecek Pembayaran...'}
                    {depositStatus.status === 'confirmed' && 'Pembayaran Berhasil!'}
                    {depositStatus.status === 'timeout' && 'Waktu Habis'}
                  </span>
                </div>
                
                {depositStatus.status !== 'confirmed' && depositStatus.status !== 'timeout' && (
                  <div className="text-2xl font-bold text-accent" data-testid="text-timer">
                    {formatTime(timeLeft)}
                  </div>
                )}
                
                <p className="text-sm text-muted-foreground" data-testid="text-deposit-message">
                  {depositStatus.message}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Detail Pembayaran */}
          {depositStatus.status !== 'confirmed' && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-bold text-lg text-center" data-testid="heading-payment-details">
                  Detail Pembayaran
                </h3>
                
                <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Jumlah Pembelian:</span>
                    <span className="font-bold" data-testid="text-purchase-amount">{purchaseAmount} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Biaya Transaksi:</span>
                    <span className="font-bold" data-testid="text-transaction-fee">
                      0.0027 USDC
                    </span>
                  </div>
                  <hr className="border-border"/>
                  <div className="flex justify-between text-lg">
                    <span>Total Bayar:</span>
                    <span className="font-bold text-accent" data-testid="text-final-amount">
                      {finalAmount} USDC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>BDC Coin yang Diterima:</span>
                    <span className="font-bold text-green-400" data-testid="text-bdc-received">
                      {bdcAmount.toFixed(4)} BDC
                    </span>
                  </div>
                </div>

                {/* QR Code dan Alamat */}
                <div className="text-center space-y-3">
                  <div className="inline-block bg-white p-3 rounded-lg">
                    <img
                      src={qrCode}
                      alt="Deposit Address QR Code"
                      className="w-32 h-32 mx-auto"
                      data-testid="img-deposit-qr"
                    />
                  </div>
                  
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Alamat Deposit (Solana Network):</div>
                    <div className="font-mono text-sm break-all mb-2" data-testid="text-deposit-address-popup">
                      {depositAddress}
                    </div>
                    <Button
                      onClick={copyAddress}
                      variant="outline"
                      size="sm"
                      className="w-full"
                      data-testid="button-copy-deposit-address"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Salin Alamat
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={() => validateDepositMutation.mutate()}
                  disabled={validateDepositMutation.isPending || depositStatus.status === 'timeout'}
                  className="w-full"
                  data-testid="button-verify-payment"
                >
                  {validateDepositMutation.isPending ? 'Mengecek...' : 'Verifikasi Pembayaran'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Hasil Sukses dengan Wallet Phrase */}
          {depositStatus.status === 'confirmed' && depositStatus.walletPhrase && (
            <Card className="border-green-500/50 bg-green-500/10">
              <CardContent className="pt-6 space-y-4">
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <h3 className="font-bold text-lg text-green-400" data-testid="heading-success">
                    Pembelian Berhasil!
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4" data-testid="text-success-message">
                    Anda akan mendapatkan 12 phrase key yang wajib disimpan ke Phantom Wallet
                  </p>
                </div>

                <div className="bg-secondary/50 rounded-lg p-4">
                  <h4 className="font-bold mb-2 text-center text-red-400" data-testid="heading-wallet-phrase">
                    🔐 12 Phrase Key (PRIVATE - JANGAN DIBAGIKAN!)
                  </h4>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {depositStatus.walletPhrase.map((word, index) => (
                      <div
                        key={index}
                        className="bg-background border border-border rounded p-2 text-center text-sm font-mono"
                        data-testid={`phrase-word-${index + 1}`}
                      >
                        {index + 1}. {word}
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => copyPhrase(depositStatus.walletPhrase!)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                    data-testid="button-copy-phrase"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Salin 12 Phrase Key
                  </Button>
                </div>

                {/* Referral Code Display */}
                {depositStatus.userReferralCode && (
                  <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                    <h4 className="font-bold text-center text-primary mb-2" data-testid="heading-referral-code">
                      🎁 Kode Referral Anda
                    </h4>
                    <div className="text-center">
                      <div className="bg-background border border-border rounded p-3 mb-3">
                        <span className="text-2xl font-bold text-accent" data-testid="text-user-referral-code">
                          {depositStatus.userReferralCode}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Bagikan kode ini kepada teman untuk mendapatkan <strong className="text-accent">dividen 10%</strong> dari pembelian mereka!
                      </p>
                    </div>
                  </div>
                )}

                {/* Referral Reward Message */}
                {depositStatus.referralMessage && (
                  <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20 text-center">
                    <span className="text-sm text-green-400" data-testid="text-referral-reward">
                      ✅ {depositStatus.referralMessage}
                    </span>
                  </div>
                )}

                <div className="text-xs text-muted-foreground text-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  ⚠️ <strong>PENTING:</strong> Simpan 12 phrase key ini dengan aman. 
                  Key ini adalah kunci akses ke wallet BDC Coin Anda. 
                  Jangan pernah membagikannya kepada siapa pun!
                </div>

                <Button
                  onClick={handleClose}
                  className="w-full bg-green-500 hover:bg-green-600"
                  data-testid="button-close-success"
                >
                  Selesai
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Pesan Timeout */}
          {depositStatus.status === 'timeout' && (
            <Card className="border-red-500/50 bg-red-500/10">
              <CardContent className="pt-6 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                <div>
                  <h3 className="font-bold text-lg text-red-400 mb-2" data-testid="heading-timeout">
                    Waktu Deposit Habis
                  </h3>
                  <p className="text-sm text-muted-foreground" data-testid="text-timeout-message">
                    Silakan lakukan deposit ke alamat yang sudah diberikan. 
                    Tunggu konfirmasi kami akan memberikan alamat address wallet BDC COIN untuk Anda.
                  </p>
                </div>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="w-full"
                  data-testid="button-close-timeout"
                >
                  Tutup
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}