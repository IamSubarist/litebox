import React from "react";
import { Link } from "react-router-dom";
import ForgotPass from "./common/forgot-pass";
import useDarkMode from "@/hooks/useDarkMode";

import LogoWhite from "@/assets/images/logo/logo-white.svg";
import Logo from "@/assets/images/logo/logo.svg";
import Illustration from "@/assets/images/auth/ils1.svg";
import SDLogo from "@/assets/images/logo/sdlogo.svg";

const forgotPass = () => {
  const [isDark] = useDarkMode();
  return (
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
        <div className="right-column relative">
          <div className="inner-content h-full flex flex-col bg-white dark:bg-slate-800">
            <div className="auth-box2 flex flex-col justify-center h-full">
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
                <p className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[50px] mb-2">
                  Forgot Password?
                </p>
                <div className="text-slate-500 text-base sm:text-base md:text-[16px] lg:text-[16px] xl:text-[16px]">
                  Reset Password with SocialDash
                </div>
              </div>
              <div className="font-normal text-base text-slate-500 dark:text-slate-400 text-center px-2 bg-slate-100 dark:bg-slate-600 rounded py-3 mb-4 mt-10">
                Enter your Email and instructions will be sent to you!
              </div>

              <ForgotPass />
              <div className="md:max-w-[345px] mx-auto font-normal text-slate-500 dark:text-slate-400 2xl:mt-12 mt-8 uppercase text-sm flex gap-1">
                Forget It,
                <Link
                  to="/"
                  className="text-slate-900 dark:text-white font-medium hover:underline"
                >
                  Send me Back
                </Link>
                to The Sign In
              </div>
            </div>
            <div className="auth-footer text-center">
              Copyright 2025, SocialDash All Rights Reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default forgotPass;
