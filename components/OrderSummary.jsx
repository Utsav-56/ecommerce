import { PlusIcon, SquarePenIcon, XIcon } from 'lucide-react';
import React, { useState } from 'react'
import AddressModal from './AddressModal';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { placeOrderAction, validateCouponAction } from '@/lib/actions/orders';
import { clearCart } from '@/lib/features/cart/cartSlice';

const OrderSummary = ({ totalPrice, items }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

    const router = useRouter();
    const dispatch = useDispatch();

    const addressList = useSelector(state => state.address.list);
    const { user } = useSelector(state => state.auth);

    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState('');

    const handleCouponCode = async (event) => {
        event.preventDefault();
        if (!couponCodeInput) return;
        try {
            const res = await validateCouponAction(couponCodeInput);
            if (res.success) {
                setCoupon(res.coupon);
                toast.success('Coupon applied successfully!');
            } else {
                toast.error(res.error || 'Invalid or expired coupon.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to validate coupon.');
        }
    }

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!selectedAddress) {
            toast.error('Please select a shipping address.');
            return;
        }

        const discount = coupon ? (coupon.discount / 100 * totalPrice) : 0;
        const total = totalPrice - discount;

        const cartItems = items.map(item => ({
            productId: item.id,
            quantity: item.quantity
        }));

        try {
            const res = await placeOrderAction({
                total,
                addressId: selectedAddress.id,
                paymentMethod,
                couponCode: coupon ? coupon.code : '',
                couponDiscount: discount,
                cartItems
            });

            if (res.success) {
                dispatch(clearCart());
                toast.success('Order placed successfully!');
                if (res.redirectUrl) {
                    router.push(res.redirectUrl);
                } else {
                    router.push('/orders');
                }
            } else {
                toast.error(res.error || 'Failed to place order.');
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred while placing your order.');
        }
    }

    return (
        <div className='w-full max-w-lg lg:max-w-[340px] bg-slate-50/30 border border-slate-200 text-slate-500 text-sm rounded-xl p-7 shadow-sm'>
            <h2 className='text-xl font-medium text-slate-650'>Payment Summary</h2>
            <p className='text-slate-400 text-xs my-4'>Payment Method</p>
            <div className='flex gap-2 items-center'>
                <input type="radio" id="COD" onChange={() => setPaymentMethod('COD')} checked={paymentMethod === 'COD'} className='accent-slate-500 cursor-pointer' />
                <label htmlFor="COD" className='cursor-pointer text-slate-700 font-medium'>Cash on Delivery (COD)</label>
            </div>
            <div className='flex gap-2 items-center mt-2.5'>
                <input type="radio" id="STRIPE" name='payment' onChange={() => setPaymentMethod('STRIPE')} checked={paymentMethod === 'STRIPE'} className='accent-slate-500 cursor-pointer' />
                <label htmlFor="STRIPE" className='cursor-pointer text-slate-700 font-medium'>Stripe Credit / Debit Card</label>
            </div>
            <div className='my-4 py-4 border-y border-slate-200 text-slate-400'>
                <p className="mb-2 font-medium text-slate-600">Shipping Address</p>
                {
                    selectedAddress ? (
                        <div className='flex justify-between items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-700'>
                            <p className="text-xs leading-relaxed">
                                <span className="font-semibold block">{selectedAddress.name}</span>
                                {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.zip}
                            </p>
                            <SquarePenIcon onClick={() => setSelectedAddress(null)} className='cursor-pointer text-slate-400 hover:text-slate-600 transition shrink-0' size={16} />
                        </div>
                    ) : (
                        <div>
                            {
                                addressList.length > 0 ? (
                                    <select className='border border-slate-200 p-2 w-full my-2.5 outline-none rounded-lg text-slate-800 text-sm focus:border-indigo-500 bg-white cursor-pointer' onChange={(e) => setSelectedAddress(addressList[e.target.value])} >
                                        <option value="">Select Shipping Address</option>
                                        {
                                            addressList.map((address, index) => (
                                                <option key={index} value={index}>{address.name} - {address.street}, {address.city}</option>
                                            ))
                                        }
                                    </select>
                                ) : (
                                    <p className="text-xs text-slate-400 my-2">No addresses saved. Add one to checkout.</p>
                                )
                             }
                            <button className='flex items-center gap-1.5 text-slate-600 hover:text-slate-850 mt-1 cursor-pointer font-medium transition' onClick={() => setShowAddressModal(true)} >Add Address <PlusIcon size={16} /></button>
                        </div>
                    )
                }
            </div>
            <div className='pb-4 border-b border-slate-200'>
                <div className='flex justify-between'>
                    <div className='flex flex-col gap-1 text-slate-400'>
                        <p>Subtotal:</p>
                        <p>Shipping:</p>
                        {coupon && <p>Coupon:</p>}
                    </div>
                    <div className='flex flex-col gap-1 font-medium text-right text-slate-700'>
                        <p>{currency}{totalPrice.toLocaleString()}</p>
                        <p className="text-emerald-600">Free</p>
                        {coupon && <p className="text-emerald-600">{`-${currency}${(coupon.discount / 100 * totalPrice).toFixed(2)}`}</p>}
                    </div>
                </div>
                {
                    !coupon ? (
                        <form onSubmit={handleCouponCode} className='flex justify-center gap-3 mt-3.5'>
                            <input onChange={(e) => setCouponCodeInput(e.target.value)} value={couponCodeInput} type="text" placeholder='Coupon Code' className='border border-slate-200 p-2 px-3 rounded-lg w-full outline-none text-slate-800 focus:border-indigo-500 bg-slate-50 focus:bg-white text-sm transition' />
                            <button className='bg-slate-700 text-white px-4 rounded-lg hover:bg-slate-850 active:scale-95 transition-all text-xs font-semibold cursor-pointer'>Apply</button>
                        </form>
                    ) : (
                        <div className='w-full flex items-center justify-between gap-2 text-xs mt-3.5 bg-indigo-50 border border-indigo-150 p-2 rounded-lg text-indigo-750'>
                            <div>
                                <p>Code: <span className='font-bold'>{coupon.code.toUpperCase()}</span></p>
                                <p className="text-slate-450 mt-0.5">{coupon.description}</p>
                            </div>
                            <XIcon size={16} onClick={() => setCoupon('')} className='hover:text-red-700 transition cursor-pointer text-slate-400' />
                        </div>
                    )
                }
            </div>
            <div className='flex justify-between py-4 text-slate-800 font-semibold'>
                <p>Total:</p>
                <p className='text-lg'>{currency}{coupon ? (totalPrice - (coupon.discount / 100 * totalPrice)).toFixed(2) : totalPrice.toLocaleString()}</p>
            </div>

            {user ? (
                <button onClick={handlePlaceOrder} className='w-full bg-slate-800 text-white py-2.5 rounded-lg hover:bg-slate-900 active:scale-97 transition-all cursor-pointer font-semibold text-center'>
                    Place Order
                </button>
            ) : (
                <button onClick={() => router.push('/login')} className='w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 active:scale-97 transition-all cursor-pointer font-semibold text-center'>
                    Login to Checkout
                </button>
            )}

            {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} />}

        </div>
    )
}

export default OrderSummary