import React, { useEffect, useRef, useState } from "react";
import { UserIcon, CheckIcon, FolderOpenIcon, TrashIcon } from "@heroicons/react/24/solid";
import { FaceSmileIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { ChatMsg } from "./ChatMsg";
import { Form } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import { arrayRemove, arrayUnion, collection, doc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { db } from "../../firebase";
import { useSelector } from "react-redux";
import { userInfo } from "../../feature/userSlice";
import { FormProvider, useForm } from "react-hook-form";
function ChatPlace({ contectDetail, currentState, setContectDetail }) {
  const [userInput, setUserInput] = useState("");
  const methods = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: {
      mainCheckBox: false,
    }
  })
  const { getValues, setValue, watch, reset } = methods
  const watchValue = watch('DeleteMessageData')
  const watchCheck = watch('mainCheckBox')
  const chatBoxRef = useRef(null);
  const selector = useSelector(userInfo);
  const [checkBox, setCheckBox] = useState({
    checkBox: false,
    selectedData: []
  })
  const [chatBox, setChatBox] = useState([]);


  const fetchData = async () => {
    if (contectDetail) {
      try {
        onSnapshot(doc(db, 'userChat', contectDetail?.cominatedId), async snapshot => {
          setValue('admin', snapshot?.data()?.createrId)
          const currentChat = snapshot?.data()?.createrId === selector?.uid ? snapshot?.data()?.user1 : snapshot?.data()?.user2
          const jsonArrayString = `[${currentChat?.join(',')}]`;
          setChatBox(JSON.parse(jsonArrayString))
        })
      } catch (error) {
        console.log(error)
      }
    }
  }

  useEffect(() => {
    fetchData()
  }, [contectDetail]);

  useEffect(() => {
    if (!currentState && contectDetail) {
      if (window?.innerWidth <= 768) {
        setContectDetail()
        setChatBox([])
      }
    }
  }, [currentState])

  const handleInput = async (e) => {
    e.preventDefault();
    if (userInput.trim() == "" || !contectDetail?.cominatedId) return null;
    let id = uuidv4()
    const newMessage = [id, {
      id,
      uid: selector?.uid,
      message: userInput,
      date: new Date().toISOString(),
    }]
    await updateDoc(doc(db, 'userChat', contectDetail?.cominatedId), {
      user1: arrayUnion(JSON.stringify(newMessage)),
      user2: arrayUnion(JSON.stringify(newMessage))
    })
    chatBoxRef?.current?.scrollIntoView()
    setUserInput("");
  };

  const handleMsgCheckCount = (value) => {
    if (watchCheck && value?.checked) {
      setValue('DeleteMessageData', watchValue ? [...watchValue, value?.id] : [value?.id]);
    } else {
      if (watchValue?.length) {
        const deleteSetFn = new Set(watchValue)
        deleteSetFn.delete(value?.id)
        setValue('DeleteMessageData', Array.from(deleteSetFn.values()))
      }
    }
  }

  const handleDeleteMsg = async () => {
    if (watchValue.length) {
      const createrId = getValues('admin');
      const chatMap = new Map(chatBox);
      const selectedData = new Set(watchValue);

      const currentChat = Array.from(selectedData)
        .filter(value => chatMap.has(value))
        .map(value => JSON.stringify([value, chatMap.get(value)]));

      await updateDoc(doc(db, 'userChat', contectDetail.cominatedId), {
        [`user${createrId === selector?.uid ? '1' : '2'}`]: arrayRemove(...currentChat)
      });
      setValue('DeleteMessageData', [])
    }
  }



  return (
    <div className={`flex-1 flex flex-col w-full max-md:absolute transition-transform bg-slate-400 ${contectDetail ? 'max-md:translate-x-0' : 'max-md:translate-x-full'}  max-md:h-full`}>
      <header className="flex items-center bg-slate-300 justify-between p-2 ">
        <section className="flex items-center gap-3">
          {!contectDetail?.photoUrl ?
            <UserIcon className="w-10 bg-gray-400 rounded-full text-gray-200 p-[7px]" /> :
            <img src={contectDetail?.photoUrl} className="rounded-full w-10 h-10" alt="" />
          }
          <h5 className="font-medium">{contectDetail?.displayName}</h5>
        </section>
        <label htmlFor="checkbox" className="flex items-center gap-2">
          <input id="checkbox" type="checkbox" value={checkBox.checkBox} onChange={({ target }) => setValue('mainCheckBox', target.checked)} className="hidden peer " />
          <TrashIcon onClick={handleDeleteMsg} className="w-7 bg-slate-200 text-red-400 translate-x-9 rounded-lg p-1 peer-checked:translate-x-0 shadow peer-checked:shadow-red-400 transition-all duration-200 ease-in-out" />
          <CheckIcon className="w-7 bg-slate-200 peer-checked:bg-yellow-300 z-10 rounded-lg text-gray-400 p-1 shadow shadow-gray-400 transition-colors duration-200 ease-in-out peer-checked:text-black" />
        </label>
      </header>
      <FormProvider {...methods}>
        <div className="flex-1 px-2 py-3 overflow-y-auto scroll-smooth ">
          {chatBox?.map(([id, items], index) => (
            <ChatMsg handleMsgCheckCount={handleMsgCheckCount} userType={items?.uid} currentUSer={selector?.uid} id={id} msgCheckBox={checkBox.checkBox} index={index} mesgInfo={items?.message} key={index} />
          ))}
          <div ref={chatBoxRef} className="text-xs text-black/50 text-center invisible ">All message are encrypted</div>
        </div>
      </FormProvider>


      <Form
        onSubmit={handleInput}
        className="flex items-center gap-2 bg-slate-300 group"
      >
        <div className="flex items-center w-full p-3 gap-3 ">
          <FaceSmileIcon className="w-6 text-gray-700" />
          <FolderOpenIcon className="w-6 text-gray-700" />
          <div className="w-full flex items-center  rounded-sm p-1 ">
            <input
              required
              className="border-none bg-transparent h-full w-full outline-none caret-slate-500"
              type="text"
              placeholder="Type a message"
              value={userInput}
              onInput={(e) => setUserInput(e.currentTarget.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-slate-300 border-l shadow shadow-slate-300 group-focus-within:group-invalid:shadow-red-200 transition-colors duration-200 ease-out  h-full w-16 flex items-center justify-center"
        >
          <PaperAirplaneIcon className="w-8 p-1 text-gray-700 " />
        </button>
      </Form>

    </div>
  );
}

export default ChatPlace;
