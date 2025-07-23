package com.restaurant.urbanzestaurant.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.restaurant.urbanzestaurant.dto.FeedbackRequest;
import com.restaurant.urbanzestaurant.dto.FeedbackResponse;
import com.restaurant.urbanzestaurant.entity.Feedback;
import com.restaurant.urbanzestaurant.entity.OrderEntity;
import com.restaurant.urbanzestaurant.repository.FeedbackRepository;
import com.restaurant.urbanzestaurant.repository.OrderRepository;

@Service
public class FeedbackService {

	@Autowired
    private  FeedbackRepository feedbackRepo;
	@Autowired
	private  OrderRepository orderRepo;

    public FeedbackResponse submitFeedback(FeedbackRequest request) {
        if (feedbackRepo.findByOrder_OrderId(request.getOrderId()).isPresent()) {
            throw new RuntimeException("Feedback already submitted for this order.");
        }

        OrderEntity order = orderRepo.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Feedback fb = new Feedback();
        fb.setOrder(order);
        fb.setRating(request.getRating());
        fb.setComment(request.getComment());
        fb.setSubmittedAt(LocalDateTime.now());

        fb = feedbackRepo.save(fb);

        return mapToDto(fb);
    }

    public List<FeedbackResponse> getAllFeedback() {
        return feedbackRepo.findAll().stream().map(this::mapToDto).toList();
    }

    public FeedbackResponse getFeedbackByOrder(Long orderId) {
        return feedbackRepo.findByOrder_OrderId(orderId)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Feedback not found for this order."));
    }

    private FeedbackResponse mapToDto(Feedback fb) {
        FeedbackResponse res = new FeedbackResponse();
        res.setId(fb.getId());
        res.setOrderId(fb.getOrder().getOrderId());
        res.setRating(fb.getRating());
        res.setComment(fb.getComment());
        res.setSubmittedAt(fb.getSubmittedAt());
        return res;
    }
}
