"use client";

import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { addProduct, deleteProduct, loadProducts } from "../../redux/productSlice";
import { Product } from "../../types/types";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {useForm} from "react-hook-form";

interface FormData {
    name: string;
    count: number;
    imageUrl: string;
    weight: string;
    width: number;
    height: number;
}

export const ProductList = () => {
    const products = useAppSelector((state) => state.product.items);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    useEffect(() => {
        dispatch(loadProducts());
    }, [dispatch]);

    const initialSortKey = (searchParams.get("sort") as "name" | "count") || "name";
    const [sortKey, setSortKey] = useState<"name" | "count">(initialSortKey);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentDeleteId, setCurrentDeleteId] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        trigger,
        formState: { errors},
    } = useForm<FormData>({ mode: "onChange" });

    const sortedProducts = useMemo(() => {
        const sorted = [...products];
        if (sortKey === "name") {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            sorted.sort((a, b) => a.count - b.count);
        }
        return sorted;
    }, [products, sortKey]);

    const handleSortChange = (value: "name" | "count") => {
        setSortKey(value);
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", value);
        router.replace(`${pathname}?${params.toString()}`);
    };

    const onSubmit = (data: FormData) => {
        const newProduct: Product = {
            id: uuidv4(),
            name: data.name,
            count: data.count,
            imageUrl: data.imageUrl,
            weight: data.weight,
            size: { width: data.width, height: data.height },
            comments: [],
        };

        dispatch(addProduct(newProduct));
        reset();
        setShowAddModal(false);
    };

    const handleDelete = () => {
        if (currentDeleteId) {
            dispatch(deleteProduct(currentDeleteId));
            setCurrentDeleteId(null);
            setShowDeleteModal(false);
        }
    };

    return (
        <div className="flex flex-col justify-start items-center gap-4 min-h-screen bg-[url('/bg.svg')] bg-no-repeat bg-bottom bg-fixed pt-12 pb-20">
            <h2 className="text-2xl font-bold">List of Products</h2>

            <div className="flex items-center gap-4">
                <button
                    className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-700 duration-150 ease-in-out shadow-2xl"
                    onClick={() => setShowAddModal(true)}
                >
                    Add
                </button>

                <select
                    value={sortKey}
                    onChange={(e) => handleSortChange(e.target.value as "name" | "count")}
                    className="px-3 py-1 border rounded"
                >
                    <option value="name">Sort by Name</option>
                    <option value="count">Sort by Count</option>
                </select>
            </div>

            <ul className="w-full max-w-md space-y-2">
                {sortedProducts.map((product) => (
                    <li
                        key={product.id}
                        onClick={() => router.push(`/products/${product.id}`)}
                        className="flex justify-between font-bold items-center bg-gray-100 p-3 rounded shadow cursor-pointer"
                    >
                        <span>
                            {product.name} (count: {product.count})
                        </span>
                        <button
                            className="text-red-600"
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentDeleteId(product.id);
                                setShowDeleteModal(true);
                            }}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>

            {showAddModal && (
                <div className="fixed inset-0 bg-white/50 backdrop-blur-xl flex justify-center items-center z-10">
                    <div className="bg-white p-6 rounded shadow w-96">
                        <h3 className="text-lg font-semibold mb-4">New Product</h3>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                            <input
                                {...register("name", { required: "Name is required" })}
                                placeholder="Name"
                                className="w-full bg-gray-50 p-2 border rounded"
                            />
                            {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}

                            <input
                                type="number"
                                {...register("count", { required: true, min: 0 })}
                                placeholder="Count"
                                className="w-full bg-gray-50 p-2 border rounded"
                            />
                            {errors.count && <p className="text-red-600 text-sm">Valid count is required</p>}

                            <input
                                {...register("imageUrl", { required: "Image URL is required" })}
                                placeholder="Image URL"
                                className="w-full bg-gray-50 p-2 border rounded"
                            />
                            {errors.imageUrl && <p className="text-red-600 text-sm">{errors.imageUrl.message}</p>}

                            <input
                                {...register("weight", { required: "Weight is required" })}
                                placeholder="Weight"
                                className="w-full bg-gray-50 p-2 border rounded"
                            />
                            {errors.weight && <p className="text-red-600 text-sm">{errors.weight.message}</p>}

                            <input
                                type="number"
                                {...register("width", { required: true, min: 1 })}
                                placeholder="Width"
                                className="w-full bg-gray-50 p-2 border rounded"
                            />
                            {errors.width && <p className="text-red-600 text-sm">Valid width is required</p>}

                            <input
                                type="number"
                                {...register("height", { required: true, min: 1 })}
                                placeholder="Height"
                                className="w-full bg-gray-50 p-2 border rounded"
                            />
                            {errors.height && <p className="text-red-600 text-sm">Valid height is required</p>}

                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    className="bg-gray-300 px-3 py-1 rounded duration-150 ease-in-out hover:bg-gray-400"
                                    onClick={() => {
                                        reset();
                                        setShowAddModal(false);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="bg-green-500 text-white px-3 py-1 rounded duration-150 ease-in-out hover:bg-green-700"
                                    onClick={async () => {
                                        const valid = await trigger();
                                        if (valid) {
                                            handleSubmit(onSubmit)();
                                        }
                                    }}
                                >
                                    Add
                                </button>

                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0  flex justify-center items-center z-10">
                    <div className="bg-white p-6 rounded shadow w-80">
                        <p className="mb-4">Are you sure you want to delete this product?</p>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="bg-gray-300 px-3 py-1 rounded"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-500 text-white px-3 py-1 rounded"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
