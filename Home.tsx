import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ShoppingCart, Phone, Mail, MapPin } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

const CONTACT_PHONE = "01068301053";
const CONTACT_EMAIL = "moazwork116@gmail.com";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: products = [] } = trpc.products.list.useQuery();
  const [selectedProducts, setSelectedProducts] = useState<Map<number, number>>(new Map());

  const handleAddToCart = (productId: number) => {
    const current = selectedProducts.get(productId) || 0;
    const newCart = new Map(selectedProducts);
    newCart.set(productId, current + 1);
    setSelectedProducts(newCart);
  };

  const handleCheckout = () => {
    setLocation("/checkout");
  };

  const cartTotal = Array.from(selectedProducts.entries()).reduce((sum, [productId, qty]) => {
    const product = products.find(p => p.id === productId);
    return sum + (product?.price || 0) * qty;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              متجرنا الإلكتروني
            </h1>
            <p className="text-gray-600 text-sm mt-1">أفضل المنتجات بأسعار منافسة</p>
          </div>
          <div className="flex items-center gap-4">
            {selectedProducts.size > 0 && (
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-600">{selectedProducts.size} منتج</span>
              </div>
            )}
            {isAuthenticated && (
              <Button variant="outline" onClick={() => setLocation("/admin")}>
                لوحة التحكم
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Contact Info Banner */}
        <div className="mb-12 bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">تواصل معنا</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-lg">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">رقم الهاتف</p>
                <p className="text-xl font-semibold text-gray-900">{CONTACT_PHONE}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-4 rounded-lg">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">البريد الإلكتروني</p>
                <p className="text-xl font-semibold text-gray-900">{CONTACT_EMAIL}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div>
          <h2 className="text-3xl font-bold mb-8 text-gray-900">المنتجات المتاحة</h2>
          
          {products.length === 0 ? (
            <Card className="bg-white/90 backdrop-blur-md border-gray-200">
              <CardContent className="pt-12 text-center">
                <p className="text-gray-600 text-lg">لا توجد منتجات متاحة حالياً</p>
                <p className="text-gray-500 text-sm mt-2">تابعنا قريباً لمزيد من المنتجات</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="bg-white/90 backdrop-blur-md border-gray-200 hover:shadow-xl transition-shadow overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="text-gray-400 text-center">
                        <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">لا توجد صورة</p>
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-gray-900">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2 text-gray-600">
                      {product.description || "لا يوجد وصف"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-blue-600">
                        {(product.price / 100).toFixed(2)} ج.م
                      </span>
                      <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                        product.stock > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {product.stock > 0 ? `${product.stock} متاح` : "غير متاح"}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={product.stock <= 0}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <ShoppingCart className="w-4 h-4 ml-2" />
                      أضف للسلة
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Checkout Section */}
        {selectedProducts.size > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 p-4 shadow-2xl">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">الإجمالي</p>
                <p className="text-3xl font-bold text-blue-600">
                  {(cartTotal / 100).toFixed(2)} ج.م
                </p>
              </div>
              <Button
                onClick={handleCheckout}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <ShoppingCart className="w-5 h-5 ml-2" />
                إتمام الطلب
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
