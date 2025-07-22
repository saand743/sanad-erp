const PAYMENT_ACCOUNT_MAPPING = {
  'نقداً': '10101', // Main Cash
  'تحويل بنكي': '10201', // Al-Rajhi Bank
};

export async function POST(request) {
  const body = await request.json();
  const { expenseId, paymentMethod, categoryAccountId } = body;

  // Validation
  if (!expenseId || !paymentMethod || !categoryAccountId) {
    return NextResponse.json({ success: false, error: 'بيانات الموافقة غير كاملة.' }, { status: 400 });
  }

  const creditAccountId = PAYMENT_ACCOUNT_MAPPING[paymentMethod];
  if (!creditAccountId) {
    return NextResponse.json({ success: false, error: 'طريقة الدفع غير صالحة.' }, { status: 400 });
  }
  
  const debitAccountId = categoryAccountId; // The expense account is debited

  // In a real application, you would:
  // 1. Start a database transaction.
  // 2. Find the expense by expenseId and verify its status is 'Pending'.
  // 3. Update the expense status to 'Approved' or 'Paid' and set the payment method.
  //    await sql`UPDATE expenses SET status = 'Approved', payment_method = ${paymentMethod} WHERE id = ${expenseId}`;
  // 4. Create the journal entry header and items (debit/credit).
  // 5. Commit the transaction.

  console.log('Approving Expense and Creating Journal Entry:', {
    expenseId,
    debit: { account: debitAccountId },
    credit: { account: creditAccountId }
  });

  return NextResponse.json({ success: true, message: 'تمت الموافقة على المصروف وتوليد قيد اليومية.' });
}