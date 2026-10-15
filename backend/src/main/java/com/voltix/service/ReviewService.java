package com.voltix.service;

import com.voltix.dto.ReviewRequest;
import com.voltix.dto.ReviewResponse;
import com.voltix.entity.ChargingStation;
import com.voltix.entity.Review;
import com.voltix.entity.User;
import com.voltix.exception.BadRequestException;
import com.voltix.exception.ConflictException;
import com.voltix.exception.ForbiddenException;
import com.voltix.exception.ResourceNotFoundException;
import com.voltix.repository.ChargingStationRepository;
import com.voltix.repository.ReviewRepository;
import com.voltix.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ChargingStationRepository stationRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         ChargingStationRepository stationRepository,
                         UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.stationRepository = stationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ReviewResponse createReview(Integer userId, ReviewRequest request) {
        ChargingStation station = stationRepository.findById(request.getStationId())
                .orElseThrow(() -> new ResourceNotFoundException("ChargingStation", "id", request.getStationId()));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (reviewRepository.existsByUser_UserIdAndStation_StationId(userId, request.getStationId())) {
            throw new ConflictException("You have already submitted a review for station: " + station.getStationName());
        }

        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5 stars");
        }

        Review review = new Review(user, station, request.getRating(), request.getComment());
        Review saved = reviewRepository.save(review);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByStation(Integer stationId) {
        if (!stationRepository.existsById(stationId)) {
            throw new ResourceNotFoundException("ChargingStation", "id", stationId);
        }
        return reviewRepository.findByStation_StationIdOrderByCreatedAtDesc(stationId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByUser(Integer userId) {
        return reviewRepository.findByUser_UserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteReview(Integer userId, Integer reviewId, boolean isAdmin) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        if (!isAdmin && !review.getUser().getUserId().equals(userId)) {
            throw new ForbiddenException("You are not authorized to delete this review");
        }

        reviewRepository.delete(review);
    }

    private ReviewResponse mapToResponse(Review r) {
        return new ReviewResponse(
                r.getReviewId(),
                r.getUser().getUserId(),
                r.getUser().getName(),
                r.getStation().getStationId(),
                r.getStation().getStationName(),
                r.getRating(),
                r.getComment(),
                r.getCreatedAt()
        );
    }
}
