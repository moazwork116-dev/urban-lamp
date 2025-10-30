import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  ShoppingBag,
  Users,
  LogOut,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

type Tab = "products" | "orders" | "stats";

export default function AdminDashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);

  // Queries
  const { data: products = [], refetch: refetchProducts } = trpc.products.list.useQuery();
  const { data: orders = [], refetch: refetchOrders } = trpc.orders.list.useQuery();

  // Mutations
  const createProductMutation = trpc.products.create.useMutation();
  const updateProductMutation = trpc.products.update.useMutation();
  const deleteProductMutation = trpc.products.delete.useMutation();
  const updateOrderStatusMutation = trpc.orders.updateStatus.useMutation();

  // Form state
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
  });

  // Check authentication
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">الوصول مرفوض</h2>
            <p className="text-gray-600 mb-6">أنت لا تملك صلاحيات الوصول إلى لوحة التحكم</p>
            <Button onClick={() => setLocation("/")} className="w-full">
              العودة للمتجر
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProductMutation.mutateAsync({
        name: productForm.name,
        description: productForm.description,
        price: Math.round(parseFloat(productForm.price) * 100),
        stock: parseInt(productForm.stock),
        imageUrl: productForm.imageUrl || null,
      });
      setProductForm({ name: "", description: "", price: "", stock: "", imageUrl: "" });
      setShowAddProduct(false);
      refetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      try {
        await deleteProductMutation.mutateAsync({ id });
        refetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatusMutation.mutateAsync({
        id: orderId,
        status: newStatus,
      });
      refetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
            <p className="text-sm text-gray-600">مرحباً {user?.name}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">إجمالي المنتجات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-gray-900">{totalProducts}</span>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">إجمالي الطلبات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-gray-900">{totalOrders}</span>
                <ShoppingBag className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">إجمالي الإيرادات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-gray-900">
                  {(totalRevenue / 100).toFixed(2)} ج.م
                </span>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "products"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            المنتجات
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "orders"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            الطلبات
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">إدارة المنتجات</h2>
              <Button
                onClick={() => setShowAddProduct(!showAddProduct)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة منتج
              </Button>
            </div>

            {/* Add Product Form */}
            {showAddProduct && (
              <Card className="mb-6 border-blue-200">
                <CardHeader>
                  <CardTitle>إضافة منتج جديد</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>اسم المنتج *</Label>
                        <Input
                          value={productForm.name}
                          onChange={(e) =>
                            setProductForm({ ...productForm, name: e.target.value })
                          }
                          placeholder="اسم المنتج"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>السعر (ج.م) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={productForm.price}
                          onChange={(e) =>
                            setProductForm({ ...productForm, price: e.target.value })
                          }
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>الوصف</Label>
                      <Textarea
                        value={productForm.description}
                        onChange={(e) =>
                          setProductForm({ ...productForm, description: e.target.value })
                        }
                        placeholder="وصف المنتج"
                        rows={3}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>عدد المخزون *</Label>
                        <Input
                          type="number"
                          value={productForm.stock}
                          onChange={(e) =>
                            setProductForm({ ...productForm, stock: e.target.value })
                          }
                          placeholder="0"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>رابط الصورة</Label>
                        <Input
                          type="url"
                          value={productForm.imageUrl}
                          onChange={(e) =>
                            setProductForm({ ...productForm, imageUrl: e.target.value })
                          }
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="bg-green-600 hover:bg-green-700">
                        حفظ المنتج
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddProduct(false)}
                      >
                        إلغاء
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Products List */}
            <div className="space-y-4">
              {products.length === 0 ? (
                <Card>
                  <CardContent className="pt-12 text-center">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">لا توجد منتجات حالياً</p>
                  </CardContent>
                </Card>
              ) : (
                products.map((product) => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                          <div className="flex gap-4 text-sm">
                            <span className="text-gray-600">
                              السعر: <span className="font-semibold">{(product.price / 100).toFixed(2)} ج.م</span>
                            </span>
                            <span className={`font-semibold ${
                              product.stock > 0 ? "text-green-600" : "text-red-600"
                            }`}>
                              المخزون: {product.stock}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingProduct(product.id)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">إدارة الطلبات</h2>
            <div className="space-y-4">
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="pt-12 text-center">
                    <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">لا توجد طلبات حالياً</p>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="grid md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3">
                            الطلب #{order.id}
                          </h3>
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
                          <div className="bg-gray-50 rounded-lg p-4 mb-3">
                            <p className="text-sm text-gray-600 mb-1">الإجمالي</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {(order.totalPrice / 100).toFixed(2)} ج.م
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleUpdateOrderStatus(order.id, e.target.value)
                              }
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                              <option value="pending">قيد الانتظار</option>
                              <option value="confirmed">تم التأكيد</option>
                              <option value="shipped">تم الشحن</option>
                              <option value="delivered">تم التسليم</option>
                              <option value="cancelled">ملغى</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {order.status === "delivered" && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                        <span
                          className={`text-sm font-medium px-3 py-1 rounded-full ${
                            order.status === "delivered"
                              ? "bg-green-100 text-green-700"
                              : order.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {order.status === "pending"
                            ? "قيد الانتظار"
                            : order.status === "confirmed"
                            ? "تم التأكيد"
                            : order.status === "shipped"
                            ? "تم الشحن"
                            : order.status === "delivered"
                            ? "تم التسليم"
                            : "ملغى"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
