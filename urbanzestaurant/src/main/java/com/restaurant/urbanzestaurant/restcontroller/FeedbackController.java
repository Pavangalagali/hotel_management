package com.restaurant.urbanzestaurant.restcontroller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.restaurant.urbanzestaurant.dto.FeedbackRequest;
import com.restaurant.urbanzestaurant.dto.FeedbackResponse;
import com.restaurant.urbanzestaurant.service.FeedbackService;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    @PostMapping("/submit")
    public ResponseEntity<FeedbackResponse> submit(@RequestBody FeedbackRequest request) {
        return ResponseEntity.ok(feedbackService.submitFeedback(request));
    }

    @GetMapping("/all")
    public ResponseEntity<List<FeedbackResponse>> all() {
        return ResponseEntity.ok(feedbackService.getAllFeedback());
    }

    @GetMapping("/active-orders")
    public ResponseEntity<List<FeedbackResponse>> allForActiveOrders() {
        return ResponseEntity.ok(feedbackService.getAllFeedbackForActiveOrders());
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<FeedbackResponse> byOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(feedbackService.getFeedbackByOrder(orderId));
    }
}
