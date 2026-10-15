package com.voltix.controller;

import com.voltix.dto.ApiResponse;
import com.voltix.dto.ReviewRequest;
import com.voltix.dto.ReviewResponse;
import com.voltix.security.SecurityUtils;
import com.voltix.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@Tag(name = "Reviews", description = "Station feedback and driver rating submissions")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    @Operation(summary = "Submit a rating (1-5 stars) and review for a charging station")
    public ResponseEntity<ReviewResponse> createReview(@Valid @RequestBody ReviewRequest request) {
        Integer userId = SecurityUtils.getCurrentUserId();
        ReviewResponse response = reviewService.createReview(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/station/{stationId}")
    @Operation(summary = "Retrieve community ratings and testimonials for a station")
    public ResponseEntity<List<ReviewResponse>> getStationReviews(@PathVariable("stationId") Integer stationId) {
        List<ReviewResponse> reviews = reviewService.getReviewsByStation(stationId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/user")
    @Operation(summary = "Retrieve reviews authored by the authenticated user")
    public ResponseEntity<List<ReviewResponse>> getMyReviews() {
        Integer userId = SecurityUtils.getCurrentUserId();
        List<ReviewResponse> reviews = reviewService.getReviewsByUser(userId);
        return ResponseEntity.ok(reviews);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an existing review")
    public ResponseEntity<ApiResponse> deleteReview(@PathVariable("id") Integer id) {
        Integer userId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.isCurrentUserAdmin();
        reviewService.deleteReview(userId, id, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully"));
    }
}
