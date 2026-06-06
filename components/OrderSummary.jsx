import React from 'react'
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

const OrderSummary = ({ totalPrice }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
    const router = useRouter();
    const { user } = useSelector(state => state.auth);

    const handleCheckoutRedirect = () => {
        if (!user) {
            router.push('/login?redirect=/checkout');
        } else {
            router.push('/checkout');
        }
    }

    return (
        <div className='w-full max-w-lg lg:max-w-[340px] bg-background border border-border text-muted-foreground text-sm rounded-xl p-7 shadow-sm'>
            <h2 className='text-xl font-medium text-slate-655 mb-5'>Order Summary</h2>
            
            <div className='pb-4 border-b border-border'>
                <div className='flex justify-between text-muted-foreground mb-2'>
                    <p>Subtotal:</p>
                    <p className="font-semibold text-foreground">{currency}{totalPrice.toLocaleString()}</p>
                </div>
                <div className='flex justify-between text-muted-foreground'>
                    <p>Shipping:</p>
                    <p className="text-emerald-600 font-semibold">Free</p>
                </div>
            </div>

            <div className='flex justify-between py-4 text-slate-850 font-semibold mb-4'>
                <p>Total:</p>
                <p className='text-lg'>{currency}{totalPrice.toLocaleString()}</p>
            </div>

            <button onClick={handleCheckoutRedirect} className='w-full bg-primary text-primary-foreground py-3 rounded-xl hover:bg-primary active:scale-97 transition-all cursor-pointer font-semibold text-center'>
                Proceed to Checkout
            </button>
        </div>
    )
}

export default OrderSummary