import React, { useState } from "react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

export const ChatMsg = ({ currentUSer, userType, date, index, mesgInfo, id, handleMsgCheckCount, type, downloadUrl, handleDownload }) => {
  const { watch, setValue, getValues } = useFormContext()
  const [inputCheckBox, setInputCheckBox] = useState(watch('mainCheckBox'))
  const watchCheck = watch('mainCheckBox')
  // const currentDate = new Date();
  // const givenDate = new Date(date);

  useEffect(() => {
    if (!watchCheck) {
      setInputCheckBox(false)
    }
  }, [watchCheck])


  // const currentDateFn = () => {
  //   setValue('topDate', false)
  //   const formData = getValues()
  //   const differenceInDays = Math.floor((currentDate - givenDate) / (1000 * 60 * 60 * 24));

  //   if (differenceInDays === 0 && !formData?.topDate) {
  //     setValue('topDate', true)
  //     return 'Today';
  //   } else if (differenceInDays === 1) {
  //     return 'Yesterday';
  //   } else {
  //     return Math.abs(differenceInDays) + ' days ago';
  //   }
  // }





  const calculateDate = (type) => {

    const pastDate = new Date(date)
    let time;
    switch (type) {
      case 'hour':
        time = pastDate.getHours() % 12 ? pastDate.getHours() % 12 : 12
        return time >= 9 ? time : "0".concat(String(time))
      case 'minutes':
        time = pastDate.getMinutes()
        return time >= 9 ? time : "0".concat(String(time))
      case 'dayPass':
        time = pastDate.getHours() >= 12 ? "PM" : "AM"
        return time
      default:
        break;
    }
  }

  return (
    <>
      {/* <div className="flex justify-center my-2">
        <var className="bg-slate-600 text-gray-300 px-4 py-1 rounded-lg text-xs">{currentDateFn()}</var>
      </div> */}
      {
        userType === currentUSer ? (
          mesgInfo && type === 'image' ?
            <>
              <label
                key={index}
                htmlFor={`checkbox`.concat(index)}
                className={`flex align-top ${watchCheck ? 'justify-between hover:bg-gray-500/20 ' : 'justify-end'} px-2 gap-2 py-5 transition-colors duration-150`}
              >
                {watchCheck && <input
                  type="checkbox"
                  value={inputCheckBox}
                  id={`checkbox`.concat(index)}
                  onChange={({ target }) => handleMsgCheckCount({ id, place: index, checked: target.checked })}
                  className={`accent-yellow-300 w-4`}
                />}

                <figure className="relative max-w-[15rem] min-w-[8rem] aspect-auto bg-yellow-300 p-1 rounded rounded-tr-none">
                  <img className="object-contain" loading="lazy" src={mesgInfo} alt="image" />
                  <figcaption className="text-end">
                    <time className="text-xs ">
                      {calculateDate('hour')}:{calculateDate('minutes')} {calculateDate('dayPass')}
                    </time>
                  </figcaption>
                  {downloadUrl?.root && <div className="absolute top-0 left-0 w-full h-full grid place-items-center bg-black/20">
                    <div onClick={() => handleDownload(downloadUrl?.path, id)} className="w-14 h-14 grid place-items-center rounded-full bg-gray-600/50">
                      <ArrowDownTrayIcon className="w-10 text-gray-300" />
                    </div>
                  </div>}
                </figure>
              </label>
            </> :

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
              <div className="flex flex-col items-end">
                <span className="bg-yellow-300 px-2 py-1 min-w-[64px] max-w-[auto] rounded rounded-tr-none whitespace-pre-wrap">
                  {mesgInfo}
                </span>
                <p>
                  <time className="text-xs">
                    {calculateDate('hour')}:{calculateDate('minutes')} {calculateDate('dayPass')}
                  </time>
                </p>
              </div>
            </label>
        ) : (
          mesgInfo && type === "image" ?
            <label
              key={index}
              htmlFor={`checkbox`.concat(index)}
              className={`flex align-top ${watchCheck ? 'justify-between hover:bg-gray-500/20 ' : 'justify-start'} px-2 gap-2 py-5 transition-colors duration-150`}
            >

              <figure className="relative max-w-[15rem] min-w-[8rem] aspect-auto bg-slate-300 p-1 rounded rounded-tr-none">
                <img className="object-contain" loading="lazy" src={mesgInfo} alt="image" />
                <figcaption className="text-end">
                  <time className="text-xs ">
                    {calculateDate('hour')}:{calculateDate('minutes')} {calculateDate('dayPass')}
                  </time>
                </figcaption>
                {downloadUrl?.root && <div className="absolute top-0 left-0 w-full h-full grid place-items-center bg-black/20">
                  <div onClick={() => handleDownload(downloadUrl?.path, id)} className="w-14 h-14 grid place-items-center rounded-full bg-gray-600/50">
                    <ArrowDownTrayIcon className="w-10 text-gray-300" />
                  </div>
                </div>}
              </figure>
              {watchCheck && <input
                type="checkbox"
                value={inputCheckBox}
                id={`checkbox`.concat(index)}
                onChange={({ target }) => handleMsgCheckCount({ id, place: index, checked: target.checked })}
                className={`accent-yellow-300 w-4`}
              />}
            </label>


            :
            <label
              key={index}
              htmlFor={`checkbox`.concat(index)}
              className={`flex align-top  transition-colors duration-150 ${watchCheck ? 'justify-between hover:bg-gray-500/20 ' : 'justify-start'} px-2 gap-2  py-5`}
            >
              <div className="flex flex-col items-start">
                <span className="animate__animated animate__bounceIn bg-slate-300 min-w-[64px] max-w-[auto] px-2 py-1 rounded rounded-tl-none whitespace-pre-wrap">
                  {mesgInfo}
                </span>
                <p>
                  <time className="text-xs">
                    {calculateDate('hour')}:{calculateDate('minutes')} {calculateDate('dayPass')}
                  </time>
                </p>
              </div>

              {watchCheck && <input
                type="checkbox"
                value={inputCheckBox}
                id={`checkbox`.concat(index)}
                onChange={({ target }) => handleMsgCheckCount({ id, place: index, checked: target.checked })}
                className={`accent-yellow-300 w-4`}
              />}
            </label>
        )
      }



    </>
  );
};
