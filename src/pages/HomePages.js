import { ArrowRightIcon } from "@heroicons/react/24/outline";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLoaderData } from "react-router-dom";
import { tokenAccessCheck, userInfo } from "../feature/userSlice";
import { useTypewriter } from "react-simple-typewriter";
import { motion } from "framer-motion";
function HomePages() {
  const token = useSelector(tokenAccessCheck);
  const selector = useSelector(userInfo) ?? {};

  const [text, count] = useTypewriter({
    words: [
      selector?.name ?? "Dear user",
      (selector?.name ?? "").toUpperCase(),
    ],
    loop: true,
    delaySpeed: 6000,
    deleteSpeed: 150,
    typeSpeed: 150,
  });

  const navigate = useNavigate();
  return (
    <div className="h-[90vh] scroll flex items-center ">
      <motion.div
        initial={{
          x: 500,
          y: 50,
        }}
        animate={{
          x: 300,
          y: 50,
        }}
        transition={{
          duration: 1,
        }}
        className="fixed max-[990px]:w-[30rem] max-[990px]:h-[30rem] transition-all duration-200  max-[990px]:-translate-y-20 w-[50rem] h-[50rem] rounded-full bg-[#fde047] max-[990px]:bg-[#ffe358] right-0 top-0 "
      >
        <motion.img
          initial={{
            x: -80,
            filter: "drop-shadow(25px 19px 17px #000)",
            y: 120,
          }}
          animate={{
            x: -80,
            filter: "drop-shadow(27px 21px 17px #000)",
            y: 125,
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 1,
          }}
          className="absolute max-[990px]:w-[20rem] w-[30rem] -translate-x-20 translate-y-32"
          src={require("../images/uiuxH.png")}
        />
      </motion.div>

      <article className="z-10 text-white ml-10  w-[38rem] space-y-6 mt-3">
        <motion.h1
          initial={{
            x: -500,
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            x: 0,
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.5,
          }}
          className="text-5xl font-bold  capitalize leading-tight"
        >
          share your thoughts with photo's
        </motion.h1>

        <div className="text-gray-300 font-semibold w-[78%] lg:w-full">
          {!token?.accessToken ? (
            <motion.div
              initial={{
                x: -500,
                opacity: 0,
                scale: 0.5,
              }}
              animate={{
                x: 0,
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.3,
              }}
              className="w-full"
            >
              <span> If you were looking for a sign, here it is.</span>
              <span>
                {" "}
                ” “Remember that happiness is a way of travel – not a
                destination.” “Just because you're awake doesn't mean you should
                stop dreaming.
              </span>
              <span>” “Be yourself, there's no one better</span>
            </motion.div>
          ) : (
            <div>
              <span>Welcome to shareme website, </span>
              <span
                style={{
                  width: (selector?.name?.length * 10 + 5).toString() + "px",
                }}
                className={`text-yellow-300 text-center inline-block`}
              >
                {text}
              </span>
              <span>
                {" "}
                We're so glad to have you join our community. You can start
                sharing your photos and connecting with{" "}
              </span>
              <span>
                others right away. To upload a photo, simply click the button
                and choose a file from your computer. We can't wait to see what
                you'll share!
              </span>
            </div>
          )}
        </div>
        <motion.section
          initial={{
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.3,
          }}
          onClick={() =>
            !token?.accessToken ? navigate("/auth") : navigate("product")
          }
          className="flex items-center w-[10rem] group outline-none cursor-pointer hover:outline-white hover:outline-1 hover:bg-transparent  transition-all duration-300 bg-yellow-300 p-2"
        >
          <button className="w-full text-black  group-hover:text-white rounded-md font-bold  capitalize">
            {!token?.accessToken ? "signUp" : "get started"}
          </button>
          <ArrowRightIcon className="w-6 text-black group-hover:text-white " />
        </motion.section>
      </article>
    </div>
  );
}

export default HomePages;
