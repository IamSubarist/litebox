import React from "react";

const cardData = [
  {
    icon: "/icons/instagram.svg",
    description: "Pose 1",
    type: "Connect",
    platform: "Pose 1",
  },
  {
    icon: "/icons/tikTok.svg",
    description: "Pose 2",
    type: "Connect",
    platform: "Pose 2",
  },
  {
    icon: "/icons/youTube.svg",
    description: "Pose 3",
    type: "Connect",
    platform: "Pose 3",
  },
];

const ChoosePoseCard = ({ onAddBlock }) => {
  return (
    <div className="flex flex-col border border-slate-200 dark:border-slate-700 p-4 rounded-[6px] gap-3 ">
      <div className="flex justify-between items-center font-semibold">
        <p>Choose your products:</p>
        {/* <span className="flex justify-center items-center">
          <p className="bg-green-400 text-[11px] font-semibold px-2 py-[2px] text-white rounded-[6px]">
            Earn
          </p>
        </span> */}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {cardData.map((card, index) => (
          <div
            className="text-center hover:scale-105 duration-300 cursor-pointer"
            onClick={() =>
              onAddBlock && onAddBlock(card.type, { platform: card.platform })
            }
          >
            <div
              key={index}
              className="flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 rounded-[6px] p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <img src={card.icon} alt="" />
            </div>
            <p className="font-bold">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChoosePoseCard;
