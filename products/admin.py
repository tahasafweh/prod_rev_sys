from django.contrib import admin
from .models import Product, Review , AdminReport

# تخصيص واجهة الأدمن للموديل Review
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'user', 'rating', 'is_visible', 'created_at')  # عرض أعمدة مفيدة
    list_filter = ('is_visible', 'created_at')  # فلترة حسب الحالة والتاريخ
    search_fields = ('product__name', 'user__username')  # بحث سريع
    list_editable = ('is_visible',)  # إمكانية تعديل القبول من الواجهة مباشرة
    ordering = ('-created_at',)

# تسجيل المنتج كما هو
admin.site.register(Product)

@admin.register(AdminReport)
class AdminReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'review', 'user', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('review__review_text', 'user__username')