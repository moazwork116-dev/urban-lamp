import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

const CONTACT_PHONE = "01068301053";
const CONTACT_EMAIL = "moazwork116@gmail.com";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerAddress: "",
    notes: "",
  });
  const [selectedProducts, setSelectedProducts] = useState<Map<number, number>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const { data: products = [] } = trpc.products.list.useQuery();
  const createOrderMutation = trpc.orders.create.useMutation();

  // Get cart data from localStorage or URL params
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.customerName.trim()) {
      setErrorMessage("الرجاء إدخال الاسم");
      return;
    }
    if (!formData.customerPhone.trim()) {
      setErrorMessage("الرجاء إدخال رقم الهاتف");
      return;
    }
    if (!formData.customerEmail.trim()) {
      setErrorMessage("الرجاء إدخال البريد الإلكتروني");
      return;
    }
    if (!formData.customerAddress.trim()) {
      setErrorMessage("الرجاء إدخال العنوان");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // Calculate total price
      const items = Array.from(selectedProducts.entries()).map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        return {
          productId,
          quantity,
          priceAtPurchase: product?.price || 0,
        };
      });

      const totalPrice = items.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0);

      const result = await createOrderMutation.mutateAsync({
        order: {
          userId: 1, // Will be replaced with actual user ID from auth
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          customerEmail: formData.customerEmail,
          customerAddress: formData.customerAddress,
          totalPrice,
          status: "pending",
          paymentMethod: "cash_on_delivery",
          notes: formData.notes,
        },
        items,
      });

      setSubmitStatus("success");
      setTimeout(() => {
        setLocation("/");
      }, 2000);
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage("حدث خطأ في إرسال الطلب. الرجاء المحاولة مجدداً.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowRight className="w-5 h-5" />
            العودة للمتجر
          </button>
          <h1 className="text-3xl font-bold text-gray-900">إتمام الطلب</h1>
        </div>

        {submitStatus === "success" ? (
          <Card className="bg-white/90 backdrop-blur-md border-green-200">
            <CardContent className="pt-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">تم استقبال طلبك بنجاح!</h2>
              <p className="text-gray-600 mb-4">سيتم التواصل معك قريباً على الهاتف أو البريد الإلكتروني</p>
              <p className="text-sm text-gray-500">جاري إعادة التوجيه...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card className="bg-white/90 backdrop-blur-md border-gray-200">
                <CardHeader>
                  <CardTitle>بيانات التوصيل</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitOrder} className="space-y-6">
                    {/* Error Message */}
                    {errorMessage && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-red-700">{errorMessage}</p>
                      </div>
                    )}

                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="customerName" className="text-gray-700 font-semibold">
                        الاسم الكامل *
                      </Label>
                      <Input
                        id="customerName"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        placeholder="أدخل اسمك الكامل"
                        className="border-gray-300"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="customerPhone" className="text-gray-700 font-semibold">
                        رقم الهاتف *
                      </Label>
                      <Input
                        id="customerPhone"
                        name="customerPhone"
                        type="tel"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        placeholder="01000000000"
                        className="border-gray-300"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="customerEmail" className="text-gray-700 font-semibold">
                        البريد الإلكتروني *
                      </Label>
                      <Input
                        id="customerEmail"
                        name="customerEmail"
                        type="email"
                        value={formData.customerEmail}
                        onChange={handleInputChange}
                        placeholder="example@email.com"
                        className="border-gray-300"
                      />
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                      <Label htmlFor="customerAddress" className="text-gray-700 font-semibold">
                        العنوان الكامل *
                      </Label>
                      <Textarea
                        id="customerAddress"
                        name="customerAddress"
                        value={formData.customerAddress}
                        onChange={handleInputChange}
                        placeholder="المحافظة - المدينة - الشارع - رقم البيت"
                        rows={3}
                        className="border-gray-300"
                      />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-gray-700 font-semibold">
                        ملاحظات إضافية
                      </Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="أي ملاحظات أو تعليمات خاصة..."
                        rows={2}
                        className="border-gray-300"
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3"
                    >
                      {isSubmitting ? "جاري المعالجة..." : "تأكيد الطلب"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              {/* Contact Info */}
              <Card className="bg-white/90 backdrop-blur-md border-gray-200 mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">معلومات التواصل</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">الهاتف</p>
                    <p className="font-semibold text-gray-900">{CONTACT_PHONE}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                    <p className="font-semibold text-gray-900 break-all">{CONTACT_EMAIL}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Info */}
              <Card className="bg-white/90 backdrop-blur-md border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">طريقة الدفع</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-2">الدفع عند الاستلام</p>
                    <p className="text-xs text-blue-700">
                      سيتم استقبال طلبك والتواصل معك لتأكيد التفاصيل والسعر النهائي
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
