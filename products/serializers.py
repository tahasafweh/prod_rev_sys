from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from .models import Product, Review, ReviewInteraction, Notification1, AdminReport , ReviewComment
from rest_framework.exceptions import PermissionDenied



# ✅ User Serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def validate_password(self, value):
        """تشفير كلمة المرور قبل الحفظ"""
        return make_password(value)


# ✅ Product Serializer
class ProductSerializer(serializers.ModelSerializer):
    average_rating = serializers.SerializerMethodField(read_only=True)
    review_count = serializers.SerializerMethodField(read_only=True)
    image = serializers.ImageField(use_url=True)  

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "created_at",
            "user",
            "average_rating",
            "review_count",
            "image",
        ]
        read_only_fields = ["id", "created_at", "user"]

    def get_average_rating(self, obj):
        visible_reviews = obj.reviews.filter(is_visible=True)
        if visible_reviews.exists():
            return round(sum(review.rating for review in visible_reviews) / visible_reviews.count(), 1)
        return 0

    def get_review_count(self, obj):
        return obj.reviews.filter(is_visible=True).count()


# ✅ Review Serializer
class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    likes_count = serializers.SerializerMethodField()
    helpful_count = serializers.SerializerMethodField()
    views_count = serializers.IntegerField(read_only=True)
    

    # إضافات جديدة:
    user_liked = serializers.SerializerMethodField()
    reported = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            "id", "user", "rating", "review_text", "is_visible",
            "created_at", "likes_count", "helpful_count", "views_count",
            "user_liked", "reported"
        ]
        read_only_fields = ["id", "user", "created_at", "is_visible"]

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def get_likes_count(self, obj):
        return obj.interactions.filter(liked=True).count()

    def get_helpful_count(self, obj):
        return obj.interactions.filter(is_helpful=True).count()

    def get_user_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.interactions.filter(user=request.user, liked=True).exists()
        return False

    def get_reported(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return AdminReport.objects.filter(review=obj, user=request.user).exists()
        return False
# ✅ ReviewInteraction Serializer by rahaf
class ReviewInteractionSerializer(serializers.ModelSerializer):
    likes_count = serializers.SerializerMethodField()
    helpful_count = serializers.SerializerMethodField()

    class Meta:
        model = ReviewInteraction
        fields = ['id', 'review', 'is_helpful', 'liked', 'created_at', 'likes_count', 'helpful_count']
        read_only_fields = ['created_at', 'likes_count', 'helpful_count']

    def get_likes_count(self, obj):
        return ReviewInteraction.objects.filter(review=obj.review, liked=True).count()

    def get_helpful_count(self, obj):
        return ReviewInteraction.objects.filter(review=obj.review, is_helpful=True).count()

    def validate(self, data):
        user = self.context["request"].user
        review = data.get("review", None) or getattr(self.instance, "review", None)

        if review and review.user == user:
            raise PermissionDenied("لا يمكنك التفاعل على مراجعتك.")


        # فقط إذا هو إنشاء (self.instance = None)
        if self.instance is None:
            # هل يوجد تفاعل سابق لنفس المستخدم والمراجعة؟
            if ReviewInteraction.objects.filter(review=review, user=user).exists():
                raise serializers.ValidationError("لقد تفاعلت مع هذه المراجعة مسبقًا.")

        return data

# ✅ Notification Serializer
class NotificationSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Notification1
        fields = ["id", "user", "message", "related_review", "is_read", "created_at"]
        read_only_fields = ["id", "user", "created_at"]


# ✅ AdminReport Serializer
class AdminReportSerializer(serializers.ModelSerializer):
    review = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = AdminReport
        fields = ["id", "review", "status", "created_at"]
        read_only_fields = ["id", "review", "created_at"]

class ReviewCommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)  # عرض اسم المستخدم بدل ID

    class Meta:
        model = ReviewComment
        fields = ['id', 'review', 'user', 'comment_text', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
