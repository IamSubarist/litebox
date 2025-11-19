import React from "react";
import { Link } from "react-router-dom";
import useDarkMode from "@/hooks/useDarkMode";
import BindAccountForm from "./common/bind-account-form";
import { ToastContainer } from "react-toastify";

// image import
import LogoWhite from "@/assets/images/logo/logo-white.svg";
import Logo from "@/assets/images/logo/logo.svg";
import SDLogo from "@/assets/images/logo/sdlogo.svg";

const BindAccount = () => {
  const [isDark] = useDarkMode();
  return (
    <>
      <ToastContainer />

      <div className="loginwrapper">
        <div className="lg-inner-column">
          <div className="left-column relative z-[1]">
            <div className="absolute left-0 top-1/2 translate-y-[-50%] h-full w-full z-[-1] flex justify-center items-center">
              <img
                src={"/icons/socseti.jpeg"}
                alt=""
                className="h-full w-[95%] object-contain"
              />
            </div>
          </div>
          <div className="right-column relative bg-white dark:bg-slate-800">
            <div className="inner-content h-full flex flex-col bg-white dark:bg-slate-800">
              <div className="auth-box h-full flex flex-col justify-center">
                <div className="mobile-logo text-center mb-6 lg:hidden block">
                  <div className="flex items-center justify-center gap-2">
                    <Link to="/">
                      <img src={SDLogo} alt="" className="mx-auto w-10 h-10" />
                    </Link>
                    <p className="text-2xl font-bold leading-[15px] text-white">
                      SocialDash
                    </p>
                  </div>
                </div>
                <div className="text-center 2xl:mb-5 mb-4">
                  <p className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[54px] mb-2">
                    Bind Your Email
                  </p>
                  <div className="text-slate-500 text-base sm:text-base md:text-[16px] lg:text-[16px] xl:text-[16px]">
                    Link your email account to your profile
                  </div>
                </div>
                <BindAccountForm />
              </div>
              <div className="auth-footer text-center">
                Copyright 2025, SocialDash All Rights Reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BindAccount;
