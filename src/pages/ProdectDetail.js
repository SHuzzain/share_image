import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  useRouteError,
  useParams,
  json,
  isRouteErrorResponse,
  useNavigate,
} from "react-router-dom";
import { db } from "../firebase";
import { PlusIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";
import { userInfo } from "../feature/userSlice";

function ProdectDetail() {
  const [selectedPost, setSelectedPost] = useState();
  const [bookmarkCheck, setbookmarkCheck] = useState();
  const navigate = useNavigate();
  const userIdSelector = useSelector(userInfo);
  const params = useParams("id");
  // get user upload posts only
  useEffect(() => {
    const collectionRef = collection(db, `posts`);
    const particulerData = query(collectionRef, where("_id", "==", params.id));

    const unSub = onSnapshot(particulerData, async (snapshot) => {
      try {
        if ((await snapshot.docs[0].data().bookmarkUserId.length) > 0) {
          const checkUserIn = await snapshot.docs[0]
            .data()
            .bookmarkUserId.map((val) => val.userId === userIdSelector?.uid);
          if (checkUserIn[0]) {
            setbookmarkCheck(true);
          } else {
            setbookmarkCheck(false);
          }
        } else {
          setbookmarkCheck(false);
        }

        setSelectedPost(snapshot.docs[0].data());
      } catch (error) {
        navigate("..");
      }
    });
    return unSub;
  }, [db]);

  const handlepostToggle = async (sts) => {
    const collectionRef = collection(db, `posts`);
    const particulerData = query(collectionRef, where("_id", "==", params.id));
    const useridDocs = await getDocs(particulerData);

    switch (sts) {
      case "add":
        try {
          updateDoc(doc(db, "posts", params.id), {
            bookmarkUserId: arrayUnion({
              userId: userIdSelector?.uid,
            }),
          });
        } catch (error) {
          console.log(error);
        }

        break;
      case "remove":
        try {
          const removeUid = await useridDocs.docs[0]
            ?.data()
            .bookmarkUserId.filter(
              (userid) => userid.userId === userIdSelector?.uid
            );

          await updateDoc(doc(db, "posts", params.id), {
            bookmarkUserId: arrayRemove(removeUid[0]),
          });
        } catch (error) {
          console.log(error);
        }

        break;
      default:
        break;
    }
  };

  return (
    <div className="p-4 h-full w-full  flex justify-center items-center">
      {selectedPost ? (
        <article className="bg-slate-300 p-4 max-lg:flex-col  rounded-sm max-w-[70rem] min-w-[50rem]  max-lg:max-w-[700px]  max-lg:min-w-[10rem]  capitalize font-semibold text-xl flex gap-2">
          <section className="overflow-hidden min-h-auto max-h-[30rem] lg:flex-[0.5] bg-gray-400 rounded-md outline-dashed outline-1">
            <img
              className="w-full h-full object-contain rounded-md"
              src={selectedPost.imageUrl}
              alt=""
            />
          </section>
          <section className="flex lg:flex-[0.6] flex-col relative justify-center text-[16px] font-medium ">
            <h4>
              username: <span>{selectedPost.email}</span>
            </h4>
            <h4>
              image uploder: <span>{selectedPost.name}</span>
            </h4>
            <h4>
              title: <span>{selectedPost.title}</span>
            </h4>
            <h4>
              caption: <span>{selectedPost.caption}</span>
            </h4>
            <h4>
              publiched on: <span>{selectedPost.date.slice(0, 10)}</span>
            </h4>
            {/* <h4 className="absolute bottom-0 right-0">
              {bookmarkCheck ? (
                <button>
                  {" "}
                  <CheckIcon
                    onClick={() => handlepostToggle("remove")}
                    aria-details="svg"
                    className="w-14 max-[1400px]:w-10 max-[1400px]:h-8 h-9 cursor-pointer  rounded-lg font-bold  bg-white text-gray-500"
                  />{" "}
                </button>
              ) : (
                <button>
                  {" "}
                  <PlusIcon
                    onClick={() => handlepostToggle("add")}
                    aria-details="svg"
                    className="w-14 max-[1400px]:w-10 max-[1400px]:h-8 h-9 cursor-pointer  rounded-lg font-bold  bg-white text-gray-500"
                  />{" "}
                </button>
              )}
            </h4> */}
          </section>
        </article>
      ) : null}
    </div>
  );
}

export default ProdectDetail;
