import { createSlice } from '@reduxjs/toolkit'

const productSlice = createSlice({
    name: 'product',
    initialState: {
        list: [],
    },
    reducers: {
        setProduct: (state, action) => {
            state.list = action.payload
        },
        clearProduct: (state) => {
            state.list = []
        },
        updateProductStock: (state, action) => {
            const { productId, inStock } = action.payload
            const prod = state.list.find(p => p.id === productId)
            if (prod) {
                prod.inStock = inStock !== undefined ? inStock : !prod.inStock
            }
        },
        removeProduct: (state, action) => {
            const productId = action.payload
            state.list = state.list.filter(p => p.id !== productId)
        }
    }
})

export const { setProduct, clearProduct, updateProductStock, removeProduct } = productSlice.actions

export default productSlice.reducer