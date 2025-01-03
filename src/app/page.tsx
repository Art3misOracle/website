"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WalletSelector } from "@/components/WalletSelector";
import { AskCat } from "@/components/AskCat";
import { Loading } from "@/components/Loading";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "@/components/ui/use-toast";
import { drawsCard } from "@/entry-functions/drawsCard";
import { mintCard, MintCardArguments } from "@/entry-functions/mintCard";
import { aptosClient } from "@/utils/aptosClient";
import dynamic from "next/dynamic";
import { MODULE_ADDRESS } from "@/constants";
import FireLeft from "@/components/FireLeft";
import FireRight from "@/components/FireRight";

const FireAnimation = dynamic(() => import("@/components/FireAnimation"), {
  ssr: false,
});

function App() {
  const { connected, signAndSubmitTransaction } = useWallet();
  const { toast } = useToast();

  // const [innerWidth, setInnerWidth] = useState(0);
  // const [innerHeight, setInnerHeight] = useState(0);
  const [bgLoading, setBgLoading] = useState(true);
  const [showTips, setShowTips] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showRevealBtn, setShowRevealBtn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCardList, setShowCardList] = useState(false);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const [centerPos, setCenterPos] = useState({ x: 0, y: 0 });
  const [choseCard, setChoseCard] = useState<string>();
  const [choseContent, setChoseContent] = useState<string>();
  const [cardName, setCardName] = useState<string>();
  const [choseCardVisible, setChoseCardVisible] = useState(false);
  const [cardPosition, setCardPosition] = useState<string>();
  const [clickedCard, setClickedCard] = useState(true);
  const [showFinalCard, setShowFinalCard] = useState(false);
  const [showFinalContent, setShowFinalContent] = useState(false);
  const [currentPage, setCurrentPage] = useState("Home");
  const [mintSuccess, setMintSuccess] = useState(false);

  useEffect(() => {
    // preload bg
    if (typeof window !== "undefined") {
      const img = new window.Image();
      img.src = "/images/bg.webp";
      img.onload = () => {
        setBgLoading(false);
      };
    }
    // setInnerWidth(window.innerWidth);
    // setInnerHeight(window.innerHeight);
  }, []);

  useEffect(() => {
    if (connected) {
      setShowTips(false);
    } else {
      initStatus();
      setShowTips(true);
    }
  }, [connected]);

  const handleReadyClick = () => {
    if (!connected) {
      setShowTips(true);
    } else {
      setShowTable(true);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (event.target.value.trim() !== "") {
      setShowRevealBtn(true);
    } else {
      setShowRevealBtn(false);
    }
    setInputValue(event.target.value);
  };

  const handleRevealClick = async () => {
    if (inputValue.trim() === "") {
      toast({
        title: "Warning",
        description: "Please enter your question first~",
      });
    } else {
      setLoading(true);
      try {
        const response = await signAndSubmitTransaction(drawsCard());
        const res = await aptosClient().waitForTransaction({
          transactionHash: response.hash,
        });
        console.log("Drawn Card Transaction:", res);
        if ("events" in res) {
          const cardDrawnEvent = res.events.find(
            (i) => i.type === `${MODULE_ADDRESS}::tarot::CardDrawnEvent`
          );
          if (!cardDrawnEvent) {
            throw new Error("Failed to fetch contract drawn card event");
          }
          const { card, card_uri, position } = cardDrawnEvent.data;
          const gptResponse = await fetch(
            "https://art3misoracle.jeffier2015.workers.dev",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ description: inputValue, card, position }),
            }
          );
          if (!gptResponse.ok) {
            throw new Error("Failed to fetch gpt source");
          }

          const gptData = await gptResponse.json();
          console.log("GPT Response:", gptData);
          setCardPosition(position);
          setCardName(card);
          const cardUrl = convertUrl(card_uri);
          setChoseCard(cardUrl);
          setChoseContent(gptData.choices[0].message.content);
          setShowCardList(true);
          setShowTable(false);
        }
        // mock
        // const data = {
        //   card: "X The Wheel of Fortune",
        //   card_uri:
        //     "ipfs://bafybeif4wfaaeo2pcuyjpurnzjxslmn2osfp7ssry4cyqj3mwmi4za6dmu/3.png",
        //   position: "xxx",
        // };
        // setCardPosition(data.position);
        // // https://bafybeif4wfaaeo2pcuyjpurnzjxslmn2osfp7ssry4cyqj3mwmi4za6dmu.ipfs.w3s.link/
        // const cardUrl = convertUrl(data.card_uri);
        // setChoseCard(cardUrl);
        // const content =
        //   'The number sequence "11111111111" underscores a powerful spiritual message, The number sequence "11111111111" underscores a powerful spiritual message, The number sequence "11111111111" underscores a powerful spiritual message, The number sequence "11111111111" underscores a powerful spiritual message, emphasizing fresh beginnings, strong intuition, and manifesting desires. Drawing "The Wheel of Fortune" upright aligns well with this, signaling a significant turning point in your life. This card indicates that fortune is on your side, and changes occurring now are destined, bringing new opportunities and experiences. Embrace the shifts with optimism and openness, as this is a time where you can effectively harness your personal power to influence your future. Stay adaptable, trust the universe, and prepare for an exciting cycle of growth and progress.';
        // setChoseContent(content);
        // sleep(1500);
        // setShowCardList(true);
        // setShowTable(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Network error, please try it later~",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  function convertUrl(url: string) {
    if (url.startsWith("ipfs://")) {
      const withoutPrefix = url.replace("ipfs://", "");
      const pathParts = withoutPrefix.split("/");
      return `/cards/${pathParts[1]}`;
    } else {
      url = `/images/card.webp`;
    }
    return url;
  }

  const handleCardClick = (index: number, event: React.MouseEvent) => {
    if (clickedIndex !== null) return;
    const rect = (
      event.currentTarget as HTMLDivElement
    ).getBoundingClientRect();
    console.log("rect", rect);

    setCenterPos({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
    console.log("rect", rect.left + rect.width / 2);
    console.log("rect", rect.top + rect.height / 2);
    setClickedIndex(index);
  };

  const handleChoseCardClick = () => {
    setClickedCard(false);
    setTimeout(() => {
      setChoseCardVisible(true);
    }, 600);
  };

  const handleChoseCardVisibleClick = () => {
    setChoseCardVisible(false);
    setShowFinalCard(true);
    setTimeout(() => {
      setShowFinalContent(true);
    }, 1200);
  };

  const handleRestartClick = () => {
    initStatus();
  };

  function initStatus() {
    setShowTips(false);
    setShowTable(false);
    setShowCardList(false);
    setShowFinalCard(false);
    setShowFinalContent(false);
    setChoseCardVisible(false);
    setShowRevealBtn(false);
    setClickedIndex(null);
    setCenterPos({ x: 0, y: 0 });
    setChoseCardVisible(false);
    setClickedCard(true);
  }

  const handleMintClick = async () => {
    try {
      setLoading(true);
      const args: MintCardArguments = {
        question: inputValue,
        reading: choseContent,
        card: cardName,
        position: cardPosition,
      };
      const response = await signAndSubmitTransaction(mintCard(args));
      const res = await aptosClient().waitForTransaction({
        transactionHash: response.hash,
      });
      console.log("Mint Card Transaction:", res);
      toast({
        description: "Mint Card Success~",
        className: "bg-[#573019] text-white",
      });
      setTimeout(() => {
        setMintSuccess(true);
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error, please try it later~",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShareClick = () => {
    const tweetText =
      encodeURIComponent(`✨ Unveil the Mysteries of the Blockchain with Art3mis Oracle! ✨

I've discovered the most magical Web3 tarot card project—Art3mis Oracle. 

🔮 Ready to explore your destiny? Join me at 

art3mis.xyz
`);

    const twitterShareUrl = `https://x.com/intent/post?text=${tweetText}`;

    console.log(twitterShareUrl);

    window.open(twitterShareUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center ">
      {bgLoading ? (
        <div className="w-full h-screen bg-black animate-pulse">
          <Loading />
        </div>
      ) : (
        <div className="relative w-full h-screen flex flex-col">
          {loading && <Loading />}
          {(showTable || showCardList) && (
            <div className="fixed inset-0 bg-black opacity-60 z-10" />
          )}
          <div className="relative w-full h-screen flex flex-col">
            {/* Background Image */}

            <Image
              src="/images/bg.webp"
              alt="background"
              fill
              // className="absolute object-cover w-full h-full "
              className="absolute top-0 left-0 w-full h-full object-cover md:object-fill "
            />
            {/* fire animation */}

            <FireLeft />

            <FireRight />

            {/* wallet */}
            <div
              className="absolute z-10"
              style={{
                right: "calc(40 / 1920 * 100%)",
                top: "calc(40 /1080 * 100%)",
                height: "auto",
              }}
            >
              <WalletSelector />
            </div>

            {/* ask */}

            <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
              {!showTips && !showTable && !showCardList && (
                <div
                  className="absolute flex flex-col md:flex-row justify-center items-center z-10 w-full md:w-auto 
                               left-0 md:left-[20%] top-[50%] md:top-[80%] transform -translate-y-1/2"
                >
                  {/* AskCat container - Responsive sizing */}
                  <div className="w-[120px] md:w-[140px] lg:w-[220px] aspect-[120/160]">
                    <AskCat />
                  </div>

                  {/* Text and button container */}
                  <div className="flex flex-col gap-4 justify-center items-center mt-4 md:mt-0">
                    {/* Text box - Responsive width and font size */}
                    <div className="w-full max-w-[300px] md:hidden md:max-w-[846px] px-3">
                      <div
                        className="font-irishGrover py-2 w-full border bg-opacity-20 bg-black backdrop-blur-sm 
                                    border-[#C77F7F] shadow-[0_2px_8px_1px_#C77F7F] md:whitespace-nowrap text-wrap  rounded-md text-[#f5be66] text-[0.5rem] sm:text-[0.5rem] md:text-[0.75rem] lg:text-[1.1rem] font-bold [text-shadow:1px_1px_5px_black] whitespace-nowrap blur-[0.6px] px-4 "
                      >
                        Welcome, seeker of truth. The cards await your fate.
                        Shall we begin?
                      </div>
                    </div>

                    {/* mobile  */}

                    <div
                      className="relative hidden md:block  h-auto md:w-[623px]  "
                      style={{
                        width: "clamp(423px, calc(846 / 1920 * 100vw), 846px)",
                        aspectRatio: "423/44",
                      }}
                    >
                      <Image
                        src="/images/ask_box.webp"
                        alt="Ask"
                        width={423}
                        height={44}
                        sizes="423px"
                        className="w-full h-full "
                        priority
                      />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#f5be66] text-[0.5rem] sm:text-[0.5rem] md:text-[0.75rem] lg:text-[1.1rem] font-bold [text-shadow:1px_1px_5px_black] md:whitespace-nowrap blur-[0.6px] px-4 py-2 rounded">
                        Welcome, seeker of truth. The cards await your fate.
                        Shall we begin?
                      </div>
                    </div>

                    {/* Ready button - Responsive sizing */}
                    <div
                      onClick={handleReadyClick}
                      className="w-[90px] md:w-[220px] aspect-[110/30] cursor-pointer 
                                  transition-all duration-300 hover:brightness-125"
                    >
                      <Image
                        src="/images/btn_ready.webp"
                        alt="Ready"
                        width={110}
                        height={30}
                        sizes="(max-width: 768px) 90px, 220px"
                        className="w-full h-full"
                        priority
                      />
                    </div>
                  </div>
                </div>
              )}
              {showTips && (
                <div
                  className="md:absolute md:mt-0 mt-40 flex flex-row p-2 ml-[-50px] justify-center items-center z-10"
                  style={{
                    left: "calc(480 / 1920 * 100%)",
                    top: "calc(662 /1080 * 100%)",
                    height: "auto",
                  }}
                >
                  <div
                    className="relative  "
                    style={{
                      width: "clamp(120px, calc(240 / 1920 * 100vw), 240px)",
                      aspectRatio: "120/160",
                    }}
                  >
                    <AskCat />
                  </div>
                  <div
                    className="hidden md:block relative  ml-[-16px] mb-16"
                    style={{
                      width: "clamp(290px, calc(580 / 1920 * 100vw), 580px)",
                      aspectRatio: "290/55",
                    }}
                  >
                    <Image
                      src="/images/ask_tips.webp"
                      alt="Ask"
                      width={290}
                      height={55}
                      sizes="290px"
                      className="w-full h-full"
                      priority
                    />
                  </div>
                  <div
                    className="md:hidden  w-[200px] h-20  mb-16 "
                    style={{
                      aspectRatio: "290/55",
                    }}
                  >
                    <Image
                      src="/images/ask_tips_mobile.png"
                      alt="Ask"
                      width={290}
                      height={55}
                      sizes="290px"
                      className="w-full h-full"
                      priority
                    />
                  </div>
                </div>
              )}
              {showTable && (
                <motion.div
                  className="fixed inset-0 flex justify-center items-center z-10 px-4"
                  style={{
                    // left: "calc(516 / 1920 * 100%)",
                    // top: "calc(234 /1080 * 100%)",
                    height: "auto",
                  }}
                  initial={{ y: "100vh" }}
                  animate={{ y: 0 }}
                  exit={{
                    opacity: 0.5,
                    transition: {
                      duration: 1,
                      opacity: { duration: 1 },
                    },
                  }}
                  transition={{
                    type: "spring",
                    mass: 14,
                    damping: 48,
                    stiffness: 320,
                  }}
                >
                  <div
                    className="relative w-full max-w-[490px] p-4 bg-[url('/images/ask_table.webp')] bg-no-repeat bg-center bg-cover rounded-md"
                    style={{
                      // width: "clamp(490px, calc(980 / 1920 * 100vw), 980px)",
                      aspectRatio: "490/423",
                    }}
                  >
                    {/* <Image
                      src="/images/ask_table.webp"
                      alt="Ask"
                      width={490}
                      height={423}
                      sizes="490px"
                      className="w-full h-full"
                      priority
                    /> */}
                    {/* <textarea
                      onChange={handleInputChange}
                      style={{
                        top: "calc(120 / 1080 * 100vh)",
                        left: "calc(281 / 1920 * 100vw)",
                        width: "calc(373 / 1920 * 100vw)",
                        aspectRatio: "373/313",
                        resize: "none",
                      }}
                      className="absolute bg-transparent text-[#c9b69c] placeholder-[#c9b69c] overflow-auto outline-none z-10"
                      placeholder="Enter your question here..."
                    /> */}

                    <textarea
                      onChange={handleInputChange}
                      className="absolute top-10 md:top-14 left-[48%]  transform -translate-x-1/2 bg-transparent text-[#c9b69c] 
                   placeholder-[#c9b69c] m-auto ml-[-10] overflow-auto outline-none z-10 w-[40%] max-w-[373px] h-[110px]  md:h-[165px] 
                   resize-none "
                      placeholder="Enter your question here..."
                      style={{
                        aspectRatio: "373/313",
                        scrollbarWidth: "none",
                      }}
                    />
                    {showRevealBtn && (
                      <motion.div
                        className="absolute flex justify-center items-center z-10 bottom-4 md:top-2/3 transform -translate-x-1/2"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        transition={{
                          type: "spring",
                          mass: 14,
                          damping: 48,
                          stiffness: 200,
                        }}
                      >
                        <div
                          className="relative w-full "
                          style={{
                            width:
                              "clamp(120px, calc(240 / 1920 * 100vw), 240px)",
                            aspectRatio: "120/160",
                          }}
                        >
                          <AskCat />
                        </div>
                        <div
                          className="relative w-full ml-3 cursor-pointer transition-all duration-300 hover:brightness-125"
                          style={{
                            width:
                              "clamp(126.5px, calc(253 / 1920 * 100vw), 253px)",
                            aspectRatio: "253/86",
                          }}
                          onClick={handleRevealClick}
                        >
                          <Image
                            src="/images/btn_reveal.webp"
                            alt="Ask"
                            width={253}
                            height={86}
                            sizes="253px"
                            className="w-full h-full"
                            priority
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
              {showCardList && (
                <div className="absolute flex-wrap md:top-1/2 flex justify-center gap-8 z-10">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <AnimatePresence key={index}>
                      {clickedIndex === null ? (
                        <motion.div
                          key={index}
                          className="relative w-full cursor-pointer"
                          style={{
                            width:
                              "clamp(93px, calc(186 / 1920 * 100vw), 186px)",
                            aspectRatio: "93/139",
                          }}
                          onClick={(e) => handleCardClick(index, e)}
                          whileHover={{ translateY: "-32px" }}
                          transition={{ duration: 0.5 }}
                          initial={{ opacity: 1 }}
                          animate={
                            clickedIndex === null
                              ? { opacity: 1, y: 0 }
                              : clickedIndex === index
                                ? { opacity: 0 }
                                : {
                                    y: 100,
                                    opacity: 0,
                                    transition: { duration: 1 },
                                  }
                          }
                          exit={{
                            y: "100vh",
                            opacity: 0,
                            transition: { duration: 1.5 },
                          }}
                        >
                          <div
                            className="absolute w-full"
                            style={{
                              width:
                                "clamp(93px, calc(186 / 1920 * 100vw), 186px)",
                              aspectRatio: "93/139",
                            }}
                          >
                            <Image
                              src="/images/card.webp"
                              alt="Card"
                              width={93}
                              height={139}
                              sizes="93px"
                              className="w-full h-full"
                              priority
                            />
                          </div>
                          <motion.div
                            className="absolute w-full rounded-2xl"
                            style={{
                              width:
                                "clamp(94px, calc(187 / 1920 * 100vw), 187px)",
                              aspectRatio: "93/139",
                            }}
                            whileHover={{
                              boxShadow: [
                                "0 0 16px #FFB800",
                                "0 0 3px #FFB800",
                              ],
                              transition: {
                                duration: 1,
                                ease: "easeInOut",
                                repeat: Infinity,
                                repeatType: "reverse",
                              },
                            }}
                            initial={{ boxShadow: "none" }}
                            animate={{
                              boxShadow: "none",
                              transition: { duration: 0.3 },
                            }}
                            exit={{
                              boxShadow: "none",
                              transition: { duration: 0.3 },
                            }}
                          ></motion.div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  ))}
                </div>
              )}
              {/* the chose card */}
              {clickedIndex !== null && clickedCard && (
                <AnimatePresence>
                  <motion.div
                    className="absolute z-20 cursor-pointer"
                    onClick={handleChoseCardClick}
                    style={{
                      width: "clamp(93px, calc(186 / 1920 * 100vw), 186px)",
                      aspectRatio: "93/139",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                    initial={{
                      scale: 1,
                      x: centerPos.x - window.innerWidth / 2,
                      y: centerPos.y - window.innerHeight / 2,
                    }}
                    animate={{
                      scale: 1.5,
                      x: "-50%",
                      y: "-50%",
                      transition: { duration: 2, ease: "easeInOut" },
                    }}
                    exit={{
                      opacity: 0.5,
                      x: 100,
                      y: "-50%",
                      transition: { duration: 1, ease: "easeInOut" },
                    }}
                  >
                    <div
                      className="absolute w-full"
                      style={{
                        width: "clamp(93px, calc(186 / 1920 * 100vw), 186px)",
                        aspectRatio: "93/139",
                      }}
                    >
                      <Image
                        src="/images/card.webp"
                        alt="Card"
                        width={93}
                        height={139}
                        sizes="93px"
                        className="w-full h-full"
                        priority
                      />
                    </div>
                    <motion.div
                      className="absolute w-full rounded-2xl z-20"
                      style={{
                        width: "clamp(94px, calc(187 / 1920 * 100vw), 187px)",
                        aspectRatio: "93/139",
                      }}
                      initial={{ boxShadow: "none" }}
                      animate={{
                        boxShadow: ["0 0 16px #FFB800", "0 0 3px #FFB800"],
                        transition: {
                          duration: 1,
                          ease: "easeInOut",
                          repeat: Infinity,
                          repeatType: "reverse",
                        },
                      }}
                      exit={{
                        boxShadow: "none",
                        transition: { duration: 0.3 },
                      }}
                    />
                  </motion.div>
                </AnimatePresence>
              )}
              {choseCardVisible && (
                <motion.div
                  onClick={handleChoseCardVisibleClick}
                  className="absolute w-full z-20 cursor-pointer"
                  style={{
                    width: "clamp(93px, calc(186 / 1920 * 100vw), 186px)",
                    aspectRatio: "93/139",
                    left: "50%",
                    top: "50%",
                    transform: `translate(-50%, -50%)`,
                    scale: 1.5,
                  }}
                  initial={{ opacity: 0, x: 80, y: "-50%" }}
                  animate={{
                    opacity: 1,
                    x: "-50%",
                    y: "-50%",
                    transition: { duration: 1 },
                  }}
                >
                  <div
                    className="absolute w-full"
                    style={{
                      width: "clamp(93px, calc(186 / 1920 * 100vw), 186px)",
                      aspectRatio: "93/139",
                      transform: `${cardPosition === "upright" ? "" : " rotate(180deg)"}`,
                    }}
                  >
                    <Image
                      src={choseCard || "/images/card.webp"}
                      alt="Card"
                      width={93}
                      height={139}
                      sizes="93px"
                      className="w-full h-full"
                      priority
                    />
                  </div>
                  <motion.div
                    className="absolute w-full rounded-[1.25rem] z-20"
                    style={{
                      width: "clamp(93px, calc(186 / 1920 * 100vw), 186px)",
                      aspectRatio: "93/139",
                      boxShadow: "0 0 16px #FFB800",
                    }}
                  />
                </motion.div>
              )}
              {showFinalCard && (
                <motion.div
                  className="absolute w-full z-20"
                  style={{
                    width: "clamp(93px, calc(186 / 1920 * 100vw), 186px)",
                    aspectRatio: "93/139",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)", // Default centering transform
                  }}
                  initial={{
                    opacity: 1,
                    x: "-50%",
                    y: "-50%",
                  }}
                  animate={{
                    opacity: 1,
                    left: `calc(1375.5 / 1920 * 100%)`,
                    top:
                      window.innerWidth < 768
                        ? `10%`
                        : `calc(482.5 / 1080 * 100%)`, // Mobile logic
                    transform:
                      window.innerWidth < 768
                        ? "translate(-150%, 0%) scale(1)" // Center horizontally and move up
                        : "translate(15%, 25%) scale(1.5)", // Keep original for larger screens
                    transition: { duration: 1.2, ease: "easeInOut" },
                  }}
                >
                  <div
                    className="absolute w-full"
                    style={{
                      width: "clamp(93px, calc(186 / 1920 * 100vw), 186px)",
                      aspectRatio: "93/139",
                      transform: `${cardPosition === "upright" ? "" : "rotate(180deg)"}`,
                    }}
                  >
                    <Image
                      src={choseCard || "/images/card.webp"}
                      alt="New Card"
                      width={93}
                      height={139}
                      sizes="93px"
                      className="w-full h-full"
                      priority
                    />
                  </div>
                  <motion.div
                    className="absolute w-full rounded-[1.25rem] z-20"
                    style={{
                      width: "clamp(93px, calc(186 / 1920 * 100vw), 186px)",
                      aspectRatio: "93/139",
                      boxShadow: "0 0 16px #FFB800",
                    }}
                  />
                </motion.div>
              )}

              {showFinalContent && (
                <div className="absolute w-full top-[40%] md:justify-center  md:top-[44%] md:mr-52 content-center items-center flex flex-col font-bold text-white  ">
                  <div className="flex flex-row w-full h-[270px] md:w-[65%] pr-2 md:h-full ">
                    <div
                      className=" relative md:top-36 md:left-16 w-[100px]  h-[135px] md:h-[280px] md:w-[220px] z-30 "
                      style={{
                        // width: "clamp(135px, calc(270 / 1920 * 100vw), 270px)",
                        aspectRatio: "135/179",
                        // top: `calc(380 / 1080 * 100%)`,
                        // left: `calc(-412 / 1920 * 100%)`,
                      }}
                    >
                      <Image
                        src="/images/ask_cat2.webp"
                        alt="Ask"
                        width={135}
                        height={179}
                        sizes="135px"
                        className="w-full h-full"
                        priority
                      />
                    </div>
                    <div
                      className="relative z-20 w-full md:w-[700px] h-[350px]  overflow-hidden  "
                      style={{
                        aspectRatio: "895/456",
                      }}
                    >
                      <div className="hidden md:block absolute w-full h-full">
                        {" "}
                        <Image
                          src="/images/content_border.webp"
                          alt="Content"
                          width={895}
                          height={456}
                          sizes="895px"
                          className="w-full h-full"
                          objectFit="cover"
                          priority
                        />
                      </div>
                      <div
                        className="py-2 w-full h-auto px-3 border bg-opacity-20 bg-black backdrop-blur-sm 
                                    border-[#67cbfa] shadow-[0_2px_8px_1px_#67cbfa] rounded-md text-[#67cbfa] 
                                    text-xs font-bold md:hidden overflow-auto "
                      >
                        {choseContent}
                      </div>
                      <div
                        style={{
                          top: "calc(56 /1080 * 100vh)",
                          left: "calc(77 / 1920 * 100vw)",
                          width: "calc(762 / 1920 * 100vw)",
                          resize: "none",
                        }}
                        className=" hidden md:block absolute text-[#67cbfa] text-[1.2rem] sm:text-[0.5rem] md:text-[0.75rem] lg:text-[1.2rem] font-bold"
                      >
                        <div
                          className="overflow-auto"
                          style={{
                            height:
                              "clamp(182px, calc(356 / 1080 * 100vh), 356px)",
                          }}
                        >
                          {choseContent}
                        </div>
                      </div>
                    </div>
                  </div>{" "}
                  <div className="relative md:left-16 flex justify-end flex-row md:flex  gap-3 z-20">
                    <div
                      onClick={handleRestartClick}
                      className="relative cursor-pointer transition-all duration-300 hover:brightness-125"
                      style={{
                        width:
                          "clamp(119.5px, calc(239 / 1920 * 100vw), 239px)",
                        aspectRatio: "239/80",
                      }}
                    >
                      <Image
                        src="/images/restart_btn.webp"
                        alt="Restart"
                        width={110}
                        height={30}
                        sizes="110px"
                        className="w-full h-full"
                        priority
                      />
                    </div>
                    <div
                      onClick={handleMintClick}
                      className="relative cursor-pointer transition-all duration-300 hover:brightness-125"
                      style={{
                        width:
                          "clamp(119.5px, calc(239 / 1920 * 100vw), 239px)",
                        aspectRatio: "239/80",
                      }}
                    >
                      <Image
                        src="/images/mint_btn.webp"
                        alt="Mint"
                        width={110}
                        height={30}
                        sizes="110px"
                        className="w-full h-full"
                        priority
                      />
                    </div>
                    <div
                      onClick={handleShareClick}
                      className="relative cursor-pointer transition-all duration-300 hover:brightness-125"
                      style={{
                        width:
                          "clamp(119.5px, calc(239 / 1920 * 100vw), 239px)",
                        aspectRatio: "239/80",
                      }}
                    >
                      <Image
                        src="/images/share_btn.webp"
                        alt="Mint"
                        width={110}
                        height={30}
                        sizes="110px"
                        className="w-full h-full"
                        priority
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* mobile tab bar - hidden on desktop view */}
          <div className="fixed md:hidden bottom-0 w-full flex flex-row justify-center content-center items-center ">
            {[
              { label: "Home", icon: "/icons/eye-icon.png" },
              { label: "Profile", icon: "/icons/tree-icon.png" },
            ].map((page, index) => (
              <div
                key={index}
                onClick={() => {
                  page.label === "Home"
                    ? setCurrentPage(page.label)
                    : toast({
                        description: "Coming Soon~",
                        className: "bg-[#573019] text-white",
                      });
                }}
                className={`px-3 md:px-5 py-1 flex flex-col justify-center bg-[#0F0E26] text-center 
                               items-center w-1/2 ${
                                 currentPage === page.label
                                   ? "bg-gradient-to-b from-[#7a5833] via-[#0F0E26] to-[#0F0E26] text-[#FFBB54] border-t-2 border-t-[#B47028]"
                                   : "text-gray-300"
                               }`}
              >
                <div className="w-8 h-8 md:w-10 md:h-10">
                  <Image
                    src={page.icon}
                    alt={page.label}
                    width={50}
                    height={20}
                    sizes="(max-width: 768px) 32px, 40px"
                    className="w-full h-full"
                    priority
                  />
                </div>
                <span className="text-sm md:text-base">{page.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
