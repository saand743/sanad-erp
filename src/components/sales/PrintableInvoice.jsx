import React from 'react';
import QRCode from 'qrcode.react';

// دالة لتوليد رمز QR Code متوافق مع معيار TLV (نسخة مبسطة)
const generateTlvQrCode = (company, taxNumber, invoiceDate, total, vat) => {
  const toHex = (str) => {
    let hex = '';
    for (let i = 0; i < str.length; i++) {
      hex += '' + str.charCodeAt(i).toString(16);
    }
    return hex;
  };

  const formatTag = (tag, value) => {
    const valueAsUtf8 = new TextEncoder().encode(value.toString());
    let valueHex = '';
    valueAsUtf8.forEach((byte) => {
      valueHex += byte.toString(16).padStart(2, '0');
    });
    const lengthHex = (valueAsUtf8.length).toString(16).padStart(2, '0');
    return tag + lengthHex + valueHex;
  };

  const tags = [
    formatTag('01', company),
    formatTag('02', taxNumber),
    formatTag('03', new Date(invoiceDate).toISOString()),
    formatTag('04', total.toFixed(2)),
    formatTag('05', vat.toFixed(2)),
  ];

  const tlvString = tags.join('');
  const tlvBuffer = Buffer.from(tlvString, 'hex');
  return tlvBuffer.toString('base64');
};

const PrintableInvoice = React.forwardRef(({ invoice }, ref) => {
  if (!invoice) return null;

  const companyInfo = {
    name: 'شركة سند التقنية',
    tax_number: '300123456789013',
    address: 'الرياض، المملكة العربية السعودية',
  };

  const vatRate = 1.15; // 15% VAT
  const subtotal = invoice.total_amount / vatRate;
  const vatAmount = invoice.total_amount - subtotal;

  const qrCodeValue = generateTlvQrCode(
    companyInfo.name,
    companyInfo.tax_number,
    invoice.invoice_date,
    invoice.total_amount,
    vatAmount
  );

  return (
    <div ref={ref} className="p-8 font-sans" dir="rtl">
      <div  );

  return (
    <div ref={ref} className="p-8 font-sans bg-white text-black" dir="rtl">
      {/* Header */}
      <header className="flex justify-between items-start mb-8 border-b-2 border-gray-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{companyInfo.name}</h1>
          <p className="text-gray-600">{companyInfo.address}</p>
          <p className="text-gray-600">الرقم الضريبي: {companyInfo.tax_number}</p>
        </div>
        <div className="text-left">
          <h2 className="text-2xl font-bold text-gray-700">فاتورة ضريبية مبسطة</h2>
          <p className="text-gray-600">رقم الفاتورة: {invoice.invoice_number}</p>
          <p className="text-gray-600">التاريخ: {new Date(invoice.invoice_date).toLocaleDateString('ar-EG')}</p>
        </div>
      </header>

      {/* Customer Info */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold border-b border-gray-400 pb-2 mb-2">بيانات العميل</h3>
        <p><span className="font-semibold">الاسم:</span> {invoice.customer_name}</p>
        <p><span className="font-semibold">العنوان:</span> {invoice.customer_address || 'غير متوفر'}</p>
        <p><span className="font-semibold">الرقم الضريبي:</span> {invoice.customer_tax_number || 'غير متوفر'}</p>
      </section>

      {/* Invoice Items Table */}
      <table className="w-full mb-8 text-right border-collapse">
        <thead className="bg-gray-100 border-b-2 border-gray-800">
          <tr>
            <th className="p-2 font-semibold">الصنف</th>
            <th className="p-2 font-semibold">الكمية</th>
            <th className="p-2 font-semibold">سعر الوحدة</th>
            <th className="p-2 font-semibold">الإجمالي (شامل الضريبة)</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={index} className="border-b border-gray-300">
              <td className="p-2">{item.product_name}</td>
              <td className="p-2">{item.quantity}</td>
              <td className="p-2">{Number(item.unit_price * vatRate).toFixed(2)} ج.م</td>
              <td className="p-2">{Number(item.total_price).toFixed(2)} ج.م</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals and QR Code */}
      <footer className="flex justify-between items-start pt-4">
        <div>
          <QRCode value={qrCodeValue} size={128} />
        </div>
        <div className="text-left">
          <p className="text-lg"><span className="font-semibold">المجموع الفرعي:</span> {Number(subtotal).toFixed(2)} ج.م</p>
          <p className="text-lg"><span className="font-semibold">ضريبة القيمة المضافة (15%):</span> {Number(vatAmount).toFixed(2)} ج.م</p>
          <p className="text-2xl font-bold mt-2"><span className="font-semibold">الإجمالي:</span> {Number(invoice.total_amount).toFixed(2)} ج.م</p>
        </div>
      </footer>
    </div>
  );
});

PrintableInvoice.displayName = 'PrintableInvoice';
export default PrintableInvoice;

