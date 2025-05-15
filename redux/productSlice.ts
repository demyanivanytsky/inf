import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, Comment } from '../types/types';
import * as api from '../server/productAPI';

interface ProductState {
    items: Product[];
    loading: boolean;
    error: string | null;
}

const initialState: ProductState = {
    items: [],
    loading: false,
    error: null,
};

export const loadProducts = createAsyncThunk('products/load', async () => {
    return await api.fetchProducts();
});

export const addProduct = createAsyncThunk(
    'products/add',
    async (product: Product) => {
        return await api.createProduct(product);
    }
);

export const updateProduct = createAsyncThunk(
    'products/update',
    async (product: Product) => {
        return await api.updateProduct(product);
    }
);

export const deleteProduct = createAsyncThunk(
    'products/delete',
    async (id: string) => {
        await api.removeProduct(id);
        return id;
    }
);

export const addComment = createAsyncThunk(
    'products/addComment',
    async ({ productId, comment }: { productId: string; comment: Comment }) => {
        return await api.createComment(productId, comment);
    }
);

export const deleteComment = createAsyncThunk(
    'products/deleteComment',
    async ({ productId, commentId }: { productId: string; commentId: string }) => {
        await api.removeComment(productId, commentId);
        return { productId, commentId };
    }
);

export const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(loadProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadProducts.fulfilled, (state, action) => {
                state.items = action.payload;
                state.loading = false;
            })
            .addCase(loadProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? 'Failed to load products';
            })
            .addCase(addProduct.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                const index = state.items.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<string>) => {
                state.items = state.items.filter(p => p.id !== action.payload);
            })
            .addCase(addComment.fulfilled, (state, action) => {
                const { productId, comment } = action.payload;
                const product = state.items.find(p => p.id === productId);
                if (product) {
                    if (!product.comments) product.comments = [];
                    product.comments.push(comment.id);
                }
            })

            .addCase(deleteComment.fulfilled, (state, action) => {
                const { productId, commentId } = action.payload;
                const product = state.items.find(p => p.id === productId);
                if (product && product.comments) {
                    product.comments = product.comments.filter(cId => cId !== commentId);
                }
            });
    },
});

export default productSlice.reducer;
