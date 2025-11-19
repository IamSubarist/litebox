import React from "react";
import { Link } from "react-router-dom";
import LoginForm from "./common/login-form";
import Social from "./common/social";
import useDarkMode from "@/hooks/useDarkMode";
import { ToastContainer } from "react-toastify";

// image import
import LogoWhite from "@/assets/images/logo/logo-white.svg";
import Logo from "@/assets/images/logo/logo.svg";
import Illustration from "@/assets/images/auth/ils1.svg";
import TestAuthButton from "./TestAuthButton";
import SDLogo from "@/assets/images/logo/sdlogo.svg";

const login = () => {
  const [isDark] = useDarkMode();
  return (
    <>
      <ToastContainer />
      <div className="loginwrapper">
        <div className="lg-inner-column">
          <div className="left-column relative z-[1]">
            {/* <div className="max-w-[520px] pt-10 ltr:pl-10 rtl:pr-20">
              <Link to="/">
                <img
                  src={isDark ? LogoWhite : Logo}
                  alt=""
                  className="mb-10 w-[60%]"
                />
              </Link>
            </div> */}
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
              <div className="auth-box h-full flex flex-col justify-center">
                <div className="mobile-logo text-center mb-6 lg:hidden block">
                  <div className="flex items-center justify-center gap-2">
                    <Link to="/">
                      <img src={SDLogo} alt="" className="mx-auto w-10 h-10" />
                    </Link>
                    <p className="text-2xl font-bold leading-[15px] text-white">
                      LiteBox
                    </p>
                  </div>
                </div>
                <div className="text-center 2xl:mb-5 mb-4">
                  <p className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[54px] mb-2">
                    Sign in
                  </p>
                  <div className="text-slate-500 text-base sm:text-base md:text-[16px] lg:text-[16px] xl:text-[16px]">
                    Sign in to your account to start using LiteBox
                  </div>
                </div>
                <LoginForm />
                <div className="relative border-b-[#9AA2AF] border-opacity-[16%] border-b pt-6">
                  <div className="absolute inline-block bg-white dark:bg-slate-800 dark:text-slate-400 left-1/2 top-1/2 transform -translate-x-1/2 px-4 min-w-max text-sm text-slate-500 font-normal">
                    Or continue with
                  </div>
                </div>
                <div className="max-w-[242px] mx-auto mt-8 w-full">
                  <Social />
                </div>
                {/* <div className="w-full flex items-center justify-center mt-4">
                  <TestAuthButton />
                </div> */}
                <div className="md:max-w-[345px] mx-auto font-normal text-slate-500 dark:text-slate-400 mt-12 uppercase text-sm">
                  Don’t have an account?{" "}
                  <Link
                    to="/register"
                    className="text-slate-900 dark:text-white font-medium hover:underline"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
              <div className="auth-footer text-center">
                Copyright 2025, LiteBox All Rights Reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default login;
