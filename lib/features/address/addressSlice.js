import { createSlice } from '@reduxjs/toolkit'

const addressSlice = createSlice({
    name: 'address',
    initialState: {
        list: [],
    },
    reducers: {
        addAddress: (state, action) => {
            state.list.unshift(action.payload)
        },
        setAddresses: (state, action) => {
            state.list = action.payload || []
        },
        removeAddress: (state, action) => {
            const addressId = action.payload
            state.list = state.list.filter(a => a.id !== addressId)
        }
    }
})

export const { addAddress, setAddresses, removeAddress } = addressSlice.actions

export default addressSlice.reducer