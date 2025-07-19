from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from products.models import Product, Review
import random
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Add sample products and reviews to the database'

    def handle(self, *args, **kwargs):
        # Check if admin user exists, create if not
        try:
            admin_user = User.objects.get(username='admin')
            self.stdout.write(self.style.SUCCESS('Admin user already exists'))
        except User.DoesNotExist:
            admin_user = User.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password='admin123'
            )
            self.stdout.write(self.style.SUCCESS('Created admin user'))

        # Sample product data in Arabic
        products_data = [
            {
                'name': 'هاتف ذكي Galaxy S23',
                'description': 'هاتف ذكي متطور مع كاميرا عالية الدقة وبطارية تدوم طويلاً. يأتي بشاشة AMOLED مقاس 6.1 بوصة وذاكرة داخلية 256 جيجابايت.',
                'price': 3999.99
            },
            {
                'name': 'لابتوب MacBook Pro',
                'description': 'حاسوب محمول قوي للمحترفين مع معالج M2 وشاشة Retina عالية الدقة. يأتي مع 16 جيجابايت من الذاكرة و1 تيرابايت من التخزين.',
                'price': 8499.99
            },
            {
                'name': 'سماعات AirPods Pro',
                'description': 'سماعات لاسلكية مع ميزة إلغاء الضوضاء النشط وجودة صوت استثنائية. تأتي مع علبة شحن لاسلكية وتدعم المساعد الصوتي.',
                'price': 899.99
            },
            {
                'name': 'ساعة ذكية Apple Watch',
                'description': 'ساعة ذكية متطورة تتبع نشاطك البدني وتقدم إشعارات ذكية. مقاومة للماء وتدعم تطبيقات متنوعة.',
                'price': 1599.99
            },
            {
                'name': 'تلفزيون ذكي OLED',
                'description': 'تلفزيون بدقة 4K مع تقنية OLED للألوان النابضة بالحياة وتباين مذهل. يدعم التطبيقات الذكية ومساعدات الصوت.',
                'price': 5999.99
            },
            {
                'name': 'كاميرا Canon EOS R5',
                'description': 'كاميرا احترافية بدقة 45 ميجابكسل وقدرة على تصوير فيديو بدقة 8K. تأتي مع نظام تثبيت صورة متطور وتركيز تلقائي سريع.',
                'price': 12999.99
            },
            {
                'name': 'سماعة رأس للألعاب',
                'description': 'سماعة رأس مخصصة للألعاب مع صوت محيطي وميكروفون قابل للإزالة. مريحة للاستخدام لفترات طويلة مع إضاءة RGB.',
                'price': 499.99
            },
            {
                'name': 'جهاز iPad Pro',
                'description': 'جهاز لوحي متطور مع شاشة Liquid Retina XDR ومعالج M1 للأداء الفائق. مثالي للرسم والتصميم والإنتاجية.',
                'price': 4299.99
            },
            {
                'name': 'روبوت مكنسة ذكية',
                'description': 'روبوت تنظيف ذكي يعمل بتقنية الليزر لرسم خرائط المنزل. يمكن التحكم به عبر التطبيق ويعود تلقائيًا للشحن.',
                'price': 1299.99
            },
            {
                'name': 'سماعات Sony WH-1000XM5',
                'description': 'سماعات رأس لاسلكية مع أفضل تقنية لإلغاء الضوضاء في السوق. جودة صوت استثنائية وبطارية تدوم حتى 30 ساعة.',
                'price': 1499.99
            }
        ]

        # Add products
        products_created = 0
        for product_data in products_data:
            if not Product.objects.filter(name=product_data['name']).exists():
                Product.objects.create(
                    name=product_data['name'],
                    description=product_data['description'],
                    price=product_data['price'],
                    user=admin_user
                )
                products_created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {products_created} new products'))

        # Add some reviews for each product
        reviews_created = 0
        products = Product.objects.all()
        
        # Create some regular users if they don't exist
        users = []
        for i in range(1, 6):
            username = f'user{i}'
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                user = User.objects.create_user(
                    username=username,
                    email=f'{username}@example.com',
                    password='password123'
                )
                self.stdout.write(self.style.SUCCESS(f'Created user: {username}'))
            users.append(user)

        # Sample review texts in Arabic
        review_texts = [
            "منتج رائع، أنصح به بشدة!",
            "جودة ممتازة مقابل السعر.",
            "تجربة استخدام سلسة وممتعة.",
            "يستحق كل ريال دفعته فيه.",
            "أداء فائق وتصميم أنيق.",
            "لم يلبِ توقعاتي للأسف.",
            "منتج جيد ولكن هناك مجال للتحسين.",
            "سعره مرتفع قليلاً مقارنة بالميزات.",
            "استخدمته لمدة شهر وأنا سعيد جداً بالنتائج.",
            "تصميم عملي وأنيق، أحببت استخدامه."
        ]

        # Add reviews
        for product in products:
            # Add between 3-7 reviews for each product
            for _ in range(random.randint(3, 7)):
                user = random.choice(users)
                rating = random.randint(1, 5)
                review_text = random.choice(review_texts)
                
                # Don't create duplicate reviews
                if not Review.objects.filter(product=product, user=user).exists():
                    review = Review.objects.create(
                        product=product,
                        user=user,
                        rating=rating,
                        review_text=review_text,
                        is_visible=True,  # Make reviews visible by default
                        created_at=timezone.now() - timedelta(days=random.randint(1, 30))  # Random date within last month
                    )
                    reviews_created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {reviews_created} new reviews')) 