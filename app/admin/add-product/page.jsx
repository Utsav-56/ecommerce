'use client'
import { assets } from "@/assets/assets"
import Image from "next/image"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { addProductAction } from "@/lib/actions/products"

export default function AdminAddProduct() {
    const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Beauty & Health', 'Toys & Games', 'Sports & Outdoors', 'Books & Media', 'Food & Drink', 'Hobbies & Crafts', 'Others']

    const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null })
    const [productInfo, setProductInfo] = useState({
        name: "",
        description: "",
        mrp: 0,
        price: 0,
        category: "",
    })
    const [loading, setLoading] = useState(false)

    const onChangeHandler = (e) => {
        setProductInfo({ ...productInfo, [e.target.name]: e.target.value })
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData()
            formData.append('name', productInfo.name)
            formData.append('description', productInfo.description)
            formData.append('mrp', productInfo.mrp)
            formData.append('price', productInfo.price)
            formData.append('category', productInfo.category)

            // Append files
            Object.keys(images).forEach((key) => {
                if (images[key]) {
                    formData.append(`image${key}`, images[key])
                }
            })

            const res = await addProductAction(formData)
            if (res.success) {
                toast.success('Product added successfully!')
                // Reset form
                setProductInfo({
                    name: "",
                    description: "",
                    mrp: 0,
                    price: 0,
                    category: "",
                })
                setImages({ 1: null, 2: null, 3: null, 4: null })
            } else {
                toast.error(res.error || 'Failed to add product.')
            }
        } catch (err) {
            console.error(err)
            toast.error('An error occurred.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className="text-slate-500 mb-28">
            <h1 className="text-2xl text-slate-800">Add New <span className="text-slate-800 font-medium">Products</span></h1>
            <p className="mt-7">Product Images</p>

            <div className="flex gap-3 mt-4">
                {Object.keys(images).map((key) => (
                    <label key={key} htmlFor={`images${key}`}>
                        <Image 
                            width={300} 
                            height={300} 
                            className='h-16 w-16 object-cover border border-slate-200 rounded cursor-pointer hover:opacity-80 transition' 
                            src={images[key] ? URL.createObjectURL(images[key]) : assets.upload_area} 
                            alt="" 
                        />
                        <input 
                            type="file" 
                            accept='image/*' 
                            id={`images${key}`} 
                            onChange={e => setImages({ ...images, [key]: e.target.files[0] })} 
                            hidden 
                        />
                    </label>
                ))}
            </div>

            <label className="flex flex-col gap-2 my-6">
                Name
                <input type="text" name="name" onChange={onChangeHandler} value={productInfo.name} placeholder="Enter product name" className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded text-slate-800 text-sm focus:border-indigo-500" required />
            </label>

            <label className="flex flex-col gap-2 my-6">
                Description
                <textarea name="description" onChange={onChangeHandler} value={productInfo.description} placeholder="Enter product description" rows={5} className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded resize-none text-slate-800 text-sm focus:border-indigo-500" required />
            </label>

            <div className="flex gap-5">
                <label className="flex flex-col gap-2">
                    Actual Price ($)
                    <input type="number" name="mrp" onChange={onChangeHandler} value={productInfo.mrp} placeholder="0" className="w-full max-w-44 p-2 px-4 outline-none border border-slate-200 rounded text-slate-800 text-sm focus:border-indigo-500" required />
                </label>
                <label className="flex flex-col gap-2">
                    Offer Price ($)
                    <input type="number" name="price" onChange={onChangeHandler} value={productInfo.price} placeholder="0" className="w-full max-w-44 p-2 px-4 outline-none border border-slate-200 rounded text-slate-800 text-sm focus:border-indigo-500" required />
                </label>
            </div>

            <select onChange={e => setProductInfo({ ...productInfo, category: e.target.value })} value={productInfo.category} className="w-full max-w-sm p-2.5 px-4 my-6 outline-none border border-slate-200 rounded text-slate-800 text-sm focus:border-indigo-500" required>
                <option value="">Select a category</option>
                {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                ))}
            </select>

            <br />

            <button type="submit" disabled={loading} className="bg-slate-800 text-white px-8 py-2.5 hover:bg-slate-900 rounded-lg transition active:scale-98 disabled:bg-slate-400 cursor-pointer">
                {loading ? 'Adding Product...' : 'Add Product'}
            </button>
        </form>
    )
}
