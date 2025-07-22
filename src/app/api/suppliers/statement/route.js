import { NextResponse } from 'next/server';

// بيانات وهمية للموردين (للحصول على الرصيد الافتتاحي)
const mockSuppliers = [
  { id: 1, name: 'شركة الإلكترونيات المتقدمة', opening_balance: 10000 },
  { id: 2, name: 'مؤسسة المواد الغذائية', opening_balance: 0 },
  { id: 3, name: 'مجموعة الأثاث العصري', opening_balance: -2500 },
];

// بيانات وهمية للمعاملات (فواتير شراء ومدفوعات)
const mockTransactions = [
    // Supplier 1
    { supplier_id: 1, transaction_type: 'purchase_invoice', transaction_date: '2024-03-10', reference_number: 'INV-P-2024-050', description: 'شراء شاشات', debit_amount: 8500, credit_amount: 0, attachment_url: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Invoice-050.pdf' },
    { supplier_id: 1, transaction_type: 'purchase_invoice', transaction_date: '2024-04-05', reference_number: 'INV-P-2024-062', description: 'شراء لوحات مفاتيح', debit_amount: 4200.50, credit_amount: 0, attachment_url: null },
    { supplier_id: 1, transaction_type: 'payment', transaction_date: '2024-04-15', reference_number: 'PAY-2024-031', description: 'دفعة تحت الحساب', debit_amount: 0, credit_amount: 7500, attachment_url: 'https://via.placeholder.com/150/008000/FFFFFF?text=Receipt-031.jpg' },
    { supplier_id: 1, transaction_type: 'purchase_invoice', transaction_date: '2024-05-20', reference_number: 'INV-P-2024-075', description: 'شراء ملحقات', debit_amount: 2500, credit_amount: 0, attachment_url: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Invoice-075.pdf' },
    
    // Supplier 2
    { supplier_id: 2, transaction_type: 'purchase_invoice', transaction_date: '2024-03-22', reference_number: 'INV-P-2024-055', description: 'مواد غذائية متنوعة', debit_amount: 12000, credit_amount: 0, attachment_url: null },
    { supplier_id: 2, transaction_type: 'payment', transaction_date: '2024-04-01', reference_number: 'PAY-2024-028', description: 'دفعة للمورد', debit_amount: 0, credit_amount: 12000, attachment_url: null },
    { supplier_id: 2, transaction_type: 'purchase_invoice', transaction_date: '2024-05-10', reference_number: 'INV-P-2024-071', description: 'شراء معلبات', debit_amount: 7000, credit_amount: 0, attachment_url: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Invoice-071.pdf' },
    { supplier_id: 2, transaction_type: 'payment', transaction_date: '2024-05-15', reference_number: 'PAY-2024-035', description: 'دفعة للمورد', debit_amount: 0, credit_amount: 2000, attachment_url: 'https://via.placeholder.com/150/008000/FFFFFF?text=Receipt-035.jpg' },
];

export async function POST(request) {
    try {
        const { supplier_id, from_date, to_date, transaction_type } = await request.json();

        if (!supplier_id) {
            return NextResponse.json({ success: false, error: 'معرف المورد مطلوب' }, { status: 400 });
        }

        const supplier = mockSuppliers.find(s => s.id === supplier_id);
        if (!supplier) {
            return NextResponse.json({ success: false, error: 'المورد غير موجود' }, { status: 404 });
        }

        // 1. Filter transactions for the specific supplier
        let supplierTransactions = mockTransactions.filter(t => t.supplier_id === supplier_id);

        // 2. Calculate opening balance for the period
        const openingBalance = supplier.opening_balance || 0;
        let balanceBeforePeriod = openingBalance;
        if (from_date) {
            supplierTransactions
                .filter(t => new Date(t.transaction_date) < new Date(from_date))
                .forEach(t => {
                    balanceBeforePeriod += (t.debit_amount - t.credit_amount);
                });
        }

        // 3. Filter transactions by date and type
        let periodTransactions = supplierTransactions.filter(t => {
            const transactionDate = new Date(t.transaction_date);
            const startDate = from_date ? new Date(from_date) : null;
            const endDate = to_date ? new Date(to_date) : null;

            const isAfterStart = !startDate || transactionDate >= startDate;
            const isBeforeEnd = !endDate || transactionDate <= endDate;
            const matchesType = transaction_type === 'all' || !transaction_type || t.transaction_type === transaction_type;

            return isAfterStart && isBeforeEnd && matchesType;
        });

        // 4. Calculate running balance and summaries
        let runningBalance = balanceBeforePeriod;
        let totalPurchases = 0;
        let totalPayments = 0;

        const transactionsWithBalance = periodTransactions.map(t => {
            runningBalance += (t.debit_amount - t.credit_amount);
            totalPurchases += t.debit_amount;
            totalPayments += t.credit_amount;
            return {
                ...t,
                running_balance: runningBalance,
                formatted_date: new Date(t.transaction_date).toLocaleDateString('ar-SA'),
            };
        });

        // 5. Prepare the final response
        const statement = {
            supplier_info: {
                id: supplier.id,
                name: supplier.name,
            },
            summary: {
                opening_balance: balanceBeforePeriod,
                total_purchases: totalPurchases,
                total_payments: totalPayments,
                current_balance: runningBalance,
            },
            transactions: transactionsWithBalance,
        };

        return NextResponse.json({ success: true, ...statement });

    } catch (error) {
        console.error('[API Supplier Statement Error]', error);
        return NextResponse.json({ success: false, error: 'حدث خطأ في الخادم أثناء جلب كشف الحساب' }, { status: 500 });
    }
}