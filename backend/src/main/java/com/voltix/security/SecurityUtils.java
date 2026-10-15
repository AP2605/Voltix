package com.voltix.security;

import com.voltix.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static Optional<UserPrincipal> getCurrentUserPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            return Optional.of(principal);
        }
        return Optional.empty();
    }

    public static Integer getCurrentUserId() {
        return getCurrentUserPrincipal()
                .map(UserPrincipal::getUserId)
                .orElseThrow(() -> new UnauthorizedException("User is not authenticated"));
    }

    public static String getCurrentUserEmail() {
        return getCurrentUserPrincipal()
                .map(UserPrincipal::getEmail)
                .orElseThrow(() -> new UnauthorizedException("User is not authenticated"));
    }

    public static String getCurrentUserRole() {
        return getCurrentUserPrincipal()
                .map(UserPrincipal::getRole)
                .orElseThrow(() -> new UnauthorizedException("User is not authenticated"));
    }

    public static boolean isCurrentUserAdmin() {
        return getCurrentUserPrincipal()
                .map(p -> "ADMIN".equalsIgnoreCase(p.getRole()))
                .orElse(false);
    }

    public static boolean isCurrentUserOperator() {
        return getCurrentUserPrincipal()
                .map(p -> "OPERATOR".equalsIgnoreCase(p.getRole()) || "ADMIN".equalsIgnoreCase(p.getRole()))
                .orElse(false);
    }
}
