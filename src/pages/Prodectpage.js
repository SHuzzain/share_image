import React, { useDeferredValue, useEffect, useState } from "react";
import Masonry from "react-masonry-css";
import {
  useNavigate,
  isRouteErrorResponse,
  useRouteError,
} from "react-router-dom";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import Prodect from "../components/Prodect";
import { useDispatch, useSelector } from "react-redux";
import { prodectDetails, prodectSearch } from "../feature/ProdectSlice";
import Loading from "react-loading";
import { tokenAccessCheck, userInfo } from "../feature/userSlice";

function Prodectpage() {
  const [posts, setPosts] = useState([]);
  const isPanding = useDeferredValue(posts);
  const token = useSelector(tokenAccessCheck);

  const routeError = useRouteError();
  if (isRouteErrorResponse(routeError)) {
    console.log(routeError);
  }
  const [error, setError] = useState({
    message: "",
    bool: true,
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selector = useSelector(prodectSearch);
  const userIdSelector = useSelector(userInfo);

  // get all posts collection
  useEffect(() => {
    if (selector?.searchValue) {
      //  filter the post when user search particuler post
      const newPost = posts.filter((prod) => {
        return (
          prod
            .data()
            .title.toLowerCase()
            .includes(selector.searchValue.toLowerCase()) ||
          prod
            .data()
            .caption.toLowerCase()
            .includes(selector.searchValue.toLowerCase())
        );
      });
      //   if its get any post thst post array if true or else false
      if (newPost.length > 0) {
        setPosts([...newPost]);
      }
    } else {
      const unSub = onSnapshot(
        query(collection(db, "posts")),
        orderBy("timestamp", "desc"),
        async (snapshot) => {
          if (snapshot.docs.length === 0) {
            setError({
              message: "no image found",
            });
          } else {
            setPosts(snapshot.docs);
          }
        }
      );
      return unSub;
    }
  }, [db, selector?.searchValue]);

  //  grid update
  const oBjectBreackPorint = {
    default: 4,
    3000: 6,
    2000: 3,
    1024: 2,
    560: 1,
  };

  // handle the detail when user click the any post
  const handleDetailProdect = ({ ...data }) => {
    if (data.Nothover) return null;
    dispatch(
      prodectDetails({
        ...data,
      })
    );
    navigate(data.postId);
  };

  return (
    <>
      <div className="w-full lg:grid lg:place-items-center">
        <div className="w-full lg:w-[90%] p-4  ">
          <Masonry
            breakpointCols={oBjectBreackPorint}
            className="flex  animate__zoomIn  animate__animated gap-9 "
          >
            {posts?.map((prod, index) => (
              <Prodect
                toggle={handleDetailProdect}
                key={index}
                bookmarkCheck={prod
                  .data()
                  .bookmarkUserId.filter(
                    (userid) => userid.userId === userIdSelector?.uid
                  )}
                photoUrl={prod.data().photoUrl}
                Nothover={!token?.accessToken ? true : false}
                title={prod.data().title}
                name={prod.data().name}
                caption={prod.data().caption}
                image={prod.data().imageUrl}
                id={prod.data().uid}
                postId={prod.data()._id}
                date={prod.data().date}
              />
            ))}
          </Masonry>
        </div>
      </div>
      {isPanding.length <= 0 && error.message === "" ? (
        <div className="h-full flex items-center  justify-center">
          <Loading
            color="yellow"
            type="spinningBubbles"
            width={60}
            height={60}
          />
        </div>
      ) : (
        <h1>{error.message}</h1>
      )}
    </>
  );
}

export default Prodectpage;
