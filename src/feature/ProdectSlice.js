import { createSlice } from "@reduxjs/toolkit";

export const ProdectSlice = createSlice({
    name: 'prodect',
    initialState: {
        prodect: null,
        particulerProdect: null
    },
    reducers: {
        prodectDetails: (state, action) => {
            state.prodect = action.payload
        },
        prodectFilter: (state, action) => {
              state.particulerProdect = action.payload
        }
    }
})

export const {prodectDetails, prodectFilter} = ProdectSlice.actions

export const prodectInfo = (state) => state.counterProdect.prodect

export const prodectSearch = (state) => state.counterProdect.particulerProdect


export default ProdectSlice.reducer