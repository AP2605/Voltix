package com.voltix.repository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
public class StoredProcedureRepository {

    private static final Logger log = LoggerFactory.getLogger(StoredProcedureRepository.class);
    private final JdbcTemplate jdbcTemplate;

    public StoredProcedureRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public record ProcedureResult(Integer id, String statusCode, String message, BigDecimal amount) {}

    public ProcedureResult reserveCharger(Integer userId, Integer vehicleId, Integer chargerId, LocalDateTime startTime, LocalDateTime endTime) {
        return jdbcTemplate.execute((Connection conn) -> {
            String sql = "{CALL reserve_charger(?, ?, ?, ?, ?, ?, ?, ?)}";
            try (CallableStatement cs = conn.prepareCall(sql)) {
                cs.setInt(1, userId);
                cs.setInt(2, vehicleId);
                cs.setInt(3, chargerId);
                cs.setTimestamp(4, Timestamp.valueOf(startTime));
                cs.setTimestamp(5, Timestamp.valueOf(endTime));
                cs.registerOutParameter(6, Types.INTEGER);
                cs.registerOutParameter(7, Types.VARCHAR);
                cs.registerOutParameter(8, Types.VARCHAR);

                cs.execute();

                int resId = cs.getInt(6);
                Integer reservationId = cs.wasNull() ? null : resId;
                String statusCode = cs.getString(7);
                String message = cs.getString(8);

                return new ProcedureResult(reservationId, statusCode, message, null);
            }
        });
    }

    public ProcedureResult startCharging(Integer reservationId) {
        return jdbcTemplate.execute((Connection conn) -> {
            String sql = "{CALL start_charging(?, ?, ?, ?)}";
            try (CallableStatement cs = conn.prepareCall(sql)) {
                cs.setInt(1, reservationId);
                cs.registerOutParameter(2, Types.INTEGER);
                cs.registerOutParameter(3, Types.VARCHAR);
                cs.registerOutParameter(4, Types.VARCHAR);

                cs.execute();

                int sId = cs.getInt(2);
                Integer sessionId = cs.wasNull() ? null : sId;
                String statusCode = cs.getString(3);
                String message = cs.getString(4);

                return new ProcedureResult(sessionId, statusCode, message, null);
            }
        });
    }

    public ProcedureResult endCharging(Integer sessionId) {
        return jdbcTemplate.execute((Connection conn) -> {
            String sql = "{CALL end_charging(?, ?, ?, ?)}";
            try (CallableStatement cs = conn.prepareCall(sql)) {
                cs.setInt(1, sessionId);
                cs.registerOutParameter(2, Types.DECIMAL);
                cs.registerOutParameter(3, Types.VARCHAR);
                cs.registerOutParameter(4, Types.VARCHAR);

                cs.execute();

                BigDecimal finalCost = cs.getBigDecimal(2);
                String statusCode = cs.getString(3);
                String message = cs.getString(4);

                return new ProcedureResult(sessionId, statusCode, message, finalCost);
            }
        });
    }

    public ProcedureResult processPayment(Integer sessionId, Integer userId, String paymentMethod) {
        return jdbcTemplate.execute((Connection conn) -> {
            String sql = "{CALL process_payment(?, ?, ?, ?, ?, ?)}";
            try (CallableStatement cs = conn.prepareCall(sql)) {
                cs.setInt(1, sessionId);
                cs.setInt(2, userId);
                cs.setString(3, paymentMethod);
                cs.registerOutParameter(4, Types.INTEGER);
                cs.registerOutParameter(5, Types.VARCHAR);
                cs.registerOutParameter(6, Types.VARCHAR);

                cs.execute();

                int pId = cs.getInt(4);
                Integer paymentId = cs.wasNull() ? null : pId;
                String statusCode = cs.getString(5);
                String message = cs.getString(6);

                return new ProcedureResult(paymentId, statusCode, message, null);
            }
        });
    }

    public BigDecimal calculateChargingCost(Integer sessionId) {
        String sql = "SELECT calculate_charging_cost(?)";
        return jdbcTemplate.queryForObject(sql, BigDecimal.class, sessionId);
    }

    public BigDecimal getStationOccupancy(Integer stationId) {
        String sql = "SELECT get_station_occupancy(?)";
        return jdbcTemplate.queryForObject(sql, BigDecimal.class, stationId);
    }

    public Map<String, Object> getStationReport(Integer stationId, LocalDate startDate, LocalDate endDate) {
        return jdbcTemplate.execute((Connection conn) -> {
            String sql = "{CALL station_report(?, ?, ?)}";
            Map<String, Object> report = new HashMap<>();
            try (CallableStatement cs = conn.prepareCall(sql)) {
                cs.setInt(1, stationId);
                cs.setDate(2, Date.valueOf(startDate));
                cs.setDate(3, Date.valueOf(endDate));

                boolean hasResults = cs.execute();
                int resultIndex = 0;

                while (hasResults) {
                    try (ResultSet rs = cs.getResultSet()) {
                        ResultSetMetaData md = rs.getMetaData();
                        int cols = md.getColumnCount();
                        List<Map<String, Object>> rows = new ArrayList<>();
                        while (rs.next()) {
                            Map<String, Object> row = new HashMap<>();
                            for (int i = 1; i <= cols; i++) {
                                row.put(md.getColumnLabel(i), rs.getObject(i));
                            }
                            rows.add(row);
                        }

                        if (resultIndex == 0) {
                            report.put("stationHeader", rows.isEmpty() ? null : rows.get(0));
                        } else if (resultIndex == 1) {
                            report.put("financialAndEnergy", rows.isEmpty() ? null : rows.get(0));
                        } else if (resultIndex == 2) {
                            report.put("healthAndFeedback", rows.isEmpty() ? null : rows.get(0));
                        }
                    }
                    resultIndex++;
                    hasResults = cs.getMoreResults();
                }
            }
            return report;
        });
    }
}
