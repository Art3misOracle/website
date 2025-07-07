"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { WalletSelector } from "@/components/WalletSelector";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { getNFTs } from "@/view-functions/getNFTs";
import { aptosClient } from "@/utils/aptosClient";
import { toast } from "@/components/ui/use-toast";
import { Loading } from "@/components/Loading";
import { convertUrl } from "@/utils/helpers";
import { useRouter } from "next/navigation";

interface Card {
  current_token_data: {
    token_uri: string;
    token_properties: {
      PROPERTY_KEY_CARD_NAME: string;
      PROPERTY_KEY_CARD_POSITION: string;
      PROPERTY_KEY_QUESTION: string;
      PROPERTY_KEY_READING: string;
      PROPERTY_KEY_TOKEN_NAME: string;
      PROPERTY_KEY_TIMESTAMP: string;
    };
  };
  owner_address: string;
}

interface AssetData {
  symbol: string;
  price: string;
  cardName: string;
  position: string;
  prediction: string;
  trendIcon: string;
  cardIndex: number;
  indicator: number;
}

interface DailyPrediction {
  time: string;
  result: {
    overall: {
      card: number;
      position: string;
      prediction: string;
      indicator: number;
    };
    [key: string]: {
      card: number;
      position: string;
      prediction: string;
      indicator: number;
    };
  };
}

interface MarketData {
  [key: string]: number;
}

const cardNames = [
  "The Fool",
  "The Magician",
  "The High Priestess",
  "The Empress",
  "The Emperor",
  "The Hierophant",
  "The Lovers",
  "The Chariot",
  "Strength",
  "The Hermit",
  "Wheel of Fortune",
  "Justice",
  "The Hanged Man",
  "Death",
  "Temperance",
  "The Devil",
  "The Tower",
  "The Star",
  "The Moon",
  "The Sun",
  "Judgement",
  "The World",
];

export default function App() {
  const { account } = useWallet();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dailyData, setDailyData] = useState<DailyPrediction | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);

  // Fetch daily prediction data from API
  const fetchDailyPrediction = async () => {
    try {
      const response = await fetch(
        "https://art3misoracle.jeffier2015.workers.dev/daily"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch daily prediction");
      }
      const data = await response.json();
      setDailyData(data);
    } catch (error) {
      console.error("Error fetching daily prediction:", error);
      toast({
        title: "Error",
        description: "Failed to fetch daily prediction, please try again later",
      });
    }
  };

  // Fetch market data from API
  const fetchMarketData = async () => {
    try {
      const response = await fetch(
        "https://art3misoracle.jeffier2015.workers.dev/market"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch market data");
      }
      const data = await response.json();
      setMarketData(data);
    } catch (error) {
      console.error("Error fetching market data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch market data, please try again later",
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchDailyPrediction(), fetchMarketData()]);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleAskQuestion = () => {
    router.push("/ask");
  };

  // Get trend icon based on card position
  const getTrendIcon = (position: string) => {
    return position === "upright"
      ? "/icons/trend-up.png"
      : "/icons/trend-down.png";
  };

  // Format price display
  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `$${price.toFixed(4)}`;
    }
  };

  // Get card name by index
  const getCardName = (cardIndex: number) => {
    return cardNames[cardIndex] || "Unknown Card";
  };

  // Build assets data array
  const assetsData: AssetData[] = ["BTC", "ETH", "APT", "SUI", "MOVE"].map(
    (symbol) => {
      const prediction = dailyData?.result[symbol];
      const price = marketData?.[symbol];

      return {
        symbol,
        price: price ? formatPrice(price) : "Loading...",
        cardName: prediction ? getCardName(prediction.card) : "Loading...",
        position: prediction
          ? prediction.position === "upright"
            ? "Upright"
            : "Reversed"
          : "Loading...",
        prediction: prediction?.prediction || "Loading...",
        trendIcon: prediction
          ? getTrendIcon(prediction.position)
          : "/icons/trend-neutral.png",
        cardIndex: prediction?.card || 0,
        indicator: prediction?.indicator || 0,
      };
    }
  );

  // Today's tarot data
  const todayCard = dailyData?.result.overall
    ? {
        name: getCardName(dailyData.result.overall.card),
        position:
          dailyData.result.overall.position === "upright"
            ? "Upright"
            : "Reversed",
        prediction: dailyData.result.overall.prediction,
        cardIndex: dailyData.result.overall.card,
        indicator: dailyData.result.overall.indicator,
      }
    : {
        name: "Loading...",
        position: "Loading...",
        prediction: "Fetching today's tarot prediction...",
        indicator: 0,
      };

  return (
    <>
      {loading ? (
        <div className="w-full h-screen bg-black animate-pulse">
          <Loading />
        </div>
      ) : (
        <div className="w-full h-screen">
          <div className="relative w-full h-full">
            {/* Background Image */}
            <Image
              src="/images/bg_profile_mobile.png"
              alt="background"
              fill
              className="md:hidden absolute top-0 left-0 w-full h-full object-cover"
            />
            <Image
              src="/images/bg_profile.png"
              alt="background"
              fill
              className="hidden md:block absolute top-0 left-0 w-full h-full object-cover"
            />
            {/* Wallet */}
            {/* <div
              className="absolute z-10"
              style={{
                right: "calc(40 / 1920 * 100%)",
                top: "calc(40 /1080 * 100%)",
                height: "auto",
              }}
            >
              <WalletSelector />
            </div> */}
            {/* Content */}
            <div className="relative z-10 p-2 md:p-6 h-full">
              {/* First Row - Today's Tarot */}
              <div
                className="mt-6 md:mt-24 relative left-[50%] translate-x-[-50%]"
                style={{
                  width: "clamp(200px, calc(864 / 1920 * 100vw), 864px)",
                }}
              >
                <div className="text-center mb-3 border-[1px] border-[#f5be66] rounded-lg pl-4 md:pl-16 pr-4 py-2">
                  <h1 className="text-base md:text-xl font-bold text-[#f5be66] mb-1">
                    Today's Tarot : {todayCard.name} [{todayCard.position}]
                  </h1>
                  <p className="text-[#f5be66] mt-1 max-w-md mx-auto text-xs md:text-sm">
                    {todayCard.prediction}
                  </p>
                </div>
                <div className="hidden md:block w-24 h-20 md:w-48 md:h-40 absolute bottom-0 left-[-5%] md:left-[-10%]">
                  <Image
                    src={
                      todayCard.indicator === 1
                        ? "/images/bull.png"
                        : "/images/bear.png"
                    }
                    alt={
                      todayCard.indicator === 1 ? "Bull Market" : "Bear Market"
                    }
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div
                  className="hidden md:block absolute bottom-0 right-[-5%] md:right-[-10%]"
                  style={{
                    width: "clamp(35px, calc(140 / 1920 * 100vw), 140px)",
                    aspectRatio: "70/104",
                    transform: "rotate(13deg)",
                  }}
                >
                  <Image
                    src={`/cards/${todayCard.cardIndex}.png`}
                    alt={todayCard.name}
                    fill
                    className={`object-cover rounded-lg ${
                      todayCard.position === "Reversed" ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                {/* Second Row - Asset Predictions */}
                <div className="p-4 mt-2">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {assetsData.map((asset, index) => (
                      <div key={index} className="flex flex-col items-center">
                        {/* Card with Asset Icon */}
                        <div className="relative mb-4">
                          <div
                            className="relative"
                            style={{
                              width:
                                "clamp(93px, calc(186 / 1920 * 100vw), 186px)",
                              aspectRatio: "93/139",
                            }}
                          >
                            <Image
                              src={`/cards/${asset.cardIndex}.png`}
                              alt={`${asset.symbol} Tarot`}
                              fill
                              className={`object-cover rounded-lg ${
                                asset.position === "Reversed"
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          </div>
                          {/* Asset Icon */}
                          <div
                            className="absolute -bottom-4 -right-1/3"
                            style={{
                              width:
                                "clamp(72px, calc(144 / 1920 * 100vw), 144px)",
                              height:
                                "clamp(72px, calc(144 / 1920 * 100vw), 144px)",
                            }}
                          >
                            <Image
                              src={`/images/${asset.symbol.toLowerCase()}.png`}
                              alt={asset.symbol}
                              fill
                              className="object-cover rounded-full"
                            />
                          </div>
                        </div>

                        {/* Info Section */}
                        <div
                          className="bg-black/50 border-2 mt-2 border-yellow-400 rounded-lg p-4 w-full overflow-y-auto"
                          style={{
                            aspectRatio: "220/200",
                            width:
                              "clamp(220px, calc(220 / 1920 * 100vw), 220px)",
                          }}
                        >
                          <div className="space-y-2 text-left">
                            <h3 className="font-bold text-yellow-400 text-2xl text-center mb-3">
                              {asset.symbol}
                            </h3>
                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="text-white font-medium">
                                  Card:{" "}
                                </span>
                                <span className="text-gray-300">
                                  {asset.cardName} [{asset.position}]
                                </span>
                              </div>
                              <div>
                                <span className="text-white font-medium">
                                  Price:{" "}
                                </span>
                                <span className="text-gray-300">
                                  {asset.price}
                                </span>
                              </div>
                              <div>
                                <span className="text-white font-medium">
                                  Reading:{" "}
                                </span>
                                <span className="text-yellow-400">
                                  {asset.prediction}
                                </span>
                              </div>
                              <div>
                                <span className="text-white font-medium">
                                  Indicator:{" "}
                                </span>
                                <span className="text-base">
                                  {asset.indicator === 1 ? "📈" : "📉"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Section - Ask Question */}
              <div className="text-center space-y-3 py-4 flex flex-col items-center">
                <div
                  onClick={handleAskQuestion}
                  className="cursor-pointer relative"
                  style={{
                    width: "clamp(106px, calc(212 / 1920 * 100vw), 212px)",
                    aspectRatio: "212/80",
                  }}
                >
                  <Image
                    src="/images/wallet_bg.webp"
                    alt="Ask Question"
                    width={267}
                    height={80}
                    sizes="267px"
                    className="w-full h-full"
                    priority
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#EC9261] text-[0.68rem] sm:text-[0.68rem] md:text-[0.75rem] lg:text-[1.2rem] font-bold whitespace-nowrap">
                    Ask Question
                  </div>
                </div>
                <p className="text-white text-xs opacity-70">
                  This tarot reading is for entertainment purposes only and
                  should not be considered financial advice.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
