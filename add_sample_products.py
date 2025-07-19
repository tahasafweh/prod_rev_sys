import os
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ProductReviewSystem.settings')
django.setup()

from django.contrib.auth.models import User
from products.models import Product, Review
from django.utils import timezone
import random

def create_sample_products():
    # Get or create admin user
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@example.com',
            'is_staff': True,
            'is_superuser': True
        }
    )
    
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print("Created admin user")
    
    # Sample product data
    sample_products = [
        {
            'name': 'iPhone 15 Pro',
            'description': 'أحدث هاتف من شركة أبل مع كاميرا متطورة وشاشة عالية الدقة. يتميز بمعالج A17 Pro وذاكرة داخلية تبدأ من 128 جيجابايت.',
            'price': 4999.99
        },
        {
            'name': 'سماعة سوني WH-1000XM5',
            'description': 'سماعات لاسلكية فوق الأذن مع تقنية إلغاء الضوضاء المتطورة. تتميز بجودة صوت عالية وبطارية تدوم حتى 30 ساعة.',
            'price': 1499.99
        },
        {
            'name': 'لابتوب ماك بوك برو 16',
            'description': 'لابتوب احترافي مع شريحة M2 Pro، شاشة Liquid Retina XDR، وبطارية تدوم طوال اليوم. مثالي للمصممين والمطورين.',
            'price': 8999.99
        },
        {
            'name': 'ساعة سامسونج جالاكسي ووتش 6',
            'description': 'ساعة ذكية مع شاشة AMOLED وتتبع للياقة البدنية والصحة. تدعم الاتصال بالإنترنت والرد على الرسائل.',
            'price': 1299.99
        },
        {
            'name': 'سبيكر جي بي إل فليب 6',
            'description': 'مكبر صوت بلوتوث محمول مقاوم للماء مع صوت قوي وجهير عميق. يمكن استخدامه لمدة 12 ساعة متواصلة.',
            'price': 499.99
        },
        {
            'name': 'كاميرا كانون EOS R5',
            'description': 'كاميرا احترافية بدون مرآة مع مستشعر بدقة 45 ميجابكسل وتصوير فيديو 8K. تتميز بنظام تثبيت الصورة المتطور.',
            'price': 13999.99
        },
        {
            'name': 'تلفزيون إل جي OLED C2',
            'description': 'تلفزيون 65 بوصة بتقنية OLED مع معالج α9 الذكي ودعم لتقنيات HDR وDolby Vision. مثالي لمشاهدة الأفلام والألعاب.',
            'price': 7999.99
        },
        {
            'name': 'جهاز بلاي ستيشن 5',
            'description': 'منصة ألعاب متطورة مع معالج قوي ودعم لتقنية التتبع الشعاعي. يتضمن وحدة تحكم DualSense مع ميزات لمسية متقدمة.',
            'price': 2199.99
        },
        {
            'name': 'طابعة إبسون إيكوتانك L8180',
            'description': 'طابعة متعددة الوظائف مع نظام خزان الحبر الاقتصادي. تطبع بجودة عالية للصور والمستندات مع تكلفة تشغيل منخفضة.',
            'price': 2499.99
        },
        {
            'name': 'روبوت مكنسة شاومي S10+',
            'description': 'روبوت تنظيف ذكي مع تقنية الليزر للملاحة وقوة شفط عالية. يمكن التحكم به عبر التطبيق ويدعم التنظيف الرطب والجاف.',
            'price': 1799.99
        }
    ]
    
    # Create products
    created_count = 0
    for product_data in sample_products:
        product, created = Product.objects.get_or_create(
            name=product_data['name'],
            defaults={
                'description': product_data['description'],
                'price': product_data['price'],
                'user': admin_user
            }
        )
        
        if created:
            created_count += 1
    
    print(f"Created {created_count} new products")
    return created_count

def add_sample_reviews():
    # Get all products and users
    products = Product.objects.all()
    users = User.objects.all()
    
    if not products or not users:
        print("No products or users found")
        return 0
    
    # Sample review texts
    positive_reviews = [
        "منتج رائع جداً، أنصح به بشدة!",
        "جودة ممتازة وسعر معقول.",
        "أفضل شراء قمت به هذا العام.",
        "تجربة استخدام مميزة وسهلة.",
        "يستحق كل ريال دفعته فيه.",
        "أداء فائق يفوق التوقعات.",
        "تصميم أنيق ومواد عالية الجودة.",
        "خدمة عملاء ممتازة وشحن سريع.",
        "سعيد جداً بهذا المنتج، سأشتري منه مرة أخرى.",
        "يعمل بشكل مثالي منذ اليوم الأول."
    ]
    
    neutral_reviews = [
        "منتج جيد ولكن يمكن تحسينه.",
        "يؤدي الغرض المطلوب ولكن بدون مميزات إضافية.",
        "سعر مقبول مقابل الجودة المتوسطة.",
        "تجربة عادية، لا جديد يذكر.",
        "بعض المميزات جيدة والبعض الآخر متوسط."
    ]
    
    negative_reviews = [
        "لا أنصح بهذا المنتج، جودة سيئة.",
        "سعر مرتفع مقابل أداء ضعيف.",
        "توقعت أداء أفضل بكثير.",
        "واجهت مشاكل كثيرة أثناء الاستخدام.",
        "خدمة عملاء سيئة وتأخر في الشحن."
    ]
    
    # Create reviews
    review_count = 0
    for product in products:
        # Determine how many reviews to add (2-5 per product)
        num_reviews = random.randint(2, 5)
        
        for _ in range(num_reviews):
            # Select random user (excluding the product owner)
            user = random.choice([u for u in users if u != product.user])
            
            # Determine rating and select appropriate review text
            rating = random.randint(1, 5)
            if rating >= 4:
                review_text = random.choice(positive_reviews)
            elif rating >= 3:
                review_text = random.choice(neutral_reviews)
            else:
                review_text = random.choice(negative_reviews)
            
            # Create review with 50% chance of being visible
            is_visible = random.choice([True, False])
            
            review, created = Review.objects.get_or_create(
                product=product,
                user=user,
                defaults={
                    'rating': rating,
                    'review_text': review_text,
                    'is_visible': is_visible,
                    'created_at': timezone.now() - timezone.timedelta(days=random.randint(1, 30))
                }
            )
            
            if created:
                review_count += 1
    
    print(f"Created {review_count} new reviews")
    return review_count

if __name__ == "__main__":
    print("Adding sample data to the database...")
    product_count = create_sample_products()
    review_count = add_sample_reviews()
    print(f"Added {product_count} products and {review_count} reviews to the database.")
    print("Done!") 