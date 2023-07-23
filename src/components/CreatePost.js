import React, { useRef, useState } from "react";
import { redirect, useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import { useSelector } from "react-redux";
import { userInfo } from "../feature/userSlice";
import Resizer from "react-image-file-resizer";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { async } from "@firebase/util";

function CreatePost() {
  const selector = useSelector(userInfo);
  const fileRef = useRef(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState({
    title: "",
    url: "",
    caption: "",
  });
  const [foucsCheck, setFoucsCheck] = useState({
    title: false,
    url: false,
    caption: false,
  });

  const handlePostCreate = async (e) => {
    e.preventDefault();
    //  image url check fn
    setFoucsCheck({
      title: false,
    });
    function checkImageURL(url) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () =>
          reject(new Error("Image is invalid or failed to load."));
        img.src = url;
      });
    }

    const url = checkImageURL(post.url)
      .catch((error) => {
        alert(error.message);
        return false;
      })
      .finally(() => {
        setLoading(false);
      });
    // check url is vaild
    if (!url) return;

    if (!post.title || !post.url || !post.caption)
      return alert("please fill the empty field");
    setLoading(true);
    try {
      // creating a doc in firebase

      const docId = await addDoc(collection(db, `posts`), {
        ...selector,
        title: post.title,
        caption: post.caption,
        imageUrl: post.url,
        bookmarkUserId: [],
        timestamp: serverTimestamp(),
        date: new Date().toISOString(),
      });

      //   update the doc
      await updateDoc(doc(db, "posts", docId.id), {
        _id: docId.id,
      });

      //  route to home page
      navigate("..");
    } catch (error) {
      redirect("/");
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPost((preVal) => ({
      ...preVal,
      [name]: value,
    }));
  };
  const handleFouceInput = (sts, e) => {
    switch (sts) {
      case "in":
        if (e.target.name === "title") {
          setFoucsCheck({
            [e.target.name]: true,
          });
        } else if (e.target.name === "caption") {
          setFoucsCheck({
            [e.target.name]: true,
          });
        } else if (e.target.name === "url") {
          setFoucsCheck({
            [e.target.name]: true,
          });
        }
        break;
      case "out":
        if (e.target.name === "title") {
          setFoucsCheck({
            [e.target.name]: false,
          });
        } else if (e.target.name === "caption") {
          setFoucsCheck({
            [e.target.name]: false,
          });
        } else if (e.target.name === "url") {
          setFoucsCheck({
            [e.target.name]: false,
          });
        }
        break;
      default:
        break;
    }
  };

  const handleFileReader = async (e) => {
    if (!e.target.files) {
      setPost((preVal) => ({
        ...preVal,
        url: e.target.value,
      }));
    } else {
      try {
        const file = e.target.files[0];
        if (file.size > 1000000) {
          alert("Image size is too large.");
        } else {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (evet) => {
            setPost((preVal) => ({
              ...preVal,
              url: evet.target.result,
            }));
          };
          reader.onerror = (err) => {
            alert("something wrong try again");
          };
          setPost((preVal) => ({
            ...preVal,
            url: file.name,
          }));
        }
      } catch (err) {
        console.log(err);
      }
    }
  };
  const handleClearInput = () => {
    setPost(() => ({
      title: "",
      caption: "",
      url: "",
    }));
  };

  return (
    <div className="h-full flex justify-center ">
      <form
        onSubmit={handlePostCreate}
        className=" w-[50rem] relative bg-[#3b3b3b]  transition-all duration-200 mx-2 group  grid grid-cols-3 items-center gap-3  p-2"
      >
        <section className="col-span-3 sm:col-span-1 h-56 bg-gray-300 rounded-lg overflow-hidden">
          <label
            htmlFor="imageUrl"
            className="w-full h-full flex items-center justify-center"
          >
            {!post.url ? (
              <h3 className="uppercase font-medium">image url</h3>
            ) : (
              <img
                src={post.url}
                className="object-contain h-full w-full"
                alt=""
                id="imageUrl"
              />
            )}
          </label>
        </section>

        <section className="col-span-3 sm:col-span-2 [&>label>input]:create-section [&>label>h3]:font-medium w-full [&>label>h3]:text-white [&>label>h3]:capitalize">
          <label htmlFor="" className="">
            <h3
              className={`${
                foucsCheck.title ? "!text-blue-400" : "text-white"
              }`}
            >
              Title*
            </h3>
            <input
              required
              onFocus={(e) => handleFouceInput("in", e)}
              onBlur={(e) => handleFouceInput("out", e)}
              onChange={(e) => handleChange(e)}
              value={post.title}
              type="text"
              name="title"
            />
          </label>

          <label htmlFor="">
            <h3
              className={`${
                foucsCheck.caption ? "!text-blue-400" : "text-white"
              }`}
            >
              caption*
            </h3>
            <input
              required
              onFocus={(e) => handleFouceInput("in", e)}
              onBlur={(e) => handleFouceInput("out", e)}
              onChange={(e) => handleChange(e)}
              value={post.caption}
              type="text"
              name="caption"
            />
          </label>

          <label htmlFor="">
            <h3
              className={`${foucsCheck.url ? "!text-blue-400" : "text-white"}`}
            >
              image url*
            </h3>
            <input
              required
              onFocus={(e) => handleFouceInput("in", e)}
              onBlur={(e) => handleFouceInput("out", e)}
              onChange={(e) => handleFileReader(e)}
              value={post.url}
              type="text"
              name="url"
            />
          </label>

          <label htmlFor="" className="flex  mt-4  text-sm gap-2">
            <input
              onChange={handleFileReader}
              ref={fileRef}
              type="file"
              hidden
            />
            <section
              className={`${
                post.caption.length || post.title.length || post.url.length
                  ? "gap-2"
                  : "gap-0"
              } flex-[0.5] relative transition-all duration-150 flex items-center justify-center font-semibold  capitalize`}
            >
              {post.caption.length ||
              post.title.length ||
              post.url.length ? null : (
                <button
                  type="button"
                  className="absolute h-full w-full flex items-center justify-center"
                  onClick={() => fileRef.current.click()}
                >
                  select from computer
                </button>
              )}
              <button
                type="button"
                className={`${
                  post.caption.length || post.title.length || post.url.length
                    ? "rounded"
                    : "rounded rounded-tr-none rounded-br-none"
                } bg-blue-400  h-full flex items-center justify-center w-full`}
                onClick={() => fileRef.current.click()}
              >
                {post.caption.length || post.title.length || post.url.length
                  ? "select.."
                  : null}
              </button>
              <button
                type="reset"
                className={`${
                  post.caption.length || post.title.length || post.url.length
                    ? "rounded bg-red-600"
                    : "rounded rounded-tl-none rounded-bl-none bg-blue-400"
                }  col-span-1 h-full  flex items-center justify-center w-full`}
                onClick={() =>
                  post.caption.length || post.title.length || post.url.length
                    ? handleClearInput()
                    : fileRef.current.click()
                }
              >
                {post.caption.length || post.title.length || post.url.length
                  ? "Clear"
                  : null}
              </button>
            </section>
            <button
              disabled={loading}
              type="submit"
              className="flex-[0.5] font-semibold rounded p-[10px] capitalize bg-yellow-400"
            >
              {loading ? "wait.." : "post"}
            </button>
          </label>
        </section>
      </form>
    </div>
  );
}

export default CreatePost;
