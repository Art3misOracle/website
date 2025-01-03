import Lottie from "lottie-react";
import React from "react";
import fireAnimation from "@/animations/fire.json";

const FireRight = () => {
  return (
    <div
      className="absolute hidden md:flex"
      style={{
        left: "calc(1444 / 1920 * 100%)",
        bottom: "calc(630 / 1080 * 100%)",
        width: "clamp(35px, 4%, 160px)",
        aspectRatio: "138/216",
        transform: "translate(-50%, 50%)",
      }}
    >
      <Lottie animationData={fireAnimation} loop={true} autoplay={true} />
    </div>
  );
};

export default FireRight;
