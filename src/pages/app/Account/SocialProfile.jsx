import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { setSocials } from "@/store/layout";
import TgBindButton from "@/pages/auth/TgBindButton";
import { toast } from "react-toastify";

// SVG компоненты для социальных сетей
const InstagramIcon = ({ className = "", fill = "#FFFFFF", bgFill }) => {
  const useGradient = bgFill === null || bgFill === undefined;
  const grayOpacity = useGradient ? 0 : 1;
  const gradientOpacity = useGradient ? 1 : 0;

  return (
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
        {/* Градиентный фон */}
        <circle
          cx="64"
          cy="64"
          fill="url(#SVGID_1_)"
          r="64"
          style={{
            opacity: gradientOpacity,
            transition: "opacity 0.3s ease-in-out",
          }}
        />
        {/* Серый фон */}
        <circle
          cx="64"
          cy="64"
          fill={bgFill || "#83878c"}
          r="64"
          style={{
            opacity: grayOpacity,
            transition: "opacity 0.3s ease-in-out",
          }}
        />
      </g>
      <g>
        <g>
          <path
            d="M82.333,104H45.667C33.72,104,24,94.281,24,82.333V45.667C24,33.719,33.72,24,45.667,24h36.666    C94.281,24,104,33.719,104,45.667v36.667C104,94.281,94.281,104,82.333,104z M45.667,30.667c-8.271,0-15,6.729-15,15v36.667    c0,8.271,6.729,15,15,15h36.666c8.271,0,15-6.729,15-15V45.667c0-8.271-6.729-15-15-15H45.667z"
            fill={fill}
            style={{ transition: "fill 0.3s ease-in-out" }}
          />
        </g>
        <g>
          <path
            d="M64,84c-11.028,0-20-8.973-20-20c0-11.029,8.972-20,20-20s20,8.971,20,20C84,75.027,75.028,84,64,84z     M64,50.667c-7.352,0-13.333,5.981-13.333,13.333c0,7.353,5.981,13.333,13.333,13.333S77.333,71.353,77.333,64    C77.333,56.648,71.353,50.667,64,50.667z"
            fill={fill}
            style={{ transition: "fill 0.3s ease-in-out" }}
          />
        </g>
        <g>
          <circle
            cx="85.25"
            cy="42.75"
            fill={fill}
            r="4.583"
            style={{ transition: "fill 0.3s ease-in-out" }}
          />
        </g>
      </g>
    </svg>
  );
};

const XTwitterIcon = ({
  className = "",
  fill = "#FFFFFF",
  bgFill = "#000000",
}) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="512"
    height="512"
    viewBox="0 0 512 512"
  >
    <title>X-twitter SVG Icon</title>
    <circle
      cx="256"
      cy="256"
      r="256"
      fill={bgFill}
      style={{ transition: "fill 0.3s ease-in-out" }}
    />
    <g transform="translate(256,256) scale(0.7) translate(-256,-256)">
      <path
        fill={fill}
        d="M389.2 48h70.6L305.6 224.2L487 464H345L233.7 318.6L106.5 464H35.8l164.9-188.5L26.8 48h145.6l100.5 132.9zm-24.8 373.8h39.1L151.1 88h-42z"
        style={{ transition: "fill 0.3s ease-in-out" }}
      />
    </g>
  </svg>
);

const FacebookIcon = ({
  className = "",
  fill = "#FFFFFF",
  bgFill = "#1877F2",
}) => (
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
        fill={bgFill}
        style={{ transition: "fill 0.3s ease-in-out" }}
      />
      <path
        d="M177.825,165 L183.5,128 L148,128 L148,103.98925 C148,93.86675 152.95875,84 168.8595,84 L185,84 L185,52.5 C185,52.5 170.35175,50 156.3475,50 C127.1095,50 108,67.72 108,99.8 L108,128 L75.5,128 L75.5,165 L108,165 L108,254.445 C114.51675,255.4675 121.196,256 128,256 C134.804,256 141.48325,255.4675 148,254.445 L148,165 L177.825,165"
        fill={fill}
        style={{ transition: "fill 0.3s ease-in-out" }}
      />
    </g>
  </svg>
);

const GoogleIcon = ({
  className = "",
  fill = "#FFFFFF",
  bgFill = "#EA4335",
}) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 32 32"
    width="128"
    height="128"
  >
    <circle
      cx="16"
      cy="16"
      r="16"
      fill={bgFill}
      style={{ transition: "fill 0.3s ease-in-out" }}
    />
    <path
      fill={fill}
      d="M16.173,24.596
    c-4.749,0-8.596-3.847-8.596-8.596s3.847-8.596,8.596-8.596
    c2.321,0,4.261,0.855,5.748,2.24l-2.423,2.423v-0.005
    c-0.902-0.86-2.047-1.3-3.325-1.3
    c-2.836,0-5.141,2.396-5.141,5.232s2.305,5.238,5.141,5.238
    c2.573,0,4.325-1.472,4.685-3.492h-4.685v-3.353h8.085
    c0.107,0.574,0.166,1.177,0.166,1.805
    C24.424,21.104,21.136,24.596,16.173,24.596z"
      style={{ transition: "fill 0.3s ease-in-out" }}
    />
  </svg>
);

const mockData = [
  {
    title: "Instagram",
    iconComponent: InstagramIcon,
    icon2: "icons/socials/instagram-outline.svg",
    subscribe: false,
    providerKey: "instagram",
  },

  {
    title: "XTwitter",
    iconComponent: XTwitterIcon,
    icon2: "icons/socials/xtwitter-outline.svg",
    subscribe: true,
    providerKey: "xtwitter",
  },

  {
    title: "Facebook",
    iconComponent: FacebookIcon,
    icon2: "icons/socials/facebook-outline.svg",
    subscribe: true,
    providerKey: "facebook",
  },

  {
    title: "Telegram",
    icon2: "icons/socials/telegram-outline.svg",
    subscribe: true,
    providerKey: "telegram",
  },

  {
    title: "Google",
    iconComponent: GoogleIcon,
    icon2: "icons/socials/google-outline.svg",
    subscribe: true,
    providerKey: "google",
  },
];

// Компонент для отдельной иконки соцсети с hover эффектом
const SocialIconItem = ({
  social,
  isActive,
  getIconClassName,
  getLinkClassName,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const IconComponent = social.iconComponent;

  if (!IconComponent) return null;

  // Определяем цвета в зависимости от статуса и hover
  // Для активных - всегда родные цвета
  // Для неактивных - серый, но при hover - родные цвета
  const useOriginalColor = isActive || isHovered;
  let fill = useOriginalColor ? "#FFFFFF" : "#cccfd4";
  let bgFill = null;

  if (social.providerKey === "xtwitter") {
    bgFill = useOriginalColor ? "#000000" : "#83878c";
  } else if (social.providerKey === "google") {
    bgFill = useOriginalColor ? "#EA4335" : "#83878c";
  } else if (social.providerKey === "facebook") {
    bgFill = useOriginalColor ? "#1877F2" : "#83878c";
  } else if (social.providerKey === "instagram") {
    // Для Instagram: градиент когда активен или при hover, серый когда неактивен
    bgFill = useOriginalColor ? null : "#83878c";
  }

  const handleClick = (e) => {
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

  return (
    <li className="flex-1 hover:scale-110 duration-300">
      <a
        href="#"
        className={getLinkClassName(social.providerKey)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        <IconComponent
          className={getIconClassName(social.providerKey)}
          fill={fill}
          bgFill={bgFill}
        />
      </a>
    </li>
  );
};

const SocialProfile = ({ authProviders = {}, userAuths = {} }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setSocials(mockData));
  });

  const normalizedProviders = authProviders || {};
  const normalizedUserAuths = userAuths || {};

  // Фильтруем иконки: показываем только те, которые есть в authProviders
  const visibleSocials = mockData.filter((item) => {
    return normalizedProviders[item.providerKey] !== undefined;
  });

  // Проверяем наличие ключа в user_auths (если есть и true - цветная иконка)
  // Поддерживаем как старую структуру (boolean), так и новую (объект с status и username)
  const isActive = (providerKey) => {
    const authData = normalizedUserAuths[providerKey];
    if (typeof authData === "object" && authData !== null) {
      return authData.status === true;
    }
    return authData === true;
  };

  const getIconClassName = (providerKey, defaultSize = "w-9 h-9") => {
    const sizeClass = providerKey === "xtwitter" ? defaultSize : defaultSize;
    return `${sizeClass} rounded-full`;
  };

  const getLinkClassName = (providerKey, defaultBg = "") => {
    const active = isActive(providerKey);
    const baseClasses =
      "inline-flex h-9 w-9 text-white text-2xl flex-col items-center justify-center rounded-full max-[640px]:w-8 max-[640px]:h-8";
    return active ? `${baseClasses} ${defaultBg}` : `${baseClasses}`;
  };

  return (
    <ul className="flex gap-2">
      {visibleSocials.map((social) => {
        // Для Telegram используем TgBindButton вместо обычной иконки
        if (social.providerKey === "telegram") {
          return (
            <TgBindButton
              key={social.providerKey}
              userAuths={normalizedUserAuths}
              onSuccess={() => {
                // Callback для обновления данных после успешной привязки
                // Можно добавить обновление данных профиля здесь
                window.location.reload();
              }}
            />
          );
        }

        // Для остальных социальных сетей используем обычные иконки
        return (
          <SocialIconItem
            key={social.providerKey}
            social={social}
            isActive={isActive(social.providerKey)}
            getIconClassName={getIconClassName}
            getLinkClassName={getLinkClassName}
          />
        );
      })}
    </ul>
  );
};

export default SocialProfile;
