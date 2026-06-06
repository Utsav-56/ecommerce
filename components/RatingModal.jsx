import { Star, XIcon } from 'lucide-react';
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { addRatingAction } from '@/lib/actions/ratings';
import { addRating } from '@/lib/features/rating/ratingSlice';

const RatingModal = ({ ratingModal, setRatingModal }) => {
    const dispatch = useDispatch();
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            return toast.error('Please select a rating');
        }
        if (review.trim().length < 5) {
            return toast.error('Please write a review (at least 5 characters)');
        }

        setLoading(true);
        try {
            const res = await addRatingAction({
                rating,
                review,
                productId: ratingModal.productId,
                orderId: ratingModal.orderId
            });

            if (res.success) {
                dispatch(addRating(res.rating));
                toast.success('Review submitted successfully!');
                setRatingModal(null);
            } else {
                toast.error(res.error || 'Failed to submit review.');
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred while submitting review.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='fixed inset-0 z-120 flex items-center justify-center bg-black/40 backdrop-blur-xs'>
            <div className='bg-card p-8 rounded-2xl shadow-xl w-96 relative border border-border'>
                <button onClick={() => setRatingModal(null)} className='absolute top-4 right-4 text-gray-400 hover:text-gray-650 transition cursor-pointer'>
                    <XIcon size={20} />
                </button>
                <h2 className='text-xl font-semibold text-foreground mb-2'>Rate Product</h2>
                <p className="text-xs text-muted-foreground mb-5">Share your experience with this item to help other customers.</p>
                
                <div className='flex items-center justify-center gap-1.5 mb-6'>
                    {Array.from({ length: 5 }, (_, i) => (
                        <Star
                            key={i}
                            className={`size-9 cursor-pointer transition ${rating > i ? "text-amber-400 fill-current" : "text-gray-250 hover:text-amber-300"}`}
                            onClick={() => setRating(i + 1)}
                        />
                    ))}
                </div>
                <textarea
                    className='w-full p-3 border border-border rounded-xl mb-5 focus:outline-none focus:border-primary text-sm text-foreground bg-background focus:bg-card transition'
                    placeholder='Write your review here...'
                    rows='4'
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    required
                ></textarea>
                <button 
                    onClick={handleSubmit} 
                    disabled={loading}
                    className='w-full bg-primary text-primary-foreground py-2.5 rounded-xl hover:bg-indigo-700 transition font-semibold cursor-pointer disabled:opacity-50'
                >
                    {loading ? 'Submitting...' : 'Submit Rating'}
                </button>
            </div>
        </div>
    )
}

export default RatingModal