import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowRight, ShoppingBag, CheckCircle, Truck, Package } from "lucide-react";

export default function Orders() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: orders = [] } = trpc.orders.list.useQuery();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
          >
            <ArrowRight className="w-5 h-5" />
            العودة للمتجر
          </button>
          <Card className="bg-white/90 backdrop-blur-md border-gray-200">
            <CardContent className="pt-12 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">يجب تسجيل الدخول</h2>
              <p className="text-gray-600">قم بتسجيل الدخول لعرض طلباتك</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Package className="w-5 h-5 text-yellow-600" />;
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case "shipped":
        return <Truck className="w-5 h-5 text-purple-600" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "cancelled":
        return <Package className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "قيد الانتظار";
      case "confirmed":
        return "تم التأكيد";
      case "shipped":
        return "تم الشحن";
      case "delivered":
        return "تم التسليم";
      case "cancelled":
        return "ملغى";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "shipped":
        return "bg-purple-100 text-purple-700";
      case "delivered":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowRight className="w-5 h-5" />
          العودة للمتجر
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">طلباتي</h1>
          <p className="text-gray-600 mt-2">مرحباً {user?.name}</p>
        </div>

        {orders.length === 0 ? (
          <Card className="bg-white/90 backdrop-blur-md border-gray-200">
            <CardContent className="pt-12 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">لا توجد طلبات</h2>
              <p className="text-gray-600 mb-6">لم تقم بأي طلبات حتى الآن</p>
              <Button onClick={() => setLocation("/")} className="bg-blue-600 hover:bg-blue-700">
                ابدأ التسوق
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="bg-white/90 backdrop-blur-md border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>الطلب #{order.id}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">بيانات التوصيل</h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-gray-600">الاسم:</span>{" "}
                          <span className="font-medium">{order.customerName}</span>
                        </p>
                        <p>
                          <span className="text-gray-600">الهاتف:</span>{" "}
                          <span className="font-medium">{order.customerPhone}</span>
                        </p>
                        <p>
                          <span className="text-gray-600">البريد:</span>{" "}
                          <span className="font-medium">{order.customerEmail}</span>
                        </p>
                        <p>
                          <span className="text-gray-600">العنوان:</span>{" "}
                          <span className="font-medium">{order.customerAddress}</span>
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">تفاصيل الطلب</h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">طريقة الدفع:</span>
                          <span className="font-medium">الدفع عند الاستلام</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">الإجمالي:</span>
                          <span className="font-bold text-lg text-blue-600">
                            {(order.totalPrice / 100).toFixed(2)} ج.م
                          </span>
                        </div>
                        {order.notes && (
                          <div className="pt-2 border-t border-gray-200">
                            <p className="text-xs text-gray-600 mb-1">ملاحظات:</p>
                            <p className="text-sm text-gray-700">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
