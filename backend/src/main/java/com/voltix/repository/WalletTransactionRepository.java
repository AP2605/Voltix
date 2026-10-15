package com.voltix.repository;

import com.voltix.entity.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Integer> {
    List<WalletTransaction> findByWallet_WalletIdOrderByTimestampDesc(Integer walletId);
    List<WalletTransaction> findByWallet_WalletIdOrderByTimestampAsc(Integer walletId);
    List<WalletTransaction> findByWallet_User_UserIdOrderByTimestampDesc(Integer userId);
}
