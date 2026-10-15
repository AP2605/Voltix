package com.voltix.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_promotion")
public class UserPromotion {

    @EmbeddedId
    private UserPromotionId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("promotionId")
    @JoinColumn(name = "promotion_id", nullable = false)
    private Promotion promotion;

    @Column(name = "used_at", nullable = false, updatable = false)
    private LocalDateTime usedAt;

    public UserPromotion() {}

    public UserPromotion(User user, Promotion promotion) {
        this.user = user;
        this.promotion = promotion;
        this.id = new UserPromotionId(user.getUserId(), promotion.getPromotionId());
        this.usedAt = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.usedAt == null) {
            this.usedAt = LocalDateTime.now();
        }
    }

    public UserPromotionId getId() { return id; }
    public void setId(UserPromotionId id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Promotion getPromotion() { return promotion; }
    public void setPromotion(Promotion promotion) { this.promotion = promotion; }

    public LocalDateTime getUsedAt() { return usedAt; }
    public void setUsedAt(LocalDateTime usedAt) { this.usedAt = usedAt; }
}
