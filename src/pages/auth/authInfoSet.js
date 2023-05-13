import { redirect } from "react-router-dom";


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
    if(!token){
      return null
    }
    if(expiryDuration < 0){
      return 'EXPIRED'
    }

    return token
}



export const checkUserToken = (sts) => {
  
  const token = getAuthToken()
  if(!token || token === 'EXPIRED'){
    if(sts === 'onlyCheck'){
       return null
    }else{
    return redirect('/auth')
    }
  }else{
    return token
  }
}

