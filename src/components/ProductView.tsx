'use client';

import React, { useEffect, useState } from 'react';
import { Product, Comment } from '../../types/types';
import { useAppDispatch } from '../../hooks/hooks';
import { updateProduct } from '../../redux/productSlice';
import { createComment, removeComment } from '../../server/productAPI';
import Link from "next/link";
import Arrow from "../../utils/Arrow";
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';


interface ProductViewProps {
    product: Product;
}

interface FormData {
    name: string;
    count: string;
    imageUrl: string;
    weight: string;
    width: string;
    height: string;
}

const ProductView: React.FC<ProductViewProps> = ({ product }) => {
    const dispatch = useAppDispatch();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newCommentText, setNewCommentText] = useState('');

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        defaultValues: {
            name: product.name,
            count: product.count.toString(),
            imageUrl: product.imageUrl,
            weight: product.weight,
            width: product.size.width.toString(),
            height: product.size.height.toString(),
        }
    });

    useEffect(() => {
        const loadComments = async () => {
            try {
                const response = await axios.get<Comment[]>(`http://localhost:3001/comments?productId=${product.id}`);
                setComments(response.data);
            } catch (error) {
                console.error('Failed to load comments', error);
            }
        };

        loadComments();
    }, [product.id]);

    const openEditModal = () => {
        reset({
            name: product.name,
            count: product.count.toString(),
            imageUrl: product.imageUrl,
            weight: product.weight,
            width: product.size.width.toString(),
            height: product.size.height.toString(),
        });
        setIsEditModalOpen(true);
    };

    const onAddComment = async () => {
        if (!newCommentText.trim()) return;

        const newComment: Comment = {
            id: uuidv4(),
            productId: product.id,
            description: newCommentText.trim(),
            date: new Date().toISOString(),
        };

        try {
            const { comment } = await createComment(product.id, newComment);
            setComments(prev => [...prev, comment]);
            setNewCommentText('');
        } catch (error) {
            console.error('Failed to add comment', error);
        }
    };

    const onDeleteComment = async (id: string) => {
        try {
            await removeComment(product.id, id);
            setComments(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error('Failed to delete comment', error);
        }
    };

    const onSave = (data: FormData) => {
        const updatedProduct: Product = {
            ...product,
            name: data.name,
            count: Number(data.count),
            imageUrl: data.imageUrl,
            weight: data.weight,
            size: {
                width: Number(data.width),
                height: Number(data.height),
            },
            comments: comments.map(c => c.id.toString()),
        };

        dispatch(updateProduct(updatedProduct));
        setIsEditModalOpen(false);
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-[url('/bg.svg')] bg-no-repeat bg-bottom bg-fixed pt-12 pb-20">
            <Link className="flex px-3 py-2 bg-blue-500 rounded-2xl gap-2 shadow-2xl text-white hover:bg-blue-700 duration-150 ease-in-out" href="/">Back<Arrow /></Link>

            <div className="max-w-2xl mx-auto p-6 mt-20 bg-gray-50 rounded shadow">
                <h1 className="flex justify-center text-3xl font-bold mb-4">{product.name}</h1>
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="flex justify-center mb-4 w-100 h-auto object-contain"
                />
                <p><b>Amount:</b> {product.count}</p>
                <p><b>Weight:</b> {product.weight}</p>
                <p><b>Width x Height:</b> {product.size.width} x {product.size.height}</p>

                <button
                    onClick={openEditModal}
                    className="flex px-4 py-2 mt-4 bg-blue-500 rounded-xl duration-150 ease-in-out gap-2 shadow-2xl text-white hover:bg-blue-700"
                >
                    Edit
                </button>

                <h2 className="mt-8 text-2xl font-semibold">Comments</h2>
                <ul className="mb-4">
                    {comments.map(comment => (
                        <li key={comment.id} className="border p-2 rounded mb-2 flex justify-between">
                            <div>
                                <p>{comment.description}</p>
                                <small className="text-gray-500">{new Date(comment.date).toLocaleString()}</small>
                            </div>
                            <button
                                onClick={() => onDeleteComment(comment.id)}
                                className="text-red-600 font-bold ml-4"
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>

                <div className="flex gap-2 mb-8">
                    <input
                        type="text"
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="New comment"
                        className="flex-grow bg-white rounded px-3 py-2 "
                    />
                    <button
                        onClick={onAddComment}
                        className="bg-green-600 text-white px-4 rounded duration-150 ease-in-out hover:bg-green-700"
                    >
                        Add
                    </button>
                </div>

                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-white/50 backdrop-blur-xl flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded shadow max-w-md w-full">
                            <h3 className="text-xl font-semibold mb-4">Edit Product</h3>
                            <form onSubmit={handleSubmit(onSave)}>
                                {[
                                    { name: 'name', label: 'Product Name' },
                                    { name: 'count', label: 'Amount' },
                                    { name: 'imageUrl', label: 'Image URL' },
                                    { name: 'weight', label: 'Weight' },
                                    { name: 'width', label: 'Width' },
                                    { name: 'height', label: 'Height' },
                                ].map(({ name, label }) => (
                                    <div key={name} className="mb-3">
                                        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                                            {label}
                                        </label>
                                        <input
                                            id={name}
                                            {...register(name as keyof FormData, {
                                                required: `${label} is required`,
                                                validate: (value) => {
                                                    if (['count', 'width', 'height'].includes(name)) {
                                                        const num = Number(value);
                                                        if (isNaN(num)) return `${label} must be a number`;
                                                        if (num <= 0 && name !== 'count') return `${label} must be greater than zero`;
                                                        if (num < 0 && name === 'count') return `${label} cannot be negative`;
                                                    }
                                                    return true;
                                                }
                                            })}
                                            type={['count', 'width', 'height'].includes(name) ? 'number' : 'text'}
                                            className={`w-full border rounded px-3 py-2 ${errors[name as keyof FormData] ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors[name as keyof FormData] && (
                                            <p className="text-red-600 text-sm mt-1">
                                                {errors[name as keyof FormData]?.message}
                                            </p>
                                        )}
                                    </div>
                                ))}

                                <div className="flex justify-end gap-3 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="bg-gray-300 px-4 py-2 rounded duration-150 ease-in-out hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-4 py-2 rounded duration-150 ease-in-out hover:bg-blue-700"
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductView;
