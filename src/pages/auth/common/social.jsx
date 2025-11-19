import { toast } from "react-toastify";
import telegram from "@/assets/images/icon/telegram.svg";

// SVG компоненты для социальных сетей (всегда цветные)
const InstagramIcon = ({ className = "" }) => (
  <svg
    className={className}
    enableBackground="new 0 0 128 128"
    height="128px"
    viewBox="0 0 128 128"
    width="128px"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <g>
      <linearGradient
        gradientTransform="matrix(1 0 0 -1 594 633)"
        gradientUnits="userSpaceOnUse"
        id="SVGID_1_"
        x1="-566.7114"
        x2="-493.2875"
        y1="516.5693"
        y2="621.4296"
      >
        <stop offset="0" style={{ stopColor: "#FFB900" }} />
        <stop offset="1" style={{ stopColor: "#9100EB" }} />
      </linearGradient>
      <circle cx="64" cy="64" fill="url(#SVGID_1_)" r="64" />
    </g>
    <g>
      <g>
        <path
          d="M82.333,104H45.667C33.72,104,24,94.281,24,82.333V45.667C24,33.719,33.72,24,45.667,24h36.666    C94.281,24,104,33.719,104,45.667v36.667C104,94.281,94.281,104,82.333,104z M45.667,30.667c-8.271,0-15,6.729-15,15v36.667    c0,8.271,6.729,15,15,15h36.666c8.271,0,15-6.729,15-15V45.667c0-8.271-6.729-15-15-15H45.667z"
          fill="#FFFFFF"
        />
      </g>
      <g>
        <path
          d="M64,84c-11.028,0-20-8.973-20-20c0-11.029,8.972-20,20-20s20,8.971,20,20C84,75.027,75.028,84,64,84z     M64,50.667c-7.352,0-13.333,5.981-13.333,13.333c0,7.353,5.981,13.333,13.333,13.333S77.333,71.353,77.333,64    C77.333,56.648,71.353,50.667,64,50.667z"
          fill="#FFFFFF"
        />
      </g>
      <g>
        <circle cx="85.25" cy="42.75" fill="#FFFFFF" r="4.583" />
      </g>
    </g>
  </svg>
);

const XTwitterIcon = ({ className = "" }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="512"
    height="512"
    viewBox="0 0 512 512"
  >
    <title>X-twitter SVG Icon</title>
    <circle cx="256" cy="256" r="256" fill="#000000" />
    <g transform="translate(256,256) scale(0.7) translate(-256,-256)">
      <path
        fill="#FFFFFF"
        d="M389.2 48h70.6L305.6 224.2L487 464H345L233.7 318.6L106.5 464H35.8l164.9-188.5L26.8 48h145.6l100.5 132.9zm-24.8 373.8h39.1L151.1 88h-42z"
      />
    </g>
  </svg>
);

const FacebookIcon = ({ className = "" }) => (
  <svg
    className={className}
    width="256px"
    height="256px"
    viewBox="0 0 256 256"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid"
  >
    <title>Facebook</title>
    <g>
      <path
        d="M256,128 C256,57.3075 198.6925,0 128,0 C57.3075,0 0,57.3075 0,128 C0,191.8885 46.80775,244.8425 108,254.445 L108,165 L75.5,165 L75.5,128 L108,128 L108,99.8 C108,67.72 127.1095,50 156.3475,50 C170.35175,50 185,52.5 185,52.5 L185,84 L168.8595,84 C152.95875,84 148,93.86675 148,103.98925 L148,128 L183.5,128 L177.825,165 L148,165 L148,254.445 C209.19225,244.8425 256,191.8885 256,128"
        fill="#1877F2"
      />
      <path
        d="M177.825,165 L183.5,128 L148,128 L148,103.98925 C148,93.86675 152.95875,84 168.8595,84 L185,84 L185,52.5 C185,52.5 170.35175,50 156.3475,50 C127.1095,50 108,67.72 108,99.8 L108,128 L75.5,128 L75.5,165 L108,165 L108,254.445 C114.51675,255.4675 121.196,256 128,256 C134.804,256 141.48325,255.4675 148,254.445 L148,165 L177.825,165"
        fill="#FFFFFF"
      />
    </g>
  </svg>
);

const GoogleIcon = ({ className = "" }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 32 32"
    width="128"
    height="128"
  >
    <circle cx="16" cy="16" r="16" fill="#EA4335" />
    <path
      fill="#FFFFFF"
      d="M16.173,24.596
    c-4.749,0-8.596-3.847-8.596-8.596s3.847-8.596,8.596-8.596
    c2.321,0,4.261,0.855,5.748,2.24l-2.423,2.423v-0.005
    c-0.902-0.86-2.047-1.3-3.325-1.3
    c-2.836,0-5.141,2.396-5.141,5.232s2.305,5.238,5.141,5.238
    c2.573,0,4.325-1.472,4.685-3.492h-4.685v-3.353h8.085
    c0.107,0.574,0.166,1.177,0.166,1.805
    C24.424,21.104,21.136,24.596,16.173,24.596z"
    />
  </svg>
);

const Social = () => {
  const handleSocialClick = (e, socialName) => {
    e.preventDefault();
    toast.info("The feature is under development", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  const handleClick = (e) => {
    e.preventDefault();
    toast.info("Данная функция недоступна в демо-режиме", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  return (
    <ul className="flex">
      {/* Instagram */}
      {/* <li className="flex-1 hover:scale-110 duration-300">
        <a
          href="#"
          onClick={(e) => handleSocialClick(e, "Instagram")}
          className="inline-flex h-10 w-10 text-white text-2xl flex-col items-center justify-center rounded-full"
        >
          <InstagramIcon className="w-10 h-10 rounded-full" />
        </a>
      </li> */}
      {/* XTwitter */}
      {/* <li className="flex-1 hover:scale-110 duration-300">
        <a
          href="#"
          onClick={(e) => handleSocialClick(e, "X/Twitter")}
          className="inline-flex h-10 w-10 text-white text-2xl flex-col items-center justify-center rounded-full"
        >
          <XTwitterIcon className="w-10 h-10 rounded-full" />
        </a>
      </li> */}
      {/* Facebook */}
      {/* <li className="flex-1 hover:scale-110 duration-300">
        <a
          href="#"
          onClick={(e) => handleSocialClick(e, "Facebook")}
          className="inline-flex h-10 w-10 text-white text-2xl flex-col items-center justify-center rounded-full"
        >
          <FacebookIcon className="w-10 h-10 rounded-full" />
        </a>
      </li> */}
      {/* Telegram - не трогаем */}
      <div
        onClick={(e) => {
          handleClick(e);
        }}
      >
        {/* <TelegramLoginButton /> */}
        <a
          // href="#"
          className="cursor-pointer inline-flex h-10 w-10 bg-[#0A63BC] text-white text-2xl flex-col items-center justify-center rounded-full"
        >
          <img src={telegram} alt="" />
        </a>
      </div>
      {/* Google */}
      {/* <li className="flex-1 hover:scale-110 duration-300">
        <a
          href="#"
          onClick={(e) => handleSocialClick(e, "Google")}
          className="inline-flex h-10 w-10 text-white text-2xl flex-col items-center justify-center rounded-full"
        >
          <GoogleIcon className="w-10 h-10 rounded-full" />
        </a>
      </li> */}
    </ul>
  );
};

export default Social;
