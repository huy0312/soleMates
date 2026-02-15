package com.solemates.backend.controller;

import com.solemates.backend.dto.AddToCartRequest;
import com.solemates.backend.model.Cart;
import com.solemates.backend.model.User;
import com.solemates.backend.service.CartService;
import com.solemates.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final UserService userService; // Assuming we can look up logic user here or use auth

    @GetMapping
    public ResponseEntity<Cart> getCart() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(cartService.getCartByUserId(currentUser.getUserId()));
    }

    @PostMapping("/add")
    public ResponseEntity<Cart> addToCart(@RequestBody AddToCartRequest request) {
        User currentUser = getCurrentUser();
        return ResponseEntity
                .ok(cartService.addToCart(currentUser.getUserId(), request.getOptionId(), request.getQuantity()));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Cart> removeFromCart(@PathVariable Long itemId) {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(cartService.removeFromCart(currentUser.getUserId(), itemId));
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        // Assuming UserService has findByEmail. If not, use repository or similar.
        // For simplicity reusing userService if available or just throwing if not
        // easily accessible.
        // Ideally we inject UserRepository or use a helper.
        // Let's assume we can get User object from UserService.
        return userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
