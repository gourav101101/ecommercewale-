import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export async function POST(request, { params }) {
  try {
    const { slug } = await params;
    const body = await request.json();
    
    const { userName, rating, comment } = body;
    
    if (typeof userName !== 'string' || !userName.trim() || userName.length > 100 || typeof comment !== 'string' || !comment.trim() || comment.length > 2000 || !Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();
    const product = await Product.findOne({ slug });
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // Add the new review
    const newReview = { userName, rating: Number(rating), comment };
    product.reviews.push(newReview);
    
    // Recalculate average rating
    const totalReviews = product.reviews.length;
    const sumRatings = product.reviews.reduce((acc, curr) => acc + curr.rating, 0);
    product.rating = Number((sumRatings / totalReviews).toFixed(1));
    product.reviewCount = totalReviews;
    
    await product.save();
    revalidateTag('products', 'max');
    
    return NextResponse.json({ 
      message: 'Review added successfully', 
      product: {
        rating: product.rating,
        reviewCount: product.reviewCount,
        reviews: product.reviews
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Review submission error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
