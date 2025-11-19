import React from "react";
import Profile from "./profileWidget";
import SocialLink from "./socialLinkWidget";
import ButtonWidget from "./buttonWidget";
import useWidth from "@/hooks/useWidth";
import VideoWidget from "./videoWidget";

const LeftCol = ({
  redactor,
  circle,
  profil,
  profileData,
  onProfileEdit,
  hasVideoWidget,
  videoData,
  onVideoEdit,
  onVideoDelete,
  hasSocialLinkWidget,
  socialLinkData,
  onSocialLinkEdit,
  onSocialLinkDelete,
  hasButtonWidget,
  buttonData,
  onButtonEdit,
  onButtonDelete,
}) => {
  const { width, breakpoints } = useWidth();
  const isSmallScreen = width < breakpoints.xl;
  // На мобильных - в потоке, занимает всю ширину
  if (isSmallScreen) {
    return (
      <div className="w-full space-y-5 bg-[#131517] relative">
        <Profile
          redactor={redactor}
          circle={circle}
          profil={profil}
          profileData={profileData}
          onEdit={onProfileEdit}
        />
        {hasSocialLinkWidget && (
          <SocialLink
            redactor={redactor}
            circle={circle}
            socialLinks={socialLinkData?.socialLinks}
            onEdit={onSocialLinkEdit}
            showMock={
              !socialLinkData?.socialLinks ||
              socialLinkData.socialLinks.length === 0
            }
          />
        )}
        {hasButtonWidget && (
          <ButtonWidget
            redactor={redactor}
            circle={circle}
            grid={false}
            border={true}
            buttons={buttonData?.buttons}
            onEdit={onButtonEdit}
            showMock={!buttonData?.buttons || buttonData.buttons.length === 0}
          />
        )}
        {((redactor && hasVideoWidget) ||
          (!redactor && videoData?.videoUrl)) && (
          <div
            className={`absolute ${
              circle
                ? `top-[15rem] left-[13rem]`
                : `left-1/2 translate-x-[80px] bottom-[19rem]`
            }`}
          >
            <VideoWidget
              redactor={redactor}
              onEdit={onVideoEdit}
              videoUrl={videoData?.videoUrl}
              thumbnail={videoData?.thumbnail}
            />
          </div>
        )}
      </div>
    );
  }

  // На десктопе - фиксированная колонка слева
  return (
    <>
      <div
        className={`w-[500px] flex flex-col space-y-5 ${
          redactor
            ? "sticky top-[81px] self-start"
            : "fixed left-70 h-screen overflow-y-hidden"
        }`}
      >
        <Profile
          redactor={redactor}
          circle={circle}
          profil={profil}
          profileData={profileData}
          onEdit={onProfileEdit}
        />
        {!circle && hasSocialLinkWidget && (
          <SocialLink
            redactor={redactor}
            circle={circle}
            socialLinks={socialLinkData?.socialLinks}
            onEdit={onSocialLinkEdit}
            showMock={
              !socialLinkData?.socialLinks ||
              socialLinkData.socialLinks.length === 0
            }
          />
        )}
        {hasButtonWidget && (
          <ButtonWidget
            redactor={redactor}
            circle={circle}
            grid={false}
            border={true}
            buttons={buttonData?.buttons}
            onEdit={onButtonEdit}
            showMock={!buttonData?.buttons || buttonData.buttons.length === 0}
          />
        )}
        {((redactor && hasVideoWidget) ||
          (!redactor && videoData?.videoUrl)) && (
          <div
            className={`absolute ${
              circle ? `top-[5rem] left-[12rem]` : `top-[17rem] left-[22rem]`
            }`}
          >
            <VideoWidget
              redactor={redactor}
              onEdit={onVideoEdit}
              videoUrl={videoData?.videoUrl}
              thumbnail={videoData?.thumbnail}
            />
          </div>
        )}
      </div>
      {circle && hasSocialLinkWidget && (
        <div
          className={`${redactor ? "right-12" : "right-[16%]"} top-60 fixed`}
        >
          <SocialLink
            redactor={redactor}
            circle={circle}
            socialLinks={socialLinkData?.socialLinks}
            onEdit={onSocialLinkEdit}
            showMock={
              !socialLinkData?.socialLinks ||
              socialLinkData.socialLinks.length === 0
            }
          />
        </div>
      )}
    </>
  );
};

export default LeftCol;
