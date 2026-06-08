import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { placeOrderAction, retryPaymentAction } from '@/lib/actions/orders';
import { useDispatch } from 'react-redux';
import { clearCart } from '@/lib/features/cart/cartSlice';

export function usePaymentGateway() {
    const router = useRouter();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    /**
     * Initiates a brand new order checkout
     */
    const processCheckout = async (orderPayload) => {
        setLoading(true);
        try {
            const res = await placeOrderAction(orderPayload);
            if (res.success) {
                toast.success(
                    orderPayload.paymentMethod === "COD"
                        ? "Order placed successfully!"
                        : "Order placed! Proceeding to payment..."
                );
                
                if (res.redirectUrl) {
                    router.push(res.redirectUrl);
                } else {
                    router.push("/profile");
                }
                
                // Delay clearing cart to avoid React useEffect hijacking the router redirect
                setTimeout(() => dispatch(clearCart()), 1000);
            } else {
                toast.error(res.error || "Failed to place order.");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred while placing order.");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Retries a pending payment from the Orders page
     */
    const processRetryPayment = async (orderId) => {
        setLoading(true);
        try {
            const res = await retryPaymentAction(orderId);
            if (res.success && res.redirectUrl) {
                router.push(res.redirectUrl);
            } else {
                toast.error(res.error || "Failed to initiate payment.");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while retrying payment.");
        } finally {
            setLoading(false);
        }
    };

    return {
        processCheckout,
        processRetryPayment,
        isPaymentLoading: loading
    };
}
