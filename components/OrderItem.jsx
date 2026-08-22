"use client";
import Image from "next/image";
import { useSelector } from "react-redux";
import { useState } from "react";
import RatingModal from "./RatingModal";
import OrderStatus from "./orders/OrderStatus";
import RetryPaymentButton from "./orders/RetryPaymentButton";
import OrderRating from "./orders/OrderRating";
import { useRetryPayment } from "@/hooks/useRetryPayment";
import { formatCurrency, formatDate } from "@/lib/utils/format";

const OrderItem = ({ order }) => {
	const [ratingModal, setRatingModal] = useState(null);
	const { processRetryPayment, isRetryLoading } = useRetryPayment();

	const { ratings } = useSelector((state) => state.rating);

	const handlePayNow = async () => {
		await processRetryPayment(order.id);
	};

	return (
		<>
			<tr className="text-sm">
				<td className="text-left">
					<div className="flex flex-col gap-6">
						{order.orderItems.map((item, index) => {
							const existingRating = ratings.find(
								(rating) =>
									order.id === rating.orderId &&
									item.product.id === rating.productId
							);

							return (
								<div key={index} className="flex items-center gap-4">
									<div className="w-20 aspect-square bg-muted flex items-center justify-center rounded-md">
										<Image
											className="h-14 w-auto object-cover"
											src={item.product.images[0] || "/placeholder.png"}
											alt={item.product.name}
											width={50}
											height={50}
										/>
									</div>
									<div className="flex flex-col justify-center text-sm">
										<p className="font-medium text-muted-foreground text-base">
											{item.product.name}
										</p>
										<p>
											{formatCurrency(item.price)} Qty : {item.quantity}
										</p>
										<p className="mb-1">{formatDate(order.createdAt)}</p>
										<div>
											<OrderRating
												existingRating={existingRating}
												orderStatus={order.status}
												onRateClick={() =>
													setRatingModal({
														orderId: order.id,
														productId: item.product.id,
													})
												}
											/>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</td>

				<td className="text-center max-md:hidden font-semibold">
					{formatCurrency(order.total)}
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
						<OrderStatus status={order.status} />
						<RetryPaymentButton
							orderId={order.id}
							status={order.status}
							handlePayNow={handlePayNow}
							isRetryLoading={isRetryLoading}
						/>
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
						<OrderStatus status={order.status} />
						<RetryPaymentButton
							orderId={order.id}
							status={order.status}
							handlePayNow={handlePayNow}
							isRetryLoading={isRetryLoading}
						/>
					</div>
				</td>
			</tr>
			<tr>
				<td colSpan={4}>
					<div className="border-b border-border w-6/7 mx-auto" />
				</td>
			</tr>
			{ratingModal && (
				<RatingModal
					ratingModal={ratingModal}
					setRatingModal={setRatingModal}
				/>
			)}
		</>
	);
};

export default OrderItem;
