import { arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import React from "react";
import { useEffect } from "react";
import { db } from "../../firebase";
import { useState } from "react";
import { useSelector } from "react-redux";
import { userInfo } from "../../feature/userSlice";
import Loading from 'react-loading'
function ContactList({ searchInput, setInput, handleChat }) {

  const [contectList, setContectList] = useState([])
  const [searchContectList, setSearchContectList] = useState([])
  const selector = useSelector(userInfo);
  const [loading, setLoading] = useState(false)

  const getDataSearch = async () => {
    setLoading(true)
    const collectionRef = collection(db, 'user')
    const queryData = query(collectionRef, where("displayName", '==', searchInput))
    const getDocsData = await getDocs(queryData)
    setSearchContectList(getDocsData.docs)
    setLoading(false)
  }

  useEffect(() => {
    searchInput && getDataSearch()
  }, [searchInput])



  useEffect(() => {
    const getListContact = async () => {
      if (selector?.uid) {
        onSnapshot(doc(db, 'user', selector?.uid), async snapshot => {
          setContectList(snapshot?.data()?.contectUser)
        })
      }

    }
    getListContact()
  }, [selector?.uid])

  const handleAddContact = async (data) => {
    if (selector?.uid) {
      setLoading(true)
      delete data?.timestamp
      const cominatedId = data?.uid > selector?.uid ? data?.uid + selector?.uid : selector?.uid + data?.uid
      setSearchContectList([])
      await updateDoc(doc(db, "user", selector?.uid), {
        contectUser: arrayUnion({
          ...data,
          lastSeen: NaN,
          lastMessage: '',
          cominatedId,
        })
      });

      const res = await getDoc(doc(db, 'chats', cominatedId))
      if (!res.exists()) {
        await setDoc(doc(db, 'chats', cominatedId), {
          senderMessages: [],
          receiverMessages: [],
        }).catch(e => {
          console.log(e)
        })
      }
      setLoading(false)
      setInput('')
    }
  }
  return (
    <section className="space-y-4 mt-4 pb-24 h-full  overflow-y-scroll scroll-smooth">
      {loading &&
        <Loading
          color="#fde047"
          type="spin"
          width={30}
          className="mx-auto"
          height={30}
        />
      }
      {searchContectList?.map((item, index) => (
        <div onClick={() => handleAddContact(item?.data())} key={index} className="flex gap-4 items-center ">
          {!item?.data()?.photoUrl ? (
            <span className="nav_leftProfileIcon text-sm flex items-center justify-center">
              <span>{item?.data()?.email[0]}</span>
            </span>
          ) : (
            <img
              className="w-12 h-12 rounded-full object-fill"
              src={item?.data()?.photoUrl}
              alt="profile"
            />
          )}
          <div className="flex-1 flex flex-col justify-center">
            <strong>{item?.data()?.displayName}</strong>
            <p>{item?.lastMessage}</p>
          </div>
          <div className="text-yellow-600 font-semibold ">
            {item?.data()?.online ?
              <p className="flex flex-col items-center">
                <small>online</small>

              </p>

              :
              <p className="flex flex-col items-center">
                <small>offline</small>

              </p>

            }
          </div>
        </div>
      ))}

      {contectList?.map((item, index) => (
        <div onClick={() => handleChat(item)} key={index} className="flex border-b border-slate-400 pb-2 gap-4 items-center">
          {!item?.photoUrl ? (
            <span className="nav_leftProfileIcon text-sm flex items-center justify-center">
              <span>{item?.email[0]}</span>
            </span>
          ) : (
            <img
              className="w-12 h-12 rounded-full object-fill"
              src={item?.photoUrl}
              alt="profile"
            />
          )}
          <div className="flex-1 flex flex-col justify-center">
            <strong>{item?.displayName}</strong>
            <p>{item?.lastMessage}</p>
          </div>
          <div className="text-yellow-600 font-semibold ">
            {item?.online ?
              <p className="flex flex-col items-center">
                <small>online</small>

              </p>

              :
              <p className="flex flex-col items-center">
                <small>offline</small>

              </p>

            }
          </div>
        </div>
      ))}
    </section>
  );

}

export default ContactList;
