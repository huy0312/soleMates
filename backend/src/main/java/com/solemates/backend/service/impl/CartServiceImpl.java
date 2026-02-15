package com.solemates.backend.service.impl;

import com.solemates.backend.model.Cart;
import com.solemates.backend.model.CartItem;
import com.solemates.backend.model.ChallengeOption;
import com.solemates.backend.model.User;
import com.solemates.backend.repository.CartItemRepository;
import com.solemates.backend.repository.CartRepository;
import com.solemates.backend.repository.ChallengeOptionRepository;
import com.solemates.backend.repository.UserRepository;
import com.solemates.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ChallengeOptionRepository challengeOptionRepository;

    @Override
    public Cart getCartByUserId(Long userId) {
        return cartRepository.findByUserUserId(userId)
                .orElseGet(() -> createCartForUser(userId));
    }

    private Cart createCartForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Cart cart = Cart.builder().user(user).build();
        return cartRepository.save(cart);
    }

    @Override
    @Transactional
    public Cart addToCart(Long userId, Long optionId, int quantity) {
        Cart cart = getCartByUserId(userId);
        ChallengeOption option = challengeOptionRepository.findById(optionId)
                .orElseThrow(() -> new RuntimeException("Option not found"));

        // Check if item exists
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getChallengeOption().getId().equals(optionId))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .challengeOption(option)
                    .quantity(quantity)
                    .build();
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }

        return cartRepository.save(cart);
    }

    @Override
    @Transactional
    public Cart removeFromCart(Long userId, Long cartItemId) {
        Cart cart = getCartByUserId(userId);
        cart.getItems().removeIf(item -> item.getId().equals(cartItemId));
        // Also delete from repo to ensure it's gone from DB if cascade doesn't handle
        // it perfectly immediately (though orphanRemoval should)
        cartItemRepository.deleteById(cartItemId);
        return cartRepository.save(cart);
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getCartByUserId(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }
}
