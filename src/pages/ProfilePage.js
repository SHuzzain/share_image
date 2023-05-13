import React, { useEffect, useCallback, useRef, useState } from "react";
import {
  where,
  collection,
  onSnapshot,
  updateDoc,
  doc,
  query,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { auth, db, storage } from "../firebase";
import { useDispatch, useSelector } from "react-redux";
import { login, userInfo } from "../feature/userSlice";
import { UserPlusIcon, PhotoIcon } from "@heroicons/react/24/outline";
import Masonry from "react-masonry-css";
import Prodect from "../components/Prodect";
import { updateProfile } from "firebase/auth";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { useNavigate } from "react-router-dom";

function ProfilePage() {
  const selector = useSelector(userInfo);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [post, setPost] = useState([]);
  const [bookmarkUser, setBookmarkUser] = useState();
  const [updateInputData, setUpdateInputData] = useState({
    title: "",
    caption: "",
  });
  const [updateImage, setUpdateImage] = useState(false);
  const fileRef = useRef();
  const [postSection, setPostSection] = useState(false);
  const [detailElement, setDetailElement] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [postDetail, setPostDetail] = useState({
    id: "",
    image: "",
    caption: "",
    email: "",
    date: "",
    title: "",
    postId: "",
  });

  // backend call, get all user uploads images
  useEffect(() => {
    //  wait for user id
    if (!selector?.uid) return;
    //  firebase store colloection
    const collectionRef = collection(db, "posts");
    // search user using the  user id
    const personalData = query(
      collectionRef,
      where("uid", "==", selector?.uid)
    );
    //  get all the data user upload
    const unSub = onSnapshot(personalData, (snapshot) => {
      snapshot.docChanges().map(async (doces) => {
        //  if user update profile pic else just render the data

        if (imageFile) {
          await updateDoc(doc(db, "posts", doces?.doc.data()._id), {
            photoUrl: imageFile,
          });
        } else {
          setPost(snapshot.docs);
          return null;
        }
      });
    });
    return unSub;
  }, [db, selector?.uid, imageFile]);

  // when page resize the grid row
  const oBjectBreackPorint = {
    default: 4,
    3000: 6,
    2000: 3,
    1024: 2,
    500: 1,
  };

  // detail page when user click post top of the box
  const detailOfClickPost = ({ ...data }) => {
    setPostDetail(() => ({
      ...data,
    }));
    setUpdateInputData(() => ({
      title: data.title,
      caption: data.caption,
    }));
  };

  //  if caption more charecter this handle that
  const handleDetailCaption = (e) => {
    if (e.target.innerText.includes("...Show")) {
      setDetailElement(true);
    } else {
      setDetailElement(false);
    }
  };
  // profile update function
  const handleUpdateProfile = async (e) => {
    const reader = new FileReader();
    if (e?.target?.files[0]) {
      reader.readAsDataURL(e.target?.files[0]);
    }
    if (e?.target?.files[0]?.size > 1000000)
      return alert("Image size is too large.");
    reader.onload = async (eventImage) => {
      if (!selector?.uid) return navigate("/product");
      if (window.confirm("do you like to change profile pic") === true) {
        setLoading(true);
        //image path
        const imageRef = ref(storage, `userProfile/${selector.uid}/image`);
        // convert to binery to image and upload the fire store
        await uploadString(imageRef, eventImage.target.result, "data_url")
          .then(async (snapshot) => {
            //  get image form fire base
            const downloadUrl = await getDownloadURL(imageRef);
            // update user profile firebase auth
            await updateProfile(auth.currentUser, {
              photoURL: downloadUrl,
            }).then(() => {
              // redux user info update
              dispatch(
                login({
                  ...selector,
                  photoUrl: downloadUrl,
                })
              );
            });
            // add  the user profile pic fire store colloect
            await updateDoc(doc(db, "user", selector.uid), {
              photoUrl: downloadUrl,
            });
            setImageFile(downloadUrl);
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    };
  };

  const handlePostSection = async (sts) => {
    if (sts === "PS") {
      setPostSection(false);
    } else if (sts === "BM") {
      checkBookMark();
      setPostSection(true);
    }
  };

  // check bookmark user page
  const checkBookMark = async () => {
    const queryRef = query(doc(db, "user", selector?.uid));
    const userBookmark = await getDoc(queryRef);
    if (userBookmark.data().bookmark.length === 0) {
      setBookmarkUser(false);
    } else {
      setBookmarkUser(userBookmark.data().bookmark);
    }
  };

  //  update title or caption this function
  const handleImageUpdate = async (sts) => {
    if (
      !postDetail.image &&
      !postDetail.title &&
      !postDetail.caption &&
      !postDetail.date
    )
      return null;
    switch (sts) {
      case "update":
        setUpdateImage(true);
        break;
      case "cancel":
        setUpdateImage(false);
        break;
      case "submit":
        if (updateInputData.title === "" && updateInputData.caption === "")
          return alert("invaild input");
        try {
          setLoading(true);
          if (postDetail.title !== updateInputData.title) {
            await updateDoc(doc(db, "posts", postDetail.postId), {
              title: updateInputData.title,
            });
          } else if (postDetail.caption !== updateInputData.caption) {
            await updateDoc(doc(db, "posts", postDetail.postId), {
              caption: updateInputData.caption,
            });
          } else if (
            postDetail.title !== updateInputData.title &&
            postDetail.caption !== updateInputData.caption
          ) {
            await updateDoc(doc(db, "posts", postDetail.postId), {
              title: updateInputData.title,
              caption: updateInputData.caption,
            });
          }
        } catch (error) {
          alert(error.message);
        } finally {
          setLoading(false);
        }

        break;
      case "delete":
        if (
          !postDetail.image &&
          !postDetail.title &&
          !postDetail.caption &&
          !postDetail.date
        )
          return null;
        try {
          setLoading(true);
          const checkuserReq = window.confirm(
            "are you sure do you want delete this post"
          );
          if (checkuserReq) {
            await deleteDoc(doc(db, "posts", postDetail.postId));
            setPostDetail({
              id: "",
              image: "",
              caption: "",
              email: "",
              date: "",
              title: "",
              postId: "",
            });
          } else {
            return null;
          }
        } catch (error) {
        } finally {
          setLoading(false);
        }

        break;
      default:
        break;
    }
  };

  return (
    <div className="lg-[810px]:p-5 pt-0 flex flex-col min-h-screen max-h-auto text-white">
      <section className="flex items-start gap-5 mt-4 justify-around flex-[0.5] max-lg-[810px]:profilePage_top capitalize font-medium text-base">
        <section className="flex flex-col items-center gap-3 ">
          <section className="gap-3 flex items-center">
            <label
              htmlFor=""
              className="w-36  relative h-36 max-lg-[810px]:w-20 max-lg-[810px]:h-20 grid place-content-center"
            >
              {!selector?.photoUrl ? (
                <UserPlusIcon className="w-full h-full text-gray-500 border-[5px] hover:border-gray-400 hover:text-gray-400 transition-all duration-200 p-2 border-spacing-16 rounded-full" />
              ) : (
                <img
                  className="w-full  absolute border-4 border-white h-full cursor-pointer ring-1 rounded-full p-1 ring-slate-900"
                  src={selector.photoUrl}
                  alt="profile image"
                />
              )}
            </label>

            <section className="[&>p]:font-semibold ">
              <p>
                username: <span>{selector?.email}</span>
              </p>
              <p>
                name: <span>{selector?.name}</span>
              </p>
              <p>
                posts count: <span>{post?.length}</span>
              </p>
              <button
                onClick={() => fileRef.current.click()}
                className="w-20 rounded-md text-white active:bg-blue-400 hover:text-[#ebebeb] bg-blue-500"
              >
                {loading ? "updating..." : "update"}
              </button>
              <input
                disabled={loading}
                ref={fileRef}
                hidden
                onChange={handleUpdateProfile}
                type="file"
                name=""
                id="imageInput"
              />
            </section>
          </section>
        </section>

        <div className="max-[810px]:profilePage_postDetail ">
          <section className="self-start  w-96 max-[810px]:w-full overflow-hidden h-[33rem]">
            <h3 className="text-center">posts details</h3>
            <section className="flex [&>label>span]:ml-1 flex-col  max-[810px]:items-center gap-1 ">
              <section className="min-w-full">
                <div
                  className={`w-full h-[20rem] grid mb-3 place-items-center ${
                    !postDetail.image
                      ? "border-4 border-dashed border-slate-400"
                      : "bg-[#1f1f1f]"
                  } max-h-[20rem] min-h-auto`}
                  htmlFor=""
                >
                  {!postDetail.image ? (
                    <PhotoIcon className="w-[10rem]  text-slate-400" />
                  ) : (
                    <img
                      className="max-w-full min-w-auto max-h-[20rem] min-h-auto animate-none"
                      src={postDetail?.image}
                      alt=""
                    />
                  )}
                </div>

                <label
                  htmlFor=""
                  className="h-10 flex justify-around gap-2 text-white "
                >
                  {updateImage ? (
                    <button
                      onClick={() => handleImageUpdate("cancel")}
                      className="profilePage_postDeatil"
                    >
                      cancel
                    </button>
                  ) : (
                    <button
                      onClick={() => handleImageUpdate("update")}
                      className="profilePage_postDeatil"
                    >
                      update
                    </button>
                  )}

                  {updateImage ? (
                    <button
                      disabled={loading}
                      onClick={() => handleImageUpdate("submit")}
                      className="profilePage_postDeatil"
                    >
                      {loading ? "wait.." : "submit"}
                    </button>
                  ) : (
                    <button
                      disabled={loading}
                      onClick={() => handleImageUpdate("delete")}
                      className="profilePage_postDeatil"
                    >
                      {loading ? "wait.." : "delete"}
                    </button>
                  )}
                </label>
              </section>

              <section className="flex  items-center gap-2 w-full ">
                <label
                  className="flex flex-col gap-1 p-2 text-gray-200"
                  htmlFor=""
                >
                  <p>title: </p>
                  <p>caption: </p>
                  <p>time: </p>
                </label>

                <label className="w-full">
                  {updateImage ? (
                    <input
                      required
                      className="border-2 border-gray-300 text-black ml-1 w-full outline-blue-400"
                      type={"text"}
                      value={updateInputData.title}
                      onChange={(e) =>
                        setUpdateInputData((preVal) => ({
                          ...preVal,
                          title: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    <span className="">{postDetail.title}</span>
                  )}

                  {updateImage ? (
                    <input
                      required
                      className="border-2 text-black border-gray-300 ml-1 w-full outline-blue-400"
                      type="text"
                      value={updateInputData.caption}
                      onChange={(e) =>
                        setUpdateInputData((preVal) => ({
                          ...preVal,
                          caption: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    <span className="flex whitespace-nowrap ">
                      {postDetail.caption.length >= 36 ? (
                        <span className="">
                          {postDetail.caption.slice(0, 34)}
                          <span
                            className={`${
                              detailElement ? "hidden" : null
                            } text-sm text-gray-500 cursor-pointer`}
                            onClick={handleDetailCaption}
                          >
                            ...show
                          </span>
                          <span
                            className={`${detailElement ? null : "hidden"}`}
                          >
                            {postDetail.caption.slice(34, -1)}
                            <span
                              onClick={handleDetailCaption}
                              className={`text-sm text-gray-500 cursor-pointer`}
                            >
                              ...hide
                            </span>
                          </span>
                        </span>
                      ) : (
                        <span>{postDetail.caption}</span>
                      )}
                    </span>
                  )}

                  <span>
                    {postDetail?.date ? postDetail?.date.slice(0, 10) : null}
                  </span>
                </label>
              </section>
            </section>
          </section>
        </div>
      </section>

      <article className="w-full">
        <section className="flex justify-around w-full [&>*]:profilePage_postSection ">
          <h3
            onClick={() => handlePostSection("PS")}
            className={`${
              postSection ? "text-white" : "bg-gray-700 text-white"
            } text-center capitalize text-3xl font-bold border-r-2 border-black flex-[0.5]`}
          >
            posts section
          </h3>
          <h3
            onClick={() => handlePostSection("BM")}
            className={`${
              postSection ? " bg-gray-700 text-white" : "text-white"
            } text-center capitalize text-3xl font-bold  flex-[0.5]`}
          >
            bookmark collection
          </h3>
        </section>
        <section className="flex-1 border-t-2  border-t-slate-200  min-h-[20rem] max-h-[auto] bg-[#242424]">
          <Masonry
            breakpointCols={oBjectBreackPorint}
            className="flex animate__zoomIn animate__animated gap-4 "
          >
            {postSection ? (
              !bookmarkUser ? (
                <div className="absolute w-full flex justify-center items-center">
                  <h1 className="capitalize font-bold text-2xl mt-4">
                    no bookmark
                  </h1>
                </div>
              ) : (
                bookmarkUser?.map((bookmarkPost, index) => (
                  <Prodect
                    key={index}
                    title={bookmarkPost.postValue.title}
                    bookmarkCheck={[{ userId: selector?.uid }]}
                    image={bookmarkPost.postValue.image}
                    Nothover={false}
                    caption={bookmarkPost.postValue.caption}
                    date={bookmarkPost.postValue.date}
                    id={bookmarkPost.postValue.id}
                    postId={bookmarkPost.postId}
                    name={bookmarkPost.postValue.name}
                    photoUrl={bookmarkPost.postValue.photoUrl}
                    toggle={detailOfClickPost}
                  />
                ))
              )
            ) : post.length <= 0 ? (
              <div className="grid place-items-center w-full absolute text-2xl font-extrabold text-white">
                <h1 className="capitalize">no post</h1>
              </div>
            ) : (
              post?.map((postValue, index) => (
                <Prodect
                  key={index}
                  title={postValue.data().title}
                  bookmarkCheck={[]}
                  image={postValue.data().imageUrl}
                  Nothover={true}
                  caption={postValue.data().caption}
                  date={postValue.data().date}
                  id={postValue.data().uid}
                  postId={postValue.data()._id}
                  name={postValue.data().name}
                  photoUrl={postValue.data().photoUrl}
                  toggle={detailOfClickPost}
                />
              ))
            )}
          </Masonry>
        </section>
      </article>
    </div>
  );
}

export default ProfilePage;
