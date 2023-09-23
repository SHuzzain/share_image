import React, { useCallback, useState } from "react";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
export const ArrowToggle = ({ toggle, currentState, setContectDetail }) => {
  const [positionY, setpositionY] = useState(300);
  const handleEnd = (e) => {
    if (e.clientY < 120) {
      setpositionY((preVal) => (preVal = 120));
    } else if (e.clientY > 785) {
    } else {
      setpositionY((preVal) => {
        preVal = e.clientY;
        return preVal;
      });
    }
    window.innerWidth <= 768 && setContectDetail('')

  };

  return (
    <div
      draggable={true}
      onClick={() => {
        toggle(!currentState);
      }}
      style={{
        top: positionY,
      }}
      onDragEnd={handleEnd}
      className={`absolute ${currentState ? 'max-md:border max-md:border-slate-700/25 max-md:rounded-tl-none max-md:rounded-bl-none max-md:shadow-md' : 'max-lg:-left-10 max-lg:w-20 max-lg:justify-start'} lg:-left-10 left-0 lg:w-20 w-10 h-10 rounded bg-slate-400 lg:bg-slate-300 lg:z-[-1] z-10 flex items-center lg:justify-start justify-end`}
    >
      <ChevronLeftIcon
        className={`w-8 ${currentState ? "rotate-180" : "rotate-0"
          } transition-[transform] duration-200 ease-linear `}
      />
    </div>
  );
};
