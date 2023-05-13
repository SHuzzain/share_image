import {configureStore} from "@reduxjs/toolkit"
import counterUserReducer from "../feature/userSlice"
import counterProdectReducer from '../feature/ProdectSlice'

export const store = configureStore({
    reducer: {
        counter: counterUserReducer,
        counterProdect: counterProdectReducer,
    }
})

