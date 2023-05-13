import {createSlice} from "@reduxjs/toolkit"
import { signOut } from "../firebase"

export const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: null,
        tokenAccess: null
        
    },
    reducers: {
        login:(state, action) => {
           state.user = action.payload
        },
        logout: (state) => {
             state.user = null
             localStorage.removeItem('accessToken')
             localStorage.removeItem('expiration')
             signOut()
        },
        tokenCheck: (state, action) => {
            state.tokenAccess = action.payload
        }
    }
})


export const {login, logout, tokenCheck} = userSlice.actions

export const userInfo = (state) => state.counter.user

export const tokenAccessCheck = (state) => state.counter.tokenAccess

export default userSlice.reducer