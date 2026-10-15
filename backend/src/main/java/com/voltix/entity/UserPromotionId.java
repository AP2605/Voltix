package com.voltix.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class UserPromotionId implements Serializable {

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "promotion_id")
    private Integer promotionId;

    public UserPromotionId() {}

    public UserPromotionId(Integer userId, Integer promotionId) {
        this.userId = userId;
        this.promotionId = promotionId;
    }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public Integer getPromotionId() { return promotionId; }
    public void setPromotionId(Integer promotionId) { this.promotionId = promotionId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserPromotionId that = (UserPromotionId) o;
        return Objects.equals(userId, that.userId) && Objects.equals(promotionId, that.promotionId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, promotionId);
    }
}
