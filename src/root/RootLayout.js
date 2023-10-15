import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import MainNavigation from "../components/MainNavigation";
import { useDispatch } from "react-redux";
import { login, logout, tokenCheck } from "../feature/userSlice";
import { onAuthStateChanged } from "firebase/auth";
import { getAuthExpirationData, getAuthToken } from "../pages/auth/authInfoSet";
import { auth, AuthStatusChange, db, realtimeDb, signOut } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { MessageAside } from "../components/messageSystem/MessageAside";
import { ref, set } from "firebase/database";


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
        authSts?.uid && statusChange(false)
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

  async function statusChange(status) {
    await set(ref(realtimeDb, 'users/' + authSts?.uid), {
      online: status
    })
  }

  const handleBeforeUnload = async (status) => {
    if (!authSts?.uid) return null;
    statusChange(status)
  };

  const handleAwayTab = async (status) => {

    try {
      if (document.visibilityState === 'visible' && authSts?.uid) {
        statusChange(status)
      } else if (authSts?.uid) {
        statusChange(status)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    handleBeforeUnload(!!authSts?.uid);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState == "visible") {
        handleAwayTab(true)
      } else {
        handleAwayTab('away')
      }
    });
    window.addEventListener('beforeunload', () => handleBeforeUnload(false))
    return () => {
      document.removeEventListener('visibilitychange', () => {
        if (document.visibilityState == "visible") {
          handleAwayTab(true)
        } else {
          handleAwayTab('away')
        }
      })
      window.addEventListener('beforeunload', () => handleBeforeUnload(false))
    }
  }, [authSts?.uid]);

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
