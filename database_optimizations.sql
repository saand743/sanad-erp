-- تحسينات أداء قاعدة البيانات لنظام سند ERP

-- إضافة فهارس (Indexes) لتسريع عمليات البحث والفلترة الشائعة.

-- 1. جدول فواتير المبيعات (sales_invoices)
-- لتسريع البحث حسب تاريخ الفاتورة وحسب العميل.
CREATE INDEX idx_sales_invoices_invoice_date ON sales_invoices(invoice_date);
CREATE INDEX idx_sales_invoices_customer_id ON sales_invoices(customer_id);

-- 2. جدول بنود الفواتير (sales_invoice_items)
-- لتسريع ربط البنود بالفواتير والمنتجات.
CREATE INDEX idx_sales_invoice_items_invoice_id ON sales_invoice_items(invoice_id);
CREATE INDEX idx_sales_invoice_items_product_id ON sales_invoice_items(product_id);

-- 3. جدول المنتجات (products)
-- لتسريع البحث بالاسم والتصنيف. استخدام GIN index لتحسين البحث النصي (ILIKE).
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_products_name_gin ON products USING gin (name gin_trgm_ops);
CREATE INDEX idx_products_category_id ON products(category_id);

-- 4. جدول القيود اليومية (journal_entries & details)
-- لتسريع إنشاء تقارير ميزان المراجعة وكشوف الحساب.
CREATE INDEX idx_journal_entries_entry_date ON journal_entries(entry_date);
CREATE INDEX idx_journal_entry_details_account_id ON journal_entry_details(account_id);