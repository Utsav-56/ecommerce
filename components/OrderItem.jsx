"use client";
import Image from "next/image";
import { DotIcon } from "lucide-react";
import { useSelector } from "react-redux";
import Rating from "./Rating";
import { useState } from "react";
import RatingModal from "./RatingModal";
import { retryPaymentAction } from "@/lib/actions/orders";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { usePaymentGateway } from "@/hooks/usePaymentGateway";

const OrderItem = ({ order }) => {
	const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";
	const [ratingModal, setRatingModal] = useState(null);
	const { processRetryPayment, isPaymentLoading } = usePaymentGateway();

	const { ratings } = useSelector((state) => state.rating);

	const handlePayNow = async () => {
		await processRetryPayment(order.id);
	};

	return (
		<>
			<tr className="text-sm">
				<td className="text-left">
					<div className="flex flex-col gap-6">
						{order.orderItems.map((item, index) => (
							<div key={index} className="flex items-center gap-4">
								<div className="w-20 aspect-square bg-muted flex items-center justify-center rounded-md">
									<Image
										className="h-14 w-auto"
										src={item.product.images[0]}
										alt="product_img"
										width={50}
										height={50}
									/>
								</div>
								<div className="flex flex-col justify-center text-sm">
									<p className="font-medium text-muted-foreground text-base">
										{item.product.name}
									</p>
									<p>
										{currency}
										{item.price} Qty : {item.quantity}{" "}
									</p>
									<p className="mb-1">
										{new Date(order.createdAt).toDateString()}
									</p>
									<div>
										{ratings.find(
											(rating) =>
												order.id === rating.orderId &&
												item.product.id === rating.productId,
										) ? (
											<Rating
												value={
													ratings.find(
														(rating) =>
															order.id === rating.orderId &&
															item.product.id ===
																rating.productId,
													).rating
												}
											/>
										) : (
											<button
												onClick={() =>
													setRatingModal({
														orderId: order.id,
														productId: item.product.id,
													})
												}
												className={`text-primary hover:bg-green-50 transition ${order.status !== "DELIVERED" && "hidden"}`}>
												Rate Product
											</button>
										)}
									</div>
									{ratingModal && (
										<RatingModal
											ratingModal={ratingModal}
											setRatingModal={setRatingModal}
										/>
									)}
								</div>
							</div>
						))}
					</div>
				</td>

				<td className="text-center max-md:hidden">
					{currency}
					{order.total}
				</td>

				<td className="text-left max-md:hidden">
					<p>
						{order.address.name}, {order.address.street},
					</p>
					<p>
						{order.address.city}, {order.address.state},{" "}
						{order.address.zip}, {order.address.country},
					</p>
					<p>{order.address.phone}</p>
				</td>

				<td className="text-left space-y-2 text-sm max-md:hidden">
					<div className="flex flex-col items-start gap-2">
						<div
							className={`flex items-center justify-center gap-1 rounded-full p-1 text-xs font-semibold px-2 py-0.5 border ${
								order.status === "DELIVERED"
									? "text-emerald-700 bg-emerald-50 border-emerald-250"
									: order.status === "ORDER_PLACED"
										? "text-amber-700 bg-amber-50 border-amber-250"
										: "text-indigo-700 bg-indigo-50 border-indigo-250"
							}`}>
							<DotIcon size={10} className="scale-250" />
							{order.status.split("_").join(" ").toLowerCase()}
						</div>
						{order.status === "PENDING_PAYMENT" && (
							<button
								onClick={handlePayNow}
								disabled={isPaymentLoading}
								className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded transition disabled:opacity-50 cursor-pointer">
								{isPaymentLoading ? "Processing..." : "Pay Now"}
							</button>
						)}
					</div>
				</td>
			</tr>
			{/* Mobile */}
			<tr className="md:hidden">
				<td colSpan={5}>
					<p className="font-semibold text-foreground">
						{order.address.name}
					</p>
					<p className="text-xs text-muted-foreground mt-0.5">
						{order.address.street}, {order.address.city},{" "}
						{order.address.state} - {order.address.zip}
					</p>
					<p className="text-xs text-muted-foreground">
						{order.address.phone}
					</p>
					<br />
					<div className="flex items-center justify-between mt-2">
						<span
							className={`text-center px-4 py-1 rounded-full text-xs font-semibold border ${
								order.status === "DELIVERED"
									? "text-emerald-700 bg-emerald-50 border-emerald-200"
									: order.status === "ORDER_PLACED"
										? "text-amber-700 bg-amber-50 border-amber-200"
										: "text-indigo-700 bg-indigo-50 border-indigo-200"
							}`}>
							{order.status.replace(/_/g, " ").toLowerCase()}
						</span>
						{order.status === "PENDING_PAYMENT" && (
							<button
								onClick={handlePayNow}
								disabled={isPaymentLoading}
								className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded transition disabled:opacity-50 cursor-pointer">
								{isPaymentLoading ? "Processing..." : "Pay Now"}
							</button>
						)}
					</div>
				</td>
			</tr>
			<tr>
				<td colSpan={4}>
					<div className="border-b border-border w-6/7 mx-auto" />
				</td>
			</tr>
		</>
	);
};

export default OrderItem;
