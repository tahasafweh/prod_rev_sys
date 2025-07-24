/**
 * Product Detail Page JavaScript
 * Handles loading product details, reviews, and user interactions
 */


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === name + "=") {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
axios.defaults.headers.common["X-CSRFToken"] = getCookie("csrftoken");
// Get product ID from URL
const getProductId = () => {
    const pathParts = window.location.pathname.split('/');
    const productIdIndex = pathParts.indexOf('products') + 1;
    return pathParts[productIdIndex];
};

// Format date to readable string
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ar-SA', options);
};

// Generate star HTML based on rating
const generateStarsHtml = (rating) => {
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            starsHtml += '<i class="fas fa-star"></i>';
        } else {
            starsHtml += '<i class="far fa-star"></i>';
        }
    }
    return starsHtml;
};

// Load product details
const loadProductDetails = async (productId) => {
    try {
        const response = await axios.get(`/api/products/${productId}/`);
        const product = response.data;
        
        // Update product details
        document.getElementById('product-name').textContent = product.name;
        document.getElementById('product-description').textContent = product.description;
        
        if (product.price) {
            document.getElementById('product-price').textContent = `${product.price} ريال`;
        }
        
        // Load product image if available
        if (product.image) {
            document.getElementById('product-image').src = product.image;
        }
        
        // Load rating information
        loadProductRatings(productId);
        
    } catch (error) {
        console.error('Error loading product details:', error);
        showAuthAlert('حدث خطأ أثناء تحميل تفاصيل المنتج', 'danger');
    }
};

// Load product ratings
const loadProductRatings = async (productId) => {
    try {
        const response = await axios.get(`/api/products/${productId}/ratings/`);
        const ratingInfo = response.data;
        
        // Update rating display
        document.getElementById('product-rating').textContent = ratingInfo.average_rating;
        document.getElementById('reviews-count').textContent = `${ratingInfo.approved_reviews} مراجعات`;
        
        // Update stars
        const starsContainer = document.getElementById('product-stars');
        starsContainer.innerHTML = generateStarsHtml(Math.round(ratingInfo.average_rating));
        
    } catch (error) {
        console.error('Error loading product ratings:', error);
    }
};

// Load reviews for the product
const loadReviews = async (productId, filters = {}) => {
    const loadingIndicator = document.getElementById('loading-indicator');
    const noReviewsElement = document.getElementById('no-reviews');
    const reviewsList = document.getElementById('reviews-list');
    
    try {
        // Show loading indicator
        loadingIndicator.classList.remove('d-none');
        
        // Build query parameters
        let queryParams = new URLSearchParams();
        if (filters.rating && filters.rating !== 'all') {
            queryParams.append('rating', filters.rating);
        }
        if (filters.ordering) {
            queryParams.append('ordering', filters.ordering);
        }
        
        // Fetch reviews
        const response = await axios.get(`/api/products/${productId}/reviews/?${queryParams.toString()}`);
        const reviews = response.data;
        
        // Hide loading indicator
        loadingIndicator.classList.add('d-none');
        
        // Clear existing reviews
        while (reviewsList.querySelector('.review-card')) {
            reviewsList.querySelector('.review-card').remove();
        }
        
        // Show no reviews message if no reviews
        if (!reviews.length) {
            noReviewsElement.classList.remove('d-none');
            return;
        }
        
        // Hide no reviews message
        noReviewsElement.classList.add('d-none');
        
        // Render each review
        reviews.forEach(review => {
            const reviewElement = createReviewElement(review);
            reviewsList.appendChild(reviewElement);
        });
        
    } catch (error) {
        console.error('Error loading reviews:', error);
        loadingIndicator.classList.add('d-none');
        showAuthAlert('حدث خطأ أثناء تحميل المراجعات', 'danger');
    }
};

// Create a review element from template
const createReviewElement = (review) => {
    // Clone the template
    const template = document.getElementById('review-template');
    const reviewElement = document.importNode(template.content, true).querySelector('.review-card');
    
    // Set review data
    reviewElement.setAttribute('data-review-id', review.id);
    reviewElement.querySelector(".review-username").innerHTML =` ${review.user}`;
    reviewElement.querySelector('.review-stars').innerHTML = generateStarsHtml(review.rating);
    reviewElement.querySelector('.review-date').textContent = formatDate(review.created_at);
    reviewElement.querySelector('.review-text').textContent = review.review_text;
    
    // Set interaction counts
    reviewElement.querySelector('.likes-count').textContent = review.likes_count || 0;
    reviewElement.querySelector('.views-count').textContent = review.views_count || 0;
    
    // Set interaction buttons state
    if (review.user_liked) {
        reviewElement.querySelector('.like-button').classList.add('active');
    }
    
    // Set helpful button state
    if (review.user_helpful) {
        const dislikeButton = reviewElement.querySelector('.dislike-button');
        dislikeButton.classList.add('active');
        dislikeButton.querySelector('i').classList.remove('far');
        dislikeButton.querySelector('i').classList.add('fas');
    }
    
    if (review.reported) {
        reviewElement.querySelector('.report-button').classList.add('active');
        reviewElement.querySelector('.report-button').disabled = true;
        reviewElement.querySelector('.report-button').innerHTML = '<i class="fas fa-flag"></i> تم الإبلاغ';
    }
    
    // Add event listeners for interactions
    
    setupInteractionListeners(reviewElement, review.id);
    
    return reviewElement;
};

// Setup listeners for review interactions
const setupInteractionListeners = (reviewElement, reviewId) => {
    // Like button
    const likeButton = reviewElement.querySelector('.like-button');
    likeButton.addEventListener('click', () => handleLikeInteraction(reviewId, likeButton));
    
    // Dislike button
    const dislikeButton = reviewElement.querySelector('.dislike-button');
    dislikeButton.addEventListener('click', () => handleDislikeInteraction(reviewId, dislikeButton));
    
    // Report button
    const reportButton = reviewElement.querySelector('.report-button');
    reportButton.addEventListener('click', () => handleReportInteraction(reviewId, reportButton));
};

// Debug function to log interaction state
const logInteractionState = (reviewId, type, state, response = null) => {
    console.group(`Review ${reviewId} ${type} Interaction`);
    console.log('State:', state);
    if (response) {
        console.log('Response:', response);
    }
    console.groupEnd();
};

// Handle like interaction
const handleLikeInteraction = async (reviewId, button) => {
    if (!Auth.isLoggedIn()) {
        showAuthAlert('يجب تسجيل الدخول للتفاعل مع المراجعات', 'warning');
        return;
    }
    
    try {
        // Store original state to restore in case of error
        const wasActive = button.classList.contains('active');
        const originalCount = parseInt(button.querySelector('.likes-count').textContent);
        
        logInteractionState(reviewId, 'Like', { wasActive, originalCount });
        
        // Optimistically update UI
        button.classList.toggle('active');
        
        // Update icon
        const icon = button.querySelector('i');
        if (button.classList.contains('active')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
        }
        
        const countElement = button.querySelector('.likes-count');
        countElement.textContent = wasActive ? originalCount - 1 : originalCount + 1;
        
        // Send request to server
        const response = await axios.post('/api/review-interactions/', {
            review: reviewId,
            liked: true  // Always send true, the backend will handle toggling
        });
        
        // Update UI based on the actual server response
        const actualLikedState = response.data.liked;
        
        if (button.classList.contains('active') !== actualLikedState) {
            // If UI state doesn't match server state, update it
            button.classList.toggle('active');
            
            // Update icon to match server state
            if (actualLikedState) {
                icon.classList.remove('far');
                icon.classList.add('fas');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
            
            // Update count
            countElement.textContent = actualLikedState ? 
                originalCount + 1 : originalCount;
        }
        
        logInteractionState(reviewId, 'Like', { success: true, serverState: actualLikedState }, response.data);
        
    } catch (error) {
        console.error('Error handling like interaction:', error);
        
        // Restore original state on error
        const isNowActive = button.classList.contains('active');
        button.classList.toggle('active');
        
        // Restore icon
        const icon = button.querySelector('i');
        if (button.classList.contains('active')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
        }
        
        const countElement = button.querySelector('.likes-count');
        let currentCount = parseInt(countElement.textContent);
        countElement.textContent = isNowActive ? currentCount - 1 : currentCount + 1;
        
        logInteractionState(reviewId, 'Like', { error: true, errorMessage: error.message });
        showAuthAlert('حدث خطأ أثناء تسجيل التفاعل', 'danger');
    }
};











    if (!Auth.isLoggedIn()) 
  
// Handle report interaction

// دالة لبناء عرض المراجعة أو تحديث حالة زر الإبلاغ
function updateReviewReportButton(reviewElement, review) {
    const reportButton = reviewElement.querySelector(".report-button");
    if (review.reported) {
        reportButton.classList.add("active");
        reportButton.disabled = true;
        reportButton.innerHTML = '<i class="fas fa-flag"></i> تم الإبلاغ';
    } else {
        reportButton.classList.remove("active");
        reportButton.disabled = false;
        reportButton.innerHTML = '<i class="far fa-flag"></i> إبلاغ';
    }
}

// مثال عند بناء المراجعات (يجب استدعاء updateReviewReportButton لكل مراجعة)
function renderReview(review) {
    const reviewElement = document.querySelector(`[data-review-id="${review.id}"]`);
    if (!reviewElement) return;

    // تحديث زر الإبلاغ حسب حالة البلاغ
    updateReviewReportButton(reviewElement, review);

    // بقية التحديثات لعرض بيانات المراجعة هنا
}




const handleReportInteraction = async (reviewId, button) => {
    if (!Auth.isLoggedIn()) {
        showAuthAlert("يجب تسجيل الدخول للإبلاغ عن المراجعات", "warning");
        return;
    }

    if (confirm("هل أنت متأكد من الإبلاغ عن هذه المراجعة؟")) {
        try {
            const response = await axios.post(
                "/api/admin/reports/",
                { review: reviewId },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                        "Content-Type": "application/json",
                        "X-CSRFToken": getCookie("csrftoken"),
                    },
                }
            );

            logInteractionState(reviewId, "Report", { success: true }, response.data);

            // تحديث حالة الزر بعد الإبلاغ
            button.classList.add("active");
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-flag"></i> تم الإبلاغ';

            showAuthAlert("تم الإبلاغ عن المراجعة بنجاح", "success");
        } catch (error) {
            console.error("Error reporting review:", error);

            if (error.response && error.response.data && error.response.data.error) {
                showAuthAlert(error.response.data.error, "danger");
            } else {
                showAuthAlert("حدث خطأ أثناء الإبلاغ عن المراجعة", "danger");
            }

            logInteractionState(reviewId, "Report", { error: true, errorMessage: error.message });
        }
    }
};



// تفعيل حدث الضغط على زر الإبلاغ في الصفحة
document.addEventListener("click", function (event) {
    const button = event.target.closest(".report-button");
    if (button) {
        const reviewCard = button.closest(".review-card");
        const reviewId = reviewCard.getAttribute("data-review-id");
        handleReportInteraction(reviewId, button);
    }
});








// Handle submitting a new review
const handleSubmitReview = async () => {
    if (!Auth.isLoggedIn()) {
        showAuthAlert('يجب تسجيل الدخول لإضافة مراجعة', 'warning');
        return;
    }
    
    const productId = getProductId();
    const ratingValue = document.getElementById('rating-value').value;
    const reviewText = document.getElementById('review-text').value;
    
    // Validate input
    if (ratingValue === '0') {
        showAuthAlert('يرجى اختيار تقييم بالنجوم', 'warning');
        return;
    }
    
    if (!reviewText.trim()) {
        showAuthAlert('يرجى كتابة نص المراجعة', 'warning');
        return;
    }
    
    try {
        const response = await axios.post(`/api/products/${productId}/reviews/`, {
            rating: parseInt(ratingValue),
            review_text: reviewText
        });
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('reviewModal'));
        modal.hide();
        
        // Reset form
        document.getElementById('review-form').reset();
        document.querySelectorAll('.rating-star').forEach(star => star.classList.remove('active'));
        document.getElementById('rating-value').value = '0';
        
        showAuthAlert('تم إرسال المراجعة بنجاح وستظهر بعد الموافقة عليها', 'success');
        
    } catch (error) {
        console.error('Error submitting review:', error);
        showAuthAlert('حدث خطأ أثناء إرسال المراجعة', 'danger');
    }
};
// Handle logout
const handleLogout = async () => {
    try {
        const refreshToken = Auth.getRefreshToken();
        if (refreshToken) {
            await axios.post('/api/logout/', { refresh: refreshToken });
        }
        Auth.clearAuthData();
        window.location.reload();
    } catch (error) {
        console.error('Logout error:', error);
        Auth.clearAuthData();
        window.location.reload();
    }
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    const productId = getProductId();
    
    if (!productId) {
        showAuthAlert('لم يتم العثور على معرف المنتج', 'danger');
        return;
    }
    
    // Load product details and reviews
    loadProductDetails(productId);
    loadReviews(productId);
    
    // Setup filter listeners
    document.getElementById('rating-filter').addEventListener('change', (e) => {
        const filters = {
            rating: e.target.value,
            ordering: document.getElementById('sort-by').value
        };
        loadReviews(productId, filters);
    });
    
    document.getElementById('sort-by').addEventListener('change', (e) => {
        const filters = {
            rating: document.getElementById('rating-filter').value,
            ordering: e.target.value
        };
        loadReviews(productId, filters);
    });
    
    // Setup star rating in the form
    document.querySelectorAll('.rating-star').forEach(star => {
        star.addEventListener('click', () => {
            const rating = star.getAttribute('data-rating');
            document.getElementById('rating-value').value = rating;
            
            // Update stars visual
            document.querySelectorAll('.rating-star').forEach(s => {
                if (s.getAttribute('data-rating') <= rating) {
                    s.classList.remove('far');
                    s.classList.add('fas');
                    s.classList.add('active');
                } else {
                    s.classList.add('far');
                    s.classList.remove('fas');
                    s.classList.remove('active');
                }
            });
        });
    });
    
    // Setup review submission
    document.getElementById('submit-review').addEventListener('click', handleSubmitReview);
    
    // Setup logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
}); 


document.addEventListener("click", function (e) {
    if (e.target && e.target.matches(".btn-primary.auth-login-required")) {
        const reviewCard = e.target.closest(".review-card");
        const reviewId = reviewCard.dataset.reviewId;  // لازم نكون ضايفين data-review-id
        const commentBox = reviewCard.querySelector(".comment-input");
        const commentText = commentBox.value.trim();

        if (!commentText) {
            alert("الرجاء كتابة تعليق قبل الإرسال.");
            return;
        }

        fetch(`/reviews/${reviewId}/comment/`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie('csrftoken'),
                "Authorization": "Bearer " + localStorage.getItem("product_review_access_token")
            },
            body: JSON.stringify({
                comment_text: commentText
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("فشل في إرسال التعليق");
            }
            return response.json();
        })
        .then(data => {
            const commentItem = document.createElement("li");
            commentItem.className = "list-group-item";
            commentItem.textContent = `${data.user}: ${data.comment_text}`;
            reviewCard.querySelector(".comments-list").appendChild(commentItem);
            commentBox.value = "";
        })
        .catch(error => {
            alert("حدث خطأ أثناء إرسال التعليق.");
            console.error(error);
        });
    }
});
