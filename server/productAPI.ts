import axios from 'axios';
import { Product, Comment } from '../types/types';

const BASE_URL = 'http://localhost:3001/products';
const COMMENTS_URL = 'http://localhost:3001/comments';

export const fetchProducts = async (): Promise<Product[]> => {
    const response = await axios.get(BASE_URL);
    return response.data;
};

export const createProduct = async (product: Product): Promise<Product> => {
    const response = await axios.post(BASE_URL, product);
    return response.data;
};

export const updateProduct = async (product: Product): Promise<Product> => {
    const response = await axios.put(`${BASE_URL}/${product.id}`, product);
    return response.data;
};

export const removeProduct = async (id: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/${id}`);
};

export const createComment = async (
    productId: string,
    comment: Comment
): Promise<{ productId: string; comment: Comment }> => {
    const commentRes = await axios.post(COMMENTS_URL, comment);
    const newComment = commentRes.data;

    const productRes = await axios.get(`${BASE_URL}/${productId}`);
    const product = productRes.data as Product;

    const updatedProduct = {
        ...product,
        comments: [...product.comments, newComment.id.toString()],
    };
    await axios.put(`${BASE_URL}/${productId}`, updatedProduct);
    return { productId, comment: newComment };
};


export const removeComment = async (
    productId: string,
    commentId: string
): Promise<void> => {
    await axios.delete(`${COMMENTS_URL}/${commentId}`);

    const productRes = await axios.get(`${BASE_URL}/${productId}`);
    const product = productRes.data as Product;

    const updatedProduct = {
        ...product,
        comments: product.comments.filter(id => id !== commentId.toString()),
    };

    await axios.put(`${BASE_URL}/${productId}`, updatedProduct);
};

