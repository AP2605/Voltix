package com.voltix.repository;

import com.voltix.entity.UserPromotion;
import com.voltix.entity.UserPromotionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserPromotionRepository extends JpaRepository<UserPromotion, UserPromotionId> {
    List<UserPromotion> findByUser_UserId(Integer userId);
    List<UserPromotion> findByPromotion_PromotionId(Integer promotionId);
}
