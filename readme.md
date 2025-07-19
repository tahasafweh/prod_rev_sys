# Product Reviews & Ratings API
نظام تقييم ومراجعات المنتجات (Product Reviews & Ratings System)
نظام REST API مبني باستخدام Django وDjango REST Framework (DRF) ، يسمح للمستخدمين بإضافة مراجعات وتقييمات للمنتجات، ويتيح للمشرفين الموافقة عليها.

🔧 الميزات الرئيسية
✨ تسجيل المستخدم وتسجيل الدخول باستخدام JWT Authentication
✅ إنشاء منتجات جديدة
💬 كتابة مراجعات وتقييم النجوم (1-5)
👮‍♂️ صلاحيات واضحة:
المستخدمون يمكنهم تعديل/حذف مراجعاتهم فقط.
المشرفون فقط يمكنهم الموافقة على المراجعات.
🔍 فلاتر متقدمة: البحث حسب المنتج أو التقييم
📊 عرض متوسط التقييم وعدد المراجعات لكل منتج
🧪 اختبارات وحدوية كاملة
📦 Postman Collection جاهز لتجربة الـ API
🌐 واجهة مستخدم تفاعلية (HTML+CSS+JS)

🧩 المتطلبات التقنية
Python >= 3.8
اللغة الأساسية للمشروع
Django
إطار العمل الأساسي
DRF (Django REST Framework)
بناء الـ API
djangorestframework-simplejwt
دعم توكنات JWT
django-filter
الفلاتر في الـ API
HTML5/CSS3/JavaScript
واجهة المستخدم

## 📖 Overview
A REST API for managing product reviews and ratings, allowing users to create reviews, and administrators to approve them.
##  - Admin Insights System :

### نظام تقارير المشرف الذكي
تم تطوير نظام شامل لتحليل وإدارة مراجعات المنتجات من منظور المشرف:



#### Query Parameters للتقارير:
- `filter`: `unapproved`, `low_rated`, `offensive`, `all`
- `product_id`: تصفية حسب منتج معين
- `rating`: تصفية حسب التقييم
- `date_from` & `date_to`: تصفية حسب التاريخ

---

## 🚀 Features
- JWT Authentication
- CRUD Operations for Reviews
- Filter reviews by product and rating
- Average rating and count of approved reviews
- Admin-only review approval
- **NEW**: Comprehensive Admin Insights System
- **NEW**: Smart Review Management
- **NEW**: Offensive Content Detection
- **NEW**: Interactive Admin Dashboard
- **NEW for task 9**: Added a counter to track the number of reviews each user has submitted.
- **NEW for task 10**: Interactive frontend UI for product reviews
#### الميزات الجديدة:
- 📊 **تقارير شاملة**: إحصائيات المراجعات غير الموافق عليها، منخفضة التقييم، والمحتوى المسيء
- 🎛️ **إدارة المراجعات**: موافقة، رفض، وإشارة المراجعات
- 📈 **لوحة تحكم تفاعلية**: إحصائيات مفصلة وتوزيع التقييمات
- 🚨 **كشف المحتوى المسيء**: فحص تلقائي للمراجعات المسيئة
- 🔔 **نظام إشعارات**: إشعارات تلقائية للمستخدمين
-  **عداد المشاهدات للتاسك 9**: تم إضافة عداد لتتبع عدد المراجعات التي يقدمها كل مستخدم
-  **واجهة مستخدم تفاعلية للتاسك 10**: واجهة HTML/CSS/JS لعرض وإدارة المراجعات

## 🛠️ Installation
1. Clone the repository:
   ```bash
   git clone <https://github.com/rahafha1/product_review_system>
   cd product_review_system
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run migrations:
   ```bash
   python manage.py migrate
   ```

4. Create superuser:
   ```bash
   python manage.py createsuperuser
   ```

5. Run the server:
   ```bash
   python manage.py runserver
   ```

## 📚 API Endpoints

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/register/` | POST | User registration |
| `/api/token/` | POST | User login (JWT) |
| `/api/token/refresh/` | POST | Refresh JWT token |
| `/logout/` | POST | User logout |

### Products & Reviews
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/products/` | GET/POST | List/Create products |
| `/products/<id>/` | GET/PUT/DELETE | Product details |
| `/products/<product_id>/reviews/` | GET/POST | List/Create reviews |
| `/products/<product_id>/ratings/` | GET | Get product rating info |
| `/products/<product_id>/top-review/` | GET | Get top review for product |

### Admin Insights System (NEW)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin/reports/` | GET | Comprehensive admin reports |
| `/admin/reviews/{id}/approve/` | POST | Approve review |
| `/admin/reviews/{id}/reject/` | POST | Reject review |
| `/admin/reviews/{id}/flag/` | POST | Flag review for review |
| `/admin/dashboard/` | GET | Interactive admin dashboard |
#### Endpoints الجديدة:
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin/reports/` | GET | تقارير المشرف الشاملة |
| `/admin/reviews/{id}/approve/` | POST | الموافقة على مراجعة |
| `/admin/reviews/{id}/reject/` | POST | رفض مراجعة |
| `/admin/reviews/{id}/flag/` | POST | إشارة مراجعة |
| `/admin/dashboard/` | GET | لوحة التحكم التفاعلية |


### Review Interactions
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/review-interactions/` | GET/POST | Review interactions (like/helpful) |
| `/review-interactions/review/{id}/stats/` | GET | Review interaction statistics |

### Frontend Pages (NEW for Task 10)
| URL | Description |
|-----|-------------|
| `/product-list/` | Product listing page |
| `/products/<id>/reviews-page/` | Product detail with reviews |
| `/login/` | User login and registration page |

## 🔧 Usage Examples

### Admin Reports
```bash
# Get all admin reports
GET /admin/reports/

# Filter unapproved reviews
GET /admin/reports/?filter=unapproved

# Filter low-rated reviews
GET /admin/reports/?filter=low_rated

# Filter offensive content
GET /admin/reports/?filter=offensive

# Filter by product
GET /admin/reports/?product_id=1

# Filter by date range
GET /admin/reports/?date_from=2024-01-01&date_to=2024-12-31
```

### Review Management
```bash
# Approve a review
POST /admin/reviews/123/approve/

# Reject a review
POST /admin/reviews/123/reject/

# Flag a review
POST /admin/reviews/123/flag/
```

### Admin Dashboard
```bash
# Get comprehensive dashboard
GET /admin/dashboard/
```

## 🧪 Testing
Run the test suite:
```bash
python manage.py test
```

The test suite includes:
- Authentication tests
- Product and review CRUD tests
- Admin insights system tests
- Review interaction tests
- Integration tests

## 📦 Postman Collection
Import the provided Postman collection (`admin_insights_postman_collection.json`) to test all endpoints including the new Admin Insights System.

## 🔒 Security Features
- JWT Authentication
- Role-based permissions
- Product owner authorization
- Input validation
- Offensive content detection

## 📊 Admin Insights Features
- **Comprehensive Reporting**: Unapproved, low-rated, and offensive reviews
- **Smart Filtering**: Multiple filter options for detailed analysis

## 🌐 Task 10 - Frontend
تم تطوير واجهة مستخدم تفاعلية لعرض وإدارة مراجعات المنتجات باستخدام HTML و CSS و JavaScript.

### الملفات والمجلدات
- **المجلد الرئيسي**: `products/templates/products/`
- **ملفات CSS**: `products/static/products/css/`
- **ملفات JavaScript**: `products/static/products/js/`
- **الصور**: `products/static/products/img/`

### الصفحات
1. **قائمة المنتجات** (`product_list.html`):
   - عرض جميع المنتجات مع تفاصيلها الأساسية
   - متوسط التقييم وعدد المراجعات
   - رابط للانتقال لصفحة المراجعات

2. **تفاصيل المنتج والمراجعات** (`product_detail.html`):
   - عرض تفاصيل المنتج (الاسم، الوصف، السعر)
   - قائمة المراجعات مع التقييمات والتفاعلات
   - فلترة وترتيب المراجعات
   - نموذج إضافة مراجعة جديدة
   - أزرار التفاعل (إعجاب، عدم إعجاب، إبلاغ)

3. **تسجيل الدخول والتسجيل** (`login.html`):
   - نموذج تسجيل الدخول
   - نموذج إنشاء حساب جديد

### كيفية الاستخدام
1. قم بتشغيل خادم Django:
   ```bash
   python manage.py runserver
   ```

2. افتح المتصفح وانتقل إلى:
   - قائمة المنتجات: `http://localhost:8000/product-list/`
   - تفاصيل منتج: `http://localhost:8000/products/1/reviews-page/`
   - تسجيل الدخول: `http://localhost:8000/login/`

### التقنيات المستخدمة
- **HTML5/CSS3**: هيكل وتصميم الصفحات
- **Bootstrap 5**: إطار عمل CSS للتصميم المتجاوب
- **JavaScript/Axios**: التفاعل مع واجهة المستخدم والاتصال بالـ API
- **JWT**: التوثيق وإدارة الجلسات
