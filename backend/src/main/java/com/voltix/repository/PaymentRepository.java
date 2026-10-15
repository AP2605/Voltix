package com.voltix.repository;

import com.voltix.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    List<Payment> findByUser_UserIdOrderByPaymentTimeDesc(Integer userId);
    Optional<Payment> findBySession_SessionId(Integer sessionId);
    List<Payment> findByPaymentStatus(String paymentStatus);
}
