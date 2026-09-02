-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: process_payment.sql
-- Description: Transaction-safe Stored Procedure for billing settlement.
-- Features:
--   1. Validates session billing liability and user authorization
--   2. Prevents duplicate charges for already-settled sessions
--   3. Strict pessimistic row locking (SELECT ... FOR UPDATE) on digital wallets
--   4. Validates balance sufficiency before balance deduction
--   5. Creates immutable ledger audit record in wallet_transaction
--   6. Atomically creates payment receipt and commits or rolls back
-- ============================================================================

USE voltix_db;

DROP PROCEDURE IF EXISTS process_payment;

DELIMITER $$

CREATE PROCEDURE process_payment(
    IN  p_session_id     INT,
    IN  p_user_id        INT,
    IN  p_payment_method VARCHAR(20),
    OUT p_payment_id     INT,
    OUT p_status_code    VARCHAR(30),
    OUT p_message        VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_cost DECIMAL(10, 2) DEFAULT 0.00;
    DECLARE v_session_user INT DEFAULT NULL;
    DECLARE v_existing_payment INT DEFAULT NULL;
    DECLARE v_existing_status VARCHAR(20) DEFAULT NULL;
    DECLARE v_wallet_id INT DEFAULT NULL;
    DECLARE v_wallet_balance DECIMAL(10, 2) DEFAULT 0.00;

    SET p_payment_id = NULL;
    SET p_status_code = 'INIT';
    SET p_message = '';

    -- Error handler for unexpected SQL exceptions
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_code = 'SQL_EXCEPTION';
        SET p_message = 'Internal database exception encountered while processing payment.';
    END;

    -- 1. Validate Payment Method Parameter
    IF p_payment_method NOT IN ('WALLET', 'UPI', 'CARD') THEN
        SET p_status_code = 'INVALID_PAYMENT_METHOD';
        SET p_message = 'Invalid payment method. Permitted: WALLET, UPI, CARD.';
        LEAVE proc_label;
    END IF;

    -- 2. Validate Session and fetch billing cost
    SELECT 
        s.final_cost, 
        v.user_id 
    INTO 
        v_cost, 
        v_session_user
    FROM charging_session s
    JOIN vehicle v ON s.vehicle_id = v.vehicle_id
    WHERE s.session_id = p_session_id;

    IF v_session_user IS NULL THEN
        SET p_status_code = 'SESSION_NOT_FOUND';
        SET p_message = 'Charging session ID does not exist.';
        LEAVE proc_label;
    END IF;

    IF v_session_user != p_user_id THEN
        SET p_status_code = 'UNAUTHORIZED';
        SET p_message = 'User ID does not match the owner of the charging vehicle.';
        LEAVE proc_label;
    END IF;

    -- 3. Check if session has already been settled
    SELECT payment_id, payment_status 
    INTO v_existing_payment, v_existing_status
    FROM payment
    WHERE session_id = p_session_id;

    IF v_existing_payment IS NOT NULL AND v_existing_status = 'SUCCESS' THEN
        SET p_payment_id = v_existing_payment;
        SET p_status_code = 'ALREADY_PAID';
        SET p_message = 'This charging session has already been successfully paid.';
        LEAVE proc_label;
    END IF;

    -- 4. Begin ACID Transaction
    START TRANSACTION;

    -- 5. Wallet Settlement Workflow
    IF p_payment_method = 'WALLET' THEN
        SELECT wallet_id, balance 
        INTO v_wallet_id, v_wallet_balance
        FROM wallet
        WHERE user_id = p_user_id
        FOR UPDATE;

        IF v_wallet_id IS NULL THEN
            ROLLBACK;
            SET p_status_code = 'WALLET_NOT_FOUND';
            SET p_message = 'Digital wallet not found for this user account.';
            LEAVE proc_label;
        END IF;

        IF v_wallet_balance < v_cost THEN
            -- Record failed payment attempt for audit transparency
            INSERT INTO payment (
                session_id,
                user_id,
                amount,
                payment_method,
                payment_status,
                payment_time
            ) VALUES (
                p_session_id,
                p_user_id,
                v_cost,
                'WALLET',
                'FAILED',
                NOW()
            );

            COMMIT;
            SET p_status_code = 'INSUFFICIENT_BALANCE';
            SET p_message = CONCAT('Insufficient wallet balance. Required: ₹', v_cost, ', Available: ₹', v_wallet_balance);
            LEAVE proc_label;
        END IF;

        -- Deduct funds from digital wallet
        UPDATE wallet
        SET balance = balance - v_cost
        WHERE wallet_id = v_wallet_id;

        -- Create immutable audit ledger transaction entry
        INSERT INTO wallet_transaction (
            wallet_id,
            amount,
            transaction_type,
            timestamp
        ) VALUES (
            v_wallet_id,
            v_cost,
            'DEBIT',
            NOW()
        );
    END IF;

    -- 6. Insert Successful Payment Record (or update if previously failed attempt exists)
    IF v_existing_payment IS NOT NULL THEN
        UPDATE payment
        SET 
            amount = v_cost,
            payment_method = p_payment_method,
            payment_status = 'SUCCESS',
            payment_time = NOW()
        WHERE payment_id = v_existing_payment;
        
        SET p_payment_id = v_existing_payment;
    ELSE
        INSERT INTO payment (
            session_id,
            user_id,
            amount,
            payment_method,
            payment_status,
            payment_time
        ) VALUES (
            p_session_id,
            p_user_id,
            v_cost,
            p_payment_method,
            'SUCCESS',
            NOW()
        );

        SET p_payment_id = LAST_INSERT_ID();
    END IF;

    -- 7. Commit Transaction
    COMMIT;

    SET p_status_code = 'SUCCESS';
    SET p_message = CONCAT('Payment of ₹', v_cost, ' successfully completed via ', p_payment_method, '.');
END$$

DELIMITER ;

SELECT 'Created procedure process_payment successfully.' AS status;
