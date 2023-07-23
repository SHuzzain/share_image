import React, { forwardRef, useState } from "react";
import { useEffect } from "react";

export const ChatMsg = ({ currentUSer, msgCheckBox, userType, index, mesgInfo, id, handleMsgCheckCount }) => {

  const [inputCheckBox, setInputCheckBox] = useState(false)


  useEffect(() => {
    if (msgCheckBox) {
      handleMsgCheckCount({ id, place: index, bool: msgCheckBox, checked: inputCheckBox })
    } else {
      handleMsgCheckCount({ id, place: index, bool: msgCheckBox, checked: inputCheckBox })
      setInputCheckBox(msgCheckBox)
    }
  }, [inputCheckBox, msgCheckBox])
  return (
    <>
      {
        userType === currentUSer ? (

          mesgInfo?.msg?.user2 ?
            <label
              key={index}
              htmlFor={`checkbox`.concat(index)}
              className={`flex align-top ${msgCheckBox ? 'justify-between hover:bg-gray-500/20 ' : 'justify-end'} px-2 gap-2 py-5 transition-colors duration-150`}
            >
              {msgCheckBox && <input
                type="checkbox"
                onChange={(e) => setInputCheckBox(e.currentTarget.checked)}
                id={`checkbox`.concat(index)}
                className={`accent-yellow-300 w-4`}
              />}
              <span className="animate__animated animate__bounceIn bg-yellow-300 px-2 py-1 min-w-[64px] max-w-[auto] rounded rounded-tr-none whitespace-pre-wrap">
                {mesgInfo?.msg.user2}
              </span>
            </label> : null

        ) : (
          mesgInfo?.msg?.user1 ? <label
            key={index}
            htmlFor={`checkbox`.concat(index)}
            className={`flex align-top  transition-colors duration-150 ${msgCheckBox ? 'justify-between hover:bg-gray-500/20 ' : 'justify-start'} px-2 gap-2  py-5`}
          >
            <span className="animate__animated animate__bounceIn bg-slate-300 min-w-[64px] max-w-[auto] px-2 py-1 rounded rounded-tl-none whitespace-pre-wrap">
              {mesgInfo?.msg.user1}
            </span>
            {msgCheckBox && <input
              type="checkbox"
              id={`checkbox`.concat(index)}
              onChange={(e) => setInputCheckBox(e.currentTarget.checked)}
              className={`accent-yellow-300 w-4`}
            />}
          </label> : null
        )
      }

    </>
  );
};
