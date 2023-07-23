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
function ChatPlace({ contectDetail, currentState, setContectDetail }) {
  const [userInput, setUserInput] = useState("");
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
        const collectionRef = collection(db, 'user')
        const queryData = query(collectionRef, where('contectUser', 'in', [contectDetail?.cominatedId]))
        onSnapshot(doc(db, 'chats', contectDetail?.cominatedId), async snapshot => {
          setChatBox(snapshot?.data()?.messages)
          chatBoxRef?.current?.scrollIntoView()
        })
        const getDocsData = await getDocs(queryData)
        console.log(getDocsData.docs)
        getDocsData.docs.map((data) => {
          console.log(getDocsData.docs)
        })
      } catch (error) {
        console.log(error)
      }

    }
  }

  useEffect(() => {

    fetchData()
    chatBoxRef?.current?.scrollIntoView()
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
    if (userInput.trim() == "") return null;
    const newData = {
      userType: selector?.uid,
      id: uuidv4(),
      mesgInfo: {
        msg: {
          user1: userInput,
          user2: userInput,
        },
        date: new Date().toISOString(),
      },
    };
    await updateDoc(doc(db, 'chats', contectDetail?.cominatedId), {
      messages: arrayUnion({ ...newData })
    })
    setUserInput("");
  };

  const handleMsgCheckCount = (value) => {
    if (value?.bool && value?.checked) {
      const newArray = {
        id: value?.id,
        place: value?.place
      }
      checkBox.selectedData.push(newArray)
      setCheckBox({ ...checkBox })
    } else {
      if (checkBox.selectedData.length) {
        const newArray = checkBox.selectedData.filter((item) => item?.id !== value?.id)
        checkBox.selectedData = [...newArray]
        setCheckBox(checkBox)
      }
    }
  }

  const handleDeleteMsg = async () => {

    if (checkBox.selectedData.length) {
      const updatedArray = await Promise.all(chatBox.map(async item => {
        const newItem = checkBox.selectedData.find(newItem => newItem.id === item.id);
        if (newItem) {
          const emptyItem = item.userType === selector.uid ? item.mesgInfo.msg.user1 === null : item.mesgInfo.msg.user2 === null;
          if (emptyItem) {
            await updateDoc(doc(db, 'chats', contectDetail.cominatedId), {
              messages: arrayRemove(item)
            }).catch((e) => console.log(e));
            return null; // Return null to filter out the item from the array
          } else {
            return {
              ...item,
              mesgInfo: {
                ...item.mesgInfo,
                msg: {
                  ...item.mesgInfo.msg,
                  [`user${item.userType === selector.uid ? 2 : 1}`]: null // or any other value you want to set for user2
                }
              }
            };
          }
        }
        return item;
      }));

      const filteredArray = updatedArray.filter(item => item !== null); // Filter out the null items

      await updateDoc(doc(db, 'chats', contectDetail.cominatedId), {
        messages: filteredArray
      });
      checkBox.checkBox = false
      checkBox.selectedData = []
      setCheckBox(checkBox)
    }
  }

  return (
    <div className={`flex-1 flex flex-col w-full max-md:absolute transition-transform max-md:translate-x-full ${!contectDetail ? 'max-md:translate-x-full' : 'max-md:translate-x-0 bg-slate-400'} max-md:h-full`}>
      <header className="flex items-center bg-slate-300 justify-between p-2 ">
        <section className="flex items-center gap-3">
          {!contectDetail?.photoUrl ?
            <UserIcon className="w-10 bg-gray-400 rounded-full text-gray-200 p-[7px]" /> :
            <img src={contectDetail?.photoUrl} className="rounded-full w-10 h-10" alt="" />
          }
          <h5 className="font-medium">{contectDetail?.displayName}</h5>
        </section>
        <label htmlFor="checkbox" className="flex items-center gap-2">
          <input id="checkbox" type="checkbox" value={checkBox.checkBox} onChange={(e) => setCheckBox(preVal => ({ ...preVal, checkBox: e.target.checked }))} className="hidden peer " />
          <TrashIcon onClick={handleDeleteMsg} className="w-7 bg-slate-200 text-red-400 translate-x-9 rounded-lg p-1 peer-checked:translate-x-0 shadow peer-checked:shadow-red-400 transition-all duration-200 ease-in-out" />
          <CheckIcon className="w-7 bg-slate-200 peer-checked:bg-yellow-300 z-10 rounded-lg text-gray-400 p-1 shadow shadow-gray-400 transition-colors duration-200 ease-in-out peer-checked:text-black" />
        </label>
      </header>

      <div className="flex-1 px-2 py-3 overflow-y-auto scroll-smooth ">
        {chatBox?.map((items, index) => (
          <ChatMsg currentUSer={selector?.uid} handleMsgCheckCount={handleMsgCheckCount} id={items?.id} msgCheckBox={checkBox.checkBox} index={index} mesgInfo={items?.mesgInfo} userType={items?.userType} key={index} />
        ))}
        <div ref={chatBoxRef} className="text-xs text-black/50 text-center invisible mt-8">All message are encrypted</div>
      </div>

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
