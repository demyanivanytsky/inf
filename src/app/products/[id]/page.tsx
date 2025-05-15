'use client';

import React, { useEffect } from 'react';
import ProductView from '@/components/ProductView';
import { useAppDispatch, useAppSelector } from '../../../../hooks/hooks';
import { loadProducts } from '../../../../redux/productSlice';

interface PageProps {
    params: Promise<{ id: string }>;
}

const ProductPage = ({ params }: PageProps) => {
    const unwrappedParams = React.use(params);
    const id = unwrappedParams.id;

    const dispatch = useAppDispatch();
    const products = useAppSelector(state => state.product.items);
    const loading = useAppSelector(state => state.product.loading);
    const error = useAppSelector(state => state.product.error);

    useEffect(() => {
        dispatch(loadProducts());
    }, [dispatch]);

    const product = products.find(p => p.id === id) ?? null;

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!product) return <p>Product isn&#39;t found</p>;

    return <ProductView product={product} />;
};

export default ProductPage;
