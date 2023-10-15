import { redirect } from "react-router-dom";
import { realtimeDb } from "../../firebase";
import { userInfo } from "../../feature/userSlice";
import { useSelector } from "react-redux";
import { onDisconnect, ref } from "firebase/database";


export const getAuthExpirationData = () => {
  const expiryTime = localStorage.getItem('expiration')
  const expiration = new Date(expiryTime);
  const now = new Date();
  const durationHour = expiration.getTime() - now.getTime();
  return durationHour;
};

export const getAuthToken = () => {
  const token = localStorage.getItem('accessToken')
  const expiryDuration = getAuthExpirationData()
  if (!token) {
    return null
  }
  if (expiryDuration < 0) {
    return 'EXPIRED'
  }

  return token
}

const Check = () => {
  return useSelector(userInfo);
}


export const checkUserToken = (sts) => {
  const selector = Check()
  const token = getAuthToken()
  if (!token || token === 'EXPIRED') {
    const presenceRef = ref(realtimeDb, "oflline");
    onDisconnect(presenceRef).set(ref(realtimeDb, 'users/' + selector?.uid), {
      online: false
    });
    if (sts === 'onlyCheck') {
      return null
    } else {
      return redirect('/auth')
    }
  } else {
    return token
  }
}

