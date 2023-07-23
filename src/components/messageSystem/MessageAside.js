import React, { useEffect, useRef, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { PencilSquareIcon, FunnelIcon } from "@heroicons/react/24/solid";
import ContactList from "./ContactList";
import { ArrowToggle } from "./ArrowToggle";
import { useRecoilState } from "recoil";
import { messageAsideMenu } from "../../atom/Toggle";
import ChatPlace from "./ChatPlace";
import { useDeferredValue } from "react";

export const MessageAside = () => {
  const [contectDetail, setContectDetail] = useState();
  const [mTogglem, setMTogglem] = useRecoilState(messageAsideMenu);
  const [input, setInput] = useState('')
  const searchInput = useDeferredValue(input)
  const asideNav = useRef(null);
  const [chatPlaceToggle, setChatplaceToggle] = useState(false)
  const hideOnClick = (event) => {
    if (!asideNav.current.contains(event.target) && mTogglem) {
      setMTogglem(!mTogglem);
    }
  };

  const handleChat = (data) => {
    setContectDetail(data)
  }

  return (
    <div
      onClick={hideOnClick}
      className={`fixed h-screen  top-0 right-0 z-50  transition-[width] duration-300 ease-in-out ${mTogglem ? " w-full" : "w-0"
        }`}
    >
      <main
        ref={asideNav}
        className={`${"lg:min-w-[auto] lg:max-w-[55rem] w-full"} h-full ml-auto mt-0 bg-slate-400 flex`}
      >
        <div className="flex flex-1 relative align-top ">
          <aside className="bg-slate-300 w-full py-2 pt-0 px-4  cursor-pointer shadow shadow-slate-500">
            <header className="flex flex-col gap-3 bg-slate-300 mt-3">
              <div className="flex items-center">
                <h3 className="flex-1 text-lg font-medium">Charts</h3>
                <section className="flex items-center gap-8">
                  <PencilSquareIcon className="w-5" />
                  <FunnelIcon className="w-5" />
                </section>
              </div>
              <div>
                <section className="bg-white flex items-center border-b-2 rounded-sm p-1 border-slate-400 focus-within:border-yellow-400 transition-colors duration-150">
                  <input
                    className="border-none bg-transparent h-full w-full outline-none"
                    type="text"
                    value={input}
                    onChange={(e) =>
                      setInput(e.currentTarget.value)
                    }
                  />
                  <MagnifyingGlassIcon className="w-5 -scale-x-100 p-[2px]" />
                </section>
              </div>
            </header>
            <ContactList setChatplaceToggle={setChatplaceToggle} handleChat={handleChat} setInput={setInput} searchInput={searchInput} />
          </aside>
          <ArrowToggle toggle={setMTogglem} currentState={mTogglem} />
        </div>

        <ChatPlace currentState={mTogglem} contectDetail={contectDetail} setContectDetail={setContectDetail} />
      </main>
    </div>
  );
};
