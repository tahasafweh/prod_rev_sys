async function loadNotifications() {
    const token = localStorage.getItem('product_review_access_token');
    if (!token) {
        console.error('No access token found, user might not be logged in');
        return;
    }
    const res = await fetch('/api/products/notifications/', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });

    if (!res.ok) {
        console.error('Failed to load notifications', res.status);
        return;
    }

    const data = await res.json();
    renderNotifications(data);
}

function renderNotifications(data) {
    const list = document.getElementById("notification-list");
    list.innerHTML = "";

    if (data.length === 0) {
        list.innerHTML = `
            <div class="center-card-wrapper">
                <div class="card text-center shadow">
                    <div class="card-body">
                        <h4 class="card-title text-muted">ليس لديك إشعارات جديدة</h4>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    data.forEach(n => {
        // إنشاء بطاقة الإشعار
        const card = document.createElement("div");
        card.className = "notification-item mb-3";
        card.dataset.read = n.is_read;
        card.dataset.message = n.message;
        card.dataset.id = n.id; // لإعادة الاستخدام بسهولة

        // محتوى الكارد مع رابط للمراجعة إذا موجودة
        card.innerHTML = `
            <div class="card ${n.is_read ? 'bg-light' : 'bg-white'} shadow-sm">
                <div class="card-body">
                    ${
                        n.related_review && n.related_review !== "null"
                            ? `<a href="#" class="text-decoration-none text-dark notification-link" data-id="${n.id}" data-review-id="${n.related_review}">
                                <h5 class="card-title">📌 ${n.message}</h5>
                                <p class="card-text text-muted">🕒 ${new Date(n.created_at).toLocaleString()}</p>
                               </a>`
                            : `<div class="text-dark">
                                <h5 class="card-title">📌 ${n.message}</h5>
                                <p class="card-text text-muted">🕒 ${new Date(n.created_at).toLocaleString()}</p>
                                <p class="text-muted">لا توجد مراجعة مرتبطة بهذا الإشعار</p>
                               </div>`
                    }
                </div>
            </div>
        `;

        list.appendChild(card);
    });

    // تعليم الإشعار كمقروء وفتح صفحة المراجعة عند الضغط على الرابط
    document.querySelectorAll('.notification-link').forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();

            const notifId = e.currentTarget.dataset.id;
            const reviewId = e.currentTarget.dataset.reviewId;

            try {
                // تعليم الإشعار كمقروء أولاً
                const token = localStorage.getItem('product_review_access_token');
                await fetch(`/api/products/notifications/${notifId}/read/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
                // بعد التأكيد، أعِد تحميل الإشعارات
                await loadNotifications();

                // توجيه المستخدم لصفحة المراجعة المرتبطة
                if (reviewId && reviewId !== "null") {
                    window.location.href = `/reviews/${reviewId}/`;
                }
            } catch (error) {
                console.error('Failed to mark notification as read or redirect:', error);
            }
        });
    });

    // تطبيق الفلترة بعد عرض الإشعارات
    filterNotifications();
}

// زر "تمت قراءة الكل"
async function markAsRead() {
    try {
        const token = localStorage.getItem('product_review_access_token');
        if (!token) {
            console.error('No access token found, user might not be logged in');
            return;
        }
        const res = await fetch('/api/products/notifications/', {
            method: 'POST',  // يجب أن يكون endpoint API عنده منطق تعليم الكل كمقروء
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        if (!res.ok) throw new Error('Failed to mark all as read');
        await loadNotifications();

        // بعد تعليم الكل كمقروء، اضبط الفلتر ليصبح على "المقروءة"
        document.getElementById("filter-read-status").value = "read";
        filterNotifications();
    } catch (error) {
        console.error(error);
    }
}

// فلترة (مقروء / غير مقروء) فقط بدون بحث
document.getElementById("filter-read-status").addEventListener("change", filterNotifications);

function filterNotifications() {
    const statusFilter = document.getElementById("filter-read-status").value;

    document.querySelectorAll(".notification-item").forEach(item => {
        const isRead = item.dataset.read === "true";

        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "unread" && !isRead) ||
            (statusFilter === "read" && isRead);

        item.style.display = matchesStatus ? "block" : "none";
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadNotifications();
});
