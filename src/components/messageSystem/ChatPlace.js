import React, { useEffect, useRef, useState } from "react";
import { UserIcon, CheckIcon, FolderOpenIcon, TrashIcon } from "@heroicons/react/24/solid";
import { FaceSmileIcon, PaperAirplaneIcon, PhotoIcon, DocumentIcon, UserIcon as UserIconOutline, } from "@heroicons/react/24/outline";
import { ChatMsg } from "./ChatMsg";
import { Form } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import { addDoc, arrayUnion, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, storage } from "../../firebase";
import { useSelector } from "react-redux";
import { userInfo } from "../../feature/userSlice";
import { FormProvider, useForm } from "react-hook-form";
import { deleteObject, getBytes, getDownloadURL, ref, uploadString } from "firebase/storage";
function ChatPlace({ contectDetail, currentState, setContectDetail }) {
  const [userInput, setUserInput] = useState("");
  const methods = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: {
      mainCheckBox: false,
      popOverMedia: false
    }

  })
  const { getValues, setValue, watch, register } = methods
  const watchValue = watch('DeleteMessageData')
  const watchCheck = watch('mainCheckBox')
  const popOverMedia = watch('popUpFolder')
  const chatBoxRef = useRef(null);
  const selector = useSelector(userInfo);
  const [chatBox, setChatBox] = useState([]);
  const fetchData = async () => {
    if (contectDetail) {
      try {
        onSnapshot(query(collection(db, `userChat/${contectDetail?.cominatedId}/${selector?.uid}`), orderBy("timestamp", "asc"),), async snapshot => {
          const renderArray = []
          snapshot.docs.forEach(((data, index) => {
            renderArray.push(data.data())
          }))
          setChatBox([...renderArray])
          setTimeout(() => { chatBoxRef?.current?.scrollIntoView() }, 500)
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
    try {
      if (userInput.trim() == "" || !contectDetail?.cominatedId) return null;
      let id = uuidv4()
      const newMessage = {
        id,
        uid: selector?.uid,
        message: userInput,
        date: new Date().toISOString(),
        timestamp: serverTimestamp(),
      }
      setUserInput("");
      await setDoc(doc(db, `userChat/${contectDetail?.cominatedId}/${selector?.uid}`, id), {
        ...newMessage
      })
      await setDoc(doc(db, `userChat/${contectDetail?.cominatedId}/${contectDetail?.uid}`, id), {
        ...newMessage,

      })

    } catch (error) {
      console.log(error)
    } finally {
      setUserInput('')
    }
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
    try {
      if (watchValue.length) {
        const selectedData = new Set(watchValue)
        const wantDelete = chatBox.filter((data) => selectedData.has(data?.id))
        wantDelete.map(async msg => {
          await deleteDoc(doc(db, `userChat/${contectDetail?.cominatedId}/${selector?.uid}`, msg?.id));
          if (msg?.type === 'image') {
            await deleteObject(ref(storage, msg?.download?.path))
          }
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      setValue('DeleteMessageData', [])
    }
  }

  const handleReduceQuality = async (result) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.filter = "blur(10px)";
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const reducedQualityDataUrl = canvas.toDataURL("image/jpeg", 0.001);
        resolve(reducedQualityDataUrl);
      };
      img.onerror = (error) => {
        reject(error);
      };
    });
  };


  const handleMedia = async ({ target: { files } }) => {
    const file = files[0];
    if (!file?.name) return null;
    if (file?.size > 10 * 1024 * 1024) return alert("Image size is too large.");

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async ({ target: { result } }) => {
      const nameId = uuidv4();
      const imageUrl = ref(storage, `messages/${selector?.uid}/${file?.name.concat(nameId)}`);
      const imageUrl2 = ref(storage, `messages/${contectDetail?.uid}/${file?.name.concat(nameId)}`);
      try {
        const user1 = await uploadString(imageUrl, result, 'data_url');
        const user2 = await uploadString(imageUrl2, result, 'data_url')
        const downloadUrl = await getDownloadURL(imageUrl);
        const reduceImage = await handleReduceQuality(result);
        const id = uuidv4();

        setDoc(doc(db, `userChat/${contectDetail?.cominatedId}/${selector?.uid}`, id), {
          id,
          uid: selector?.uid,
          type: 'image',
          message: downloadUrl,
          date: new Date().toISOString(),
          download: {
            root: false,
            path: user1.ref.fullPath
          },
          timestamp: serverTimestamp()
        })

        setDoc(doc(db, `userChat/${contectDetail?.cominatedId}/${contectDetail?.uid}`, id), {
          id,
          uid: selector?.uid,
          type: 'image',
          message: reduceImage,
          date: new Date().toISOString(),
          download: {
            root: true,
            path: user2.ref.fullPath,
          },
          timestamp: serverTimestamp()
        })

      } catch (error) {
        console.error(error);
      } finally {
        setValue('media', '')
      }
    };
  };

  const handleDownload = async (url, id) => {
    try {
      const imageUrl = ref(storage, url)
      const download = await getDownloadURL(imageUrl)
      await updateDoc(doc(db, `userChat/${contectDetail?.cominatedId}/${selector?.uid}`, id), {
        message: download,
        ['download.root']: false
      })
    } catch (error) {
      console.log(error)
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
          <input id="checkbox" type="checkbox" onChange={({ target }) => setValue('mainCheckBox', target.checked)} className="hidden peer " />
          <TrashIcon onClick={handleDeleteMsg} className="w-7 bg-slate-200 text-red-400 translate-x-9 rounded-lg p-1 peer-checked:translate-x-0 shadow peer-checked:shadow-red-400 transition-all duration-200 ease-in-out" />
          <CheckIcon className="w-7 bg-slate-200 peer-checked:bg-yellow-300 z-10 rounded-lg text-gray-400 p-1 shadow shadow-gray-400 transition-colors duration-200 ease-in-out peer-checked:text-black" />
        </label>
      </header>

      <FormProvider {...methods}>
        <div className="flex-1 px-2 py-3 overflow-y-auto scroll-smooth ">

          {chatBox?.map((items, index) => (
            <ChatMsg handleDownload={handleDownload} downloadUrl={items?.download} handleMsgCheckCount={handleMsgCheckCount} date={items?.date} userType={items?.uid} type={items?.type} currentUSer={selector?.uid} id={items?.id} index={index} mesgInfo={items?.message} key={index} />
          ))}
          <div ref={chatBoxRef} className="text-xs text-black/50 text-center invisible">All message are encrypted</div>
        </div>
      </FormProvider>


      <Form
        onSubmit={handleInput}
        className="flex items-center gap-2 bg-slate-300 group"
      >
        <div className="flex items-center w-full p-3 gap-3 ">
          <FaceSmileIcon className="w-6 text-gray-700" />
          <div className="group relative">
            <section className="list-none" onClick={() => setValue('popUpFolder', !popOverMedia)}>
              <FolderOpenIcon className="w-6 text-gray-700 cursor-pointer" />
            </section>
            <ul className={`absolute -top-5   ${popOverMedia ? '-translate-y-full opacity-100' : '-translate-y-0 pointer-events-none opacity-0'} transition-all duration-200 bg-gray-600 text-white  rounded-sm`}>
              {[['Photos & Videos', PhotoIcon, 'image/*,video/mp4,video/3gpp,video/quicktime'], ['Document', DocumentIcon, '*'], ['Contant', UserIcon, false]].map(([text, Icon, access], index) => (
                <li key={index} className=" hover:bg-gray-700 p-2 transition-colors ">
                  <label htmlFor={text} className="flex items-center gap-2 cursor-pointer">
                    <Icon className="w-5 " />
                    <p className="w-max">{text}</p>
                    {access && <input id={text} name="media" {...register('media')} onChange={handleMedia} accept={access} type="file" hidden />}
                  </label>
                </li>
              ))
              }
            </ul>
          </div>

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
