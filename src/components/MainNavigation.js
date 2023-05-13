import {
  Bars3Icon,
  CameraIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useState, useTransition } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import { prodectFilter } from "../feature/ProdectSlice";
import { logout, tokenAccessCheck, userInfo } from "../feature/userSlice";
import { animate, color, motion } from "framer-motion";

function MainNavigation() {
  const loactionPath = useLocation();
  const [isPanding, startTransition] = useTransition();
  const [asideNav, setAsideNav] = useState(false);
  const selector = useSelector(userInfo);
  const [searchToggle, setSearchToggle] = useState(false);
  const dispatch = useDispatch();
  const token = useSelector(tokenAccessCheck);

  const handleSignOut = () => {
    dispatch(logout());
  };

  const handleChangeInput = (e) => {
    startTransition(() => {
      dispatch(
        prodectFilter({
          searchValue: e.target.value.trim(),
        })
      );
    });
  };

  const handleResposiveToggle = () => {
    setAsideNav(!asideNav);
  };

  const handleSearchToggle = () => {
    setSearchToggle(true);
  };
  useEffect(() => {
    setSearchToggle(false);
  }, [loactionPath.pathname]);

  return (
    <>
      <nav
        className={`max-lg:nav-bar  justify-between  absolute top-0 bg-black  text-white items-center w-full flex text-[16px] p-5 shadow shadow-slate-800 `}
      >
        <section className="flex  gap-5 items-center mr-5 lg:flex-[0.5]">
          <h3 className="cursor-pointer mx-2 mr-4 font-medium text-lg">
            <NavLink to={".."} className="flex items-center gap-1">
              <motion.section
                initial={{
                  scaleX: 0,
                  color: "white",
                }}
                animate={{
                  scaleX: 1,
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: "loop",
                  repeatDelay: 10,
                }}
                className="w-10 rounded-full p-1 bg-yellow-300"
              >
                <motion.div
                  initial={{
                    scaleY: 0,
                  }}
                  animate={{
                    scaleY: 1,
                    color: "black",
                  }}
                  transition={{
                    duration: 0.2,
                    repeat: Infinity,
                    repeatType: "loop",
                    repeatDelay: 12,
                  }}
                >
                  <CameraIcon />
                </motion.div>
              </motion.section>

              <h4 className="font-mono text-[19px] tracking-wide max-sm:hidden">
                shareme
              </h4>
            </NavLink>
          </h3>

          <label
            htmlFor=""
            className={`max-w-[18rem] min-w-[auto] rounded-full `}
          >
            <section
              className={`flex items-center  transition-all duration-500 cursor-pointer ${
                searchToggle ? "w-full" : "w-14"
              } relative shadow-yellow-300 shadow-sm rounded-full `}
            >
              <MagnifyingGlassIcon
                onClick={handleSearchToggle}
                className={`w-14 text-xl p-2 h-10 ${
                  searchToggle
                    ? "rounded-bl-none rounded-tl-none "
                    : "shadow-sm shadow-yellow-300 ml-auto"
                } right-0 rounded-full absolute  bg-black text-white font-bold `}
              />
              <input
                onChange={(e) => handleChangeInput(e)}
                placeholder="Search"
                className={`placeholder:text-base pl-2 h-10 w-full bg-transparent rounded-full outline-none text-white `}
                type="text"
              />
            </section>
          </label>
        </section>

        {!token?.accessToken ? (
          <section
            className={` mr-3 md:px-[10px] ms:py-[6px] p-[6px] grid place-items-center  w-16  rounded-full md:w-40 bg-yellow-300 font-medium md:rounded-md`}
          >
            <button className=" text-slate-700 ">
              <NavLink to={"product"}>
                <UserGroupIcon className="w-9 p-1 flex md:hidden" />{" "}
                <h5 className="md:flex hidden">public community</h5>
              </NavLink>
            </button>
          </section>
        ) : (
          <section>
            <div
              onClick={handleResposiveToggle}
              className="cursor-pointer max-lg:block hidden"
            >
              {asideNav ? (
                <XMarkIcon className="w-10" />
              ) : (
                <Bars3Icon className="w-10" />
              )}
            </div>

            <ul
              className={`[&>*]:cursor-pointer flex-row-reverse lg:flex-[0.3] max-lg:hidden h-[3rem] flex justify-between items-center gap-8  capitalize font-normal text-sm `}
            >
              <li>
                {" "}
                <NavLink
                  to={"product"}
                  className={({ isActive }) =>
                    !isActive
                      ? "px-[10px] py-[6px] bg-yellow-400 rounded-md"
                      : "px-[10px] py-[6px] bg-yellow-500 text-slate-200 rounded-sm"
                  }
                >
                  public community
                </NavLink>
              </li>
              <li>
                {" "}
                <NavLink
                  onClick={handleSignOut}
                  className=" border-2 border-white px-[10px] py-[6px] rounded-md hover:bg-white hover:text-black hover:rounded transition-all duration-200"
                >
                  signOut
                </NavLink>
              </li>
              <li className="group ">
                {" "}
                <NavLink
                  to={"profile"}
                  className={({ isActive }) =>
                    !isActive
                      ? "nav_btn flex items-center flex-col [&>img]:ring-4 [&>img]:ring-[#000000]"
                      : "nav_btn [&>img]:ring-4 [&>img]:ring-[#c8a310] [&>span]:ring-4 [&>span]:ring-[#c8a310]"
                  }
                >
                  {!selector?.photoUrl ? (
                    <span className="nav_leftProfileIcon text-sm flex items-center justify-center">
                      <span>{selector?.email[0]}</span>
                    </span>
                  ) : (
                    <img
                      src={selector?.photoUrl}
                      alt="profile pic"
                      className="nav_leftProfileIcon "
                    />
                  )}
                  <p className="scale-x-[0.0] absolute group-hover:scale-x-[1] delay-200 [&:not(:hover)]:delay-75 transition-all w-20 bottom-0 left-0 -translate-x-2">
                    user Info
                  </p>
                </NavLink>
              </li>
              {/* <li> <NavLink  to={'help'}  className={({isActive}) => !isActive ? 'nav_btn' : 'nav_btn_active'} >help</NavLink></li> */}
            </ul>

            <aside className="max-lg:aside_nav lg:hidden">
              <ul
                className={`[&>*]:cursor-pointer max-lg:aside_nav lg:translate-x-0 ${
                  asideNav ? "translate-x-0 w-[40%]" : "-translate-x-[100%]"
                } flex justify-between items-center gap-8 capitalize font-medium`}
              >
                <li>
                  {" "}
                  <NavLink
                    to={"product"}
                    className={({ isActive }) =>
                      !isActive ? "nav_btn" : "nav_btn_active"
                    }
                  >
                    public community
                  </NavLink>
                </li>
                <li>
                  {" "}
                  <NavLink
                    to={"profile"}
                    className={({ isActive }) =>
                      !isActive ? "nav_btn" : "nav_btn_active"
                    }
                  >
                    person info
                  </NavLink>
                </li>
                <li>
                  {" "}
                  <NavLink onClick={handleSignOut} className="nav_btn">
                    signOut
                  </NavLink>
                </li>
                <li>
                  {" "}
                  <NavLink
                    to={"help"}
                    className={({ isActive }) =>
                      !isActive ? "nav_btn" : "nav_btn_active"
                    }
                  >
                    help
                  </NavLink>
                </li>
              </ul>
            </aside>
          </section>
        )}
      </nav>
    </>
  );
}

export default MainNavigation;
