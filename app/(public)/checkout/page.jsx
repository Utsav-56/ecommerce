"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import AddressModal from "@/components/AddressModal";
import AddressSelector from "@/components/checkout/AddressSelector";
import PaymentMethodSelector from "@/components/checkout/PaymentMethodSelector";
import CheckoutSummary from "@/components/checkout/CheckoutSummary";
import { useCheckoutCart } from "@/hooks/useCheckoutCart";
import { useCheckoutPayment } from "@/hooks/useCheckoutPayment";

export default function CheckoutPage() {
	const router = useRouter();
	const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

	const { cartItems } = useSelector((state) => state.cart);
	const products = useSelector((state) => state.product.list);
	const addressList = useSelector((state) => state.address.list);
	const { user } = useSelector((state) => state.auth);

	const { cartArray, totalPrice } = useCheckoutCart(cartItems, products);

	const [paymentMethod, setPaymentMethod] = useState("COD");
	const [selectedAddress, setSelectedAddress] = useState(null);
	const [showAddressModal, setShowAddressModal] = useState(false);
	const { processCheckout, isCheckoutLoading } = useCheckoutPayment();

	// Redirect to login if user not authenticated
	useEffect(() => {
		if (!user) {
			router.push("/login?redirect=/checkout");
		}
	}, [user, router]);

	// Redirect to cart if empty
	useEffect(() => {
		if (products.length > 0 && cartArray.length === 0) {
			toast.error("Your cart is empty.");
			router.push("/cart");
		}
	}, [cartArray, products, router]);

	// Automatically select the first address if available
	useEffect(() => {
		if (addressList.length > 0 && !selectedAddress) {
			setSelectedAddress(addressList[0]);
		}
	}, [addressList, selectedAddress]);

	const handlePlaceOrder = async () => {
		if (!selectedAddress) {
			return toast.error("Please select or add a shipping address.");
		}
		if (!paymentMethod) {
			return toast.error("Please select a payment method.");
		}

		const items = cartArray.map((item) => ({
			productId: item.id,
			quantity: item.quantity,
		}));

		await processCheckout({
			addressId: selectedAddress.id,
			paymentMethod,
			cartItems: items,
		});
	};

	return (
		<div className="min-h-screen bg-background py-12 px-6 text-foreground">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left Columns - Form Details */}
					<div className="lg:col-span-2 space-y-6">
						{/* Shipping Address */}
						<AddressSelector
							addressList={addressList}
							selectedAddress={selectedAddress}
							setSelectedAddress={setSelectedAddress}
							setShowAddressModal={setShowAddressModal}
						/>

						{/* Payment Method Selector */}
						<PaymentMethodSelector
							paymentMethod={paymentMethod}
							setPaymentMethod={setPaymentMethod}
						/>

						{/* Review Items */}
						<div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
							<h3 className="text-lg font-semibold text-foreground mb-4">
								Review Order Items
							</h3>

							<div className="divide-y divide-slate-100">
								{cartArray.map((item) => (
									<div
										key={item.id}
										className="flex gap-4 py-3 first:pt-0 last:pb-0">
										<div className="size-16 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
											<Image
												src={item.images[0] || "/placeholder.png"}
												alt={item.name}
												width={40}
												height={40}
												className="object-cover h-10 w-auto"
											/>
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-semibold text-foreground truncate">
												{item.name}
											</p>
											<p className="text-xs text-muted-foreground mt-0.5">
												{item.category}
											</p>
											<p className="text-xs text-muted-foreground mt-1">
												{currency}
												{item.price} × {item.quantity}
											</p>
										</div>
										<div className="text-right text-sm font-semibold text-foreground">
											{currency}
											{(item.price * item.quantity).toFixed(2)}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Right Column - Payment Summary Card */}
					<div>
						<CheckoutSummary
							currency={currency}
							totalPrice={totalPrice}
							handlePlaceOrder={handlePlaceOrder}
							isPaymentLoading={isCheckoutLoading}
							paymentMethod={paymentMethod}
						/>
					</div>
				</div>
			</div>

			{showAddressModal && (
				<AddressModal setShowAddressModal={setShowAddressModal} />
			)}
		</div>
	);
}
