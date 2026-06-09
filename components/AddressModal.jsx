'use client'
import { XIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { useDispatch } from "react-redux"
import { addAddressAction, getAddressesAction } from "@/lib/actions/address"
import { setAddresses } from "@/lib/features/address/addressSlice"

const AddressModal = ({ setShowAddressModal }) => {

    const [address, setAddress] = useState({
        name: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        phone: ''
    })

    const handleAddressChange = (e) => {
        setAddress({
            ...address,
            [e.target.name]: e.target.value
        })
    }

    const dispatch = useDispatch()

    const [isSaving, setIsSaving] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            const res = await addAddressAction(address)
            if (res.success) {
                toast.success("Address added successfully!")
                
                // Refresh address list in Redux
                const addrRes = await getAddressesAction()
                if (addrRes.success) {
                    dispatch(setAddresses(addrRes.list))
                }
                
                setShowAddressModal(false)
            } else {
                toast.error(res.error || "Failed to add address.")
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred while adding address.")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="fixed inset-0 z-50 bg-card/60 backdrop-blur h-screen flex items-center justify-center">
            <div className="flex flex-col gap-5 text-foreground w-full max-w-sm mx-6 bg-card border border-border p-6 rounded-xl shadow-2xl relative">
                <h2 className="text-2xl ">Add New <span className="font-semibold">Address</span></h2>
                <input name="name" onChange={handleAddressChange} value={address.name} className="p-2 px-4 outline-none border border-border rounded w-full" type="text" placeholder="Enter your name" required />
                <input name="email" onChange={handleAddressChange} value={address.email} className="p-2 px-4 outline-none border border-border rounded w-full" type="email" placeholder="Email address" required />
                <input name="street" onChange={handleAddressChange} value={address.street} className="p-2 px-4 outline-none border border-border rounded w-full" type="text" placeholder="Street" required />
                <div className="flex gap-4">
                    <input name="city" onChange={handleAddressChange} value={address.city} className="p-2 px-4 outline-none border border-border rounded w-full" type="text" placeholder="City" required />
                    <input name="state" onChange={handleAddressChange} value={address.state} className="p-2 px-4 outline-none border border-border rounded w-full" type="text" placeholder="State" required />
                </div>
                <div className="flex gap-4">
                    <input name="zip" onChange={handleAddressChange} value={address.zip} className="p-2 px-4 outline-none border border-border rounded w-full" type="number" placeholder="Zip code" required />
                    <input name="country" onChange={handleAddressChange} value={address.country} className="p-2 px-4 outline-none border border-border rounded w-full" type="text" placeholder="Country" required />
                </div>
                <input name="phone" onChange={handleAddressChange} value={address.phone} className="p-2 px-4 outline-none border border-border rounded w-full" type="text" placeholder="Phone" required />
                <button disabled={isSaving} className="bg-primary text-primary-foreground text-sm font-medium py-3 rounded-md hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 mt-2">
                    {isSaving ? "SAVING..." : "SAVE ADDRESS"}
                </button>
                <XIcon size={24} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground cursor-pointer transition" onClick={() => setShowAddressModal(false)} />
            </div>
        </form>
    )
}

export default AddressModal