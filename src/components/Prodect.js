import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { PlusIcon, CheckIcon } from "@heroicons/react/24/outline";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useSelector } from "react-redux";
import { userInfo } from "../feature/userSlice";
import { v4 as uuid } from "uuid";
import Hover from "react-3d-hover";

const Prodect = ({
  id,
  image,
  title,
  toggle,
  caption,
  postId,
  photoUrl,
  name,
  date,
  Nothover,
  bookmarkCheck,
}) => {
  const selector = useSelector(userInfo);
  const addAndRemoveRef = useRef(null);
  const [bookmarkPost, setBookmarkPost] = useState();
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: null, y: null });
  const [titlePosition, setTitlePosition] = useState(false);
  let timeId;
  // id user change profile pic this update hooks run
  useEffect(() => {
    const checkPhotoUrlUpdate = async () => {
      if (selector?.uid === id && selector?.photoUrl !== photoUrl) {
        await updateDoc(doc(db, "posts", postId), {
          photoUrl: selector?.photoUrl,
        });
      }
    };

    checkPhotoUrlUpdate();
    if (bookmarkCheck.length === 0) {
      setBookmarkPost(false);
    } else if (bookmarkCheck[0].userId === selector?.uid) {
      setBookmarkPost(true);
    } else {
      setBookmarkPost(false);
    }
  }, []);

  // book mark user id in post section backend add and remove feature
  const handlepostToggle = useCallback(async (e, sts, { ...data }) => {
    if (addAndRemoveRef.current.contains(e.target)) {
      setLoading(true);
      if (sts === "add") {
        await updateDoc(doc(db, "user", selector?.uid), {
          bookmark: arrayUnion({
            postId,
            postValue: {
              arrayId: uuid(),
              ...data,
            },
          }),
        })
          .then(() => {
            updateDoc(doc(db, "posts", postId), {
              bookmarkUserId: arrayUnion({
                userId: selector?.uid,
              }),
            });
            setBookmarkPost(true);
          })
          .catch((error) => {
            alert(error.message);
            setLoading(false);
          });
      } else if (sts === "remove") {
        const queryRef = query(doc(db, "user", selector?.uid));
        const getdoc = await getDoc(queryRef);
        const removeArray = await getdoc
          .data()
          .bookmark.filter((postid) => postid.postId === postId);

        await updateDoc(queryRef, {
          bookmark: arrayRemove(removeArray[0]),
        })
          .then(async () => {
            const querypostRef = query(doc(db, "posts", postId));
            const getPost = await getDoc(querypostRef);
            const removePostBookUserId = getPost
              .data()
              .bookmarkUserId.filter(
                (userid) => userid.userId === selector?.uid
              );
            updateDoc(doc(db, "posts", postId), {
              bookmarkUserId: arrayRemove(removePostBookUserId[0]),
            });
            setBookmarkPost(false);
          })
          .catch((error) => {
            setLoading(false);
            return null;
          });
      }
      setLoading(false);
    } else if (sts === "toggleToDetailPage") {
      toggle({ ...data });
    }
  }, []);

  return (
    <Hover>
      <section
        onClick={(e) =>
          handlepostToggle(e, "toggleToDetailPage", {
            image,
            title,
            caption,
            id,
            date,
            postId,
            name,
            photoUrl,
            Nothover,
          })
        }
        className={`my-9 relative  text-white ${
          Nothover ? "" : "group "
        }  hover:scale-[0.98]  overflow-hidden transition-all duration-200  `}
      >
        {titlePosition ? (
          <span
            style={{ left: mousePosition.x, top: mousePosition.y }}
            className={`absolute bg-gray-600 min-w-fit p-1`}
          >
            {title}
          </span>
        ) : null}

        <img
          className=" w-full overflow-hidden group-hover:brightness-[0.8] duration-200 transition-all"
          src={image}
          alt={title}
        />

        <div className="p-2  w-full [&>section]:prodect_section group-hover:flex hidden justify-between absolute bottom-0  group-hover:duration-200 capitalize font-medium text-[14px] ">
          <section className="flex items-center p-2">
            {!photoUrl ? (
              <p className="w-12 h-12 max-[1400px]:w-10 max-[1400px]:h-10 rounded-full bg-gray-500 grid place-content-center text-base">
                {name[0]}
              </p>
            ) : (
              <img
                onError={(e) => console.log(e)}
                src={photoUrl}
                className="ring-2 ring-black w-12 h-12 max-[1400px]:w-10 max-[1400px]:h-10 rounded-full bg-gray-500 grid place-content-center"
                alt="profile pic"
              />
            )}
            <span className="">{name}</span>
          </section>

          <section ref={addAndRemoveRef}>
            {bookmarkPost ? (
              <button disabled={loading}>
                {" "}
                <CheckIcon
                  onClick={(e) =>
                    handlepostToggle(e, "remove", {
                      image,
                      title,
                      caption,
                      id,
                      date,
                      postId,
                      name,
                      photoUrl,
                    })
                  }
                  aria-details="svg"
                  className="publicePage_bookmark_btn"
                />{" "}
              </button>
            ) : (
              <button disabled={loading}>
                {" "}
                <PlusIcon
                  onClick={(e) =>
                    handlepostToggle(e, "add", {
                      image,
                      title,
                      caption,
                      id,
                      date,
                      postId,
                      name,
                      photoUrl,
                    })
                  }
                  aria-details="svg"
                  className="publicePage_bookmark_btn"
                />{" "}
              </button>
            )}
          </section>
        </div>
      </section>
    </Hover>
  );
};

export default memo(Prodect);
