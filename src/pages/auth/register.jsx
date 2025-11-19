import React from "react";
import { Link } from "react-router-dom";
import useDarkMode from "@/hooks/useDarkMode";
import RegForm from "./common/reg-from";
import Social from "./common/social";
import { ToastContainer } from "react-toastify";
// image import
import LogoWhite from "@/assets/images/logo/logo-white.svg";
import Logo from "@/assets/images/logo/logo.svg";
import Illustration from "@/assets/images/auth/ils1.svg";
import SDLogo from "@/assets/images/logo/sdlogo.svg";

const register = () => {
  const [isDark] = useDarkMode();
  return (
    <>
      <ToastContainer />

      <div className="loginwrapper overflow-x-hidden">
        <div className="lg-inner-column overflow-x-hidden">
          <div className="left-column relative z-[1]">
            <div className="absolute left-0 top-1/2 translate-y-[-50%] h-full w-full z-[-1] flex justify-center items-center">
              <img
                src={"/icons/socseti.jpeg"}
                alt=""
                className="h-full w-[95%] object-contain"
              />
            </div>
          </div>
          <div className="right-column relative bg-white dark:bg-slate-800 overflow-x-hidden">
            <div className="inner-content h-full flex flex-col bg-white dark:bg-slate-800 overflow-x-hidden">
              <div className="auth-box h-full flex flex-col justify-center overflow-x-hidden">
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
                <div className="text-center 2xl:mb-5 mb-4 px-2">
                  <p className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[54px] mb-2 break-words">
                    Sign up
                  </p>
                  <div className="text-slate-500 text-base sm:text-base md:text-[16px] lg:text-[16px] xl:text-[16px] break-words px-2">
                    Create an account to start using SocialDash
                  </div>
                </div>
                <RegForm />
                <div className=" relative border-b-[#9AA2AF] border-opacity-[16%] border-b pt-6">
                  <div className=" absolute inline-block  bg-white dark:bg-slate-800 left-1/2 top-1/2 transform -translate-x-1/2 px-4 min-w-max text-sm  text-slate-500  dark:text-slate-400font-normal ">
                    Or continue with
                  </div>
                </div>
                <div className="max-w-[242px] mx-auto mt-8 w-full">
                  <Social />
                </div>
                <div className="mx-auto font-normal text-slate-500 dark:text-slate-400 2xl:mt-12 mt-6 uppercase text-sm flex gap-1 flex-wrap justify-center px-2">
                  <span className="break-words">Already registered?</span>
                  <Link
                    to="/"
                    className="text-slate-900 dark:text-white font-medium hover:underline break-words"
                  >
                    Sign In
                  </Link>
                </div>
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

export default register;
