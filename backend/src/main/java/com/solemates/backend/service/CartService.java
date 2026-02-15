package com.solemates.backend.service;

import com.solemates.backend.model.Cart;

public interface CartService {
    Cart getCartByUserId(Long userId);

    Cart addToCart(Long userId, Long optionId, int quantity);

    Cart removeFromCart(Long userId, Long cartItemId);

    void clearCart(Long userId);
}
