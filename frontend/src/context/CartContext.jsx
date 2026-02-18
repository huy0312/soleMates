import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCart = async () => {
        if (!user) {
            setCart(null);
            setLoading(false);
            return;
        }
        try {
            const response = await api.get('/cart');
            setCart(response.data);
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [user]);

    const addToCart = async (optionId, quantity = 1) => {
        if (!user) {
            toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng.');
            return;
        }
        try {
            const response = await api.post('/cart/add', { optionId, quantity });
            setCart(response.data);
            toast.success('Đã thêm vào giỏ hàng!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng.');
        }
    };

    const removeFromCart = async (itemId) => {
        if (!user) return;
        try {
            const response = await api.delete(`/cart/${itemId}`);
            setCart(response.data);
        } catch (error) {
            console.error('Error removing from cart:', error);
            toast.error('Có lỗi xảy ra khi xóa khỏi giỏ hàng.');
        }
    };

    const cartItemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

    return (
        <CartContext.Provider value={{ cart, loading, addToCart, removeFromCart, cartItemCount, refreshCart: fetchCart }}>
            {children}
        </CartContext.Provider>
    );
};
