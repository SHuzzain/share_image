import React, { forwardRef, useState } from "react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

export const ChatMsg = ({ currentUSer, msgCheckBox, userType, index, mesgInfo, id, handleMsgCheckCount }) => {
  const { watch } = useFormContext()
  const [inputCheckBox, setInputCheckBox] = useState(watch('mainCheckBox'))
  const watchCheck = watch('mainCheckBox')
  useEffect(() => {
    if (!watchCheck) {
      setInputCheckBox(false)
    }
  }, [watchCheck])



  return (
    <>
      {
        userType === currentUSer ? (
          mesgInfo ?
            <label
              key={index}
              htmlFor={`checkbox`.concat(index)}
              className={`flex align-top ${watchCheck ? 'justify-between hover:bg-gray-500/20 ' : 'justify-end'} px-2 gap-2 py-5 transition-colors duration-150`}
            >
              {watchCheck && <input
                type="checkbox"
                value={inputCheckBox}
                onChange={({ target }) => handleMsgCheckCount({ id, place: index, checked: target.checked })}
                id={`checkbox`.concat(index)}
                className={`accent-yellow-300 w-4`}
              />}
              <span className="animate__animated animate__bounceIn bg-yellow-300 px-2 py-1 min-w-[64px] max-w-[auto] rounded rounded-tr-none whitespace-pre-wrap">
                {mesgInfo}
              </span>
            </label> : null

        ) : (
          mesgInfo ? <label
            key={index}
            htmlFor={`checkbox`.concat(index)}
            className={`flex align-top  transition-colors duration-150 ${watchCheck ? 'justify-between hover:bg-gray-500/20 ' : 'justify-start'} px-2 gap-2  py-5`}
          >
            <span className="animate__animated animate__bounceIn bg-slate-300 min-w-[64px] max-w-[auto] px-2 py-1 rounded rounded-tl-none whitespace-pre-wrap">
              {mesgInfo}
            </span>
            {watchCheck && <input
              type="checkbox"
              value={inputCheckBox}
              id={`checkbox`.concat(index)}
              onChange={({ target }) => handleMsgCheckCount({ id, place: index, checked: target.checked })}
              className={`accent-yellow-300 w-4`}
            />}
          </label> : null
        )
      }

    </>
  );
};
