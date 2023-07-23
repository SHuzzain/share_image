import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import MainNavigation from "../components/MainNavigation";
import { useDispatch } from "react-redux";
import { login, logout, tokenCheck } from "../feature/userSlice";
import { onAuthStateChanged } from "firebase/auth";
import { getAuthExpirationData, getAuthToken } from "../pages/auth/authInfoSet";
import { auth, AuthStatusChange, db, signOut } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { MessageAside } from "../components/messageSystem/MessageAside";

function RootLayout() {
  const dispatch = useDispatch();
  const authSts = AuthStatusChange();
  const navigate = useNavigate();
  useEffect(() => {
    const unSub = onAuthStateChanged(auth, async (userAuth) => {
      const token = getAuthToken();
      const duration = getAuthExpirationData();

      if (!userAuth || token === "EXPRIED" || !token) {
        dispatch(
          tokenCheck({
            accessToken: null,
          })
        );

        navigate("/");
      } else {
        setTimeout(() => {
          dispatch(logout());
        }, duration);

        dispatch(
          tokenCheck({
            accessToken: userAuth.refreshToken,
          })
        );

        dispatch(
          login({
            email: userAuth.email,
            name: userAuth.displayName,
            uid: userAuth.uid,
            photoUrl: userAuth.photoURL,
          })
        );
      }
    });
    return unSub;
  }, [authSts]);

  const handleBeforeUnload = async (status) => {
    if (!authSts?.uid) return;

    await updateDoc(doc(db, "user", authSts?.uid), {
      online: status,
    });
  };

  useEffect(() => {
    handleBeforeUnload(true);

    window.addEventListener("beforeunload", () => handleBeforeUnload(false));

    return () => {
      window.removeEventListener("beforeunload", () =>
        handleBeforeUnload(false)
      );
      handleBeforeUnload(false);
    };
  }, []);

  return (
    <>
      <header className="z-40 fixed top-0 w-full left-0">
        <MainNavigation />
      </header>
      <div className="mt-[80px]">
        <Outlet />
        {authSts?.uid &&

          <MessageAside />
        }
      </div>
    </>
  );
}

export default RootLayout;
