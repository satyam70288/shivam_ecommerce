import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import { ThemeProvider } from "./components/provider/theme-provider";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Product from "./pages/Product";
import Checkout from "./pages/Checkout";
import AdminLogin from "./pages/AdminLogin";
import Error from "./pages/Error";
import RootLayout from "./layouts/RootLayout";
import AdminLayout from "./layouts/AdminLayout";
import CreateProducts from "./components/custom/CreateProducts";
import AllProducts from "./components/custom/AllProducts";
import Analytics from "./components/custom/Analytics";
import Orders from "./components/custom/Orders";
import Settings from "./components/custom/Settings";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import MyOrders from "./pages/MyOrders";
import { Toaster } from "./components/ui/toaster";
import ProtectedRoute from "./components/custom/ProtectedRoute";
import Contact from "./components/custom/Contact";
import FaqPage from "./components/FaqPage";
import AboutPage from "./components/AboutPage";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import TermsAndConditions from "./components/TermsAndConditions";
import AccountLayout from "./layouts/AccountLayout";
import MyProfile from "./components/custom/MyProfile";
import CategoryPage from "./pages/CategoryPage";
import AdminProductDetails from "./components/Admin/AdminProductDetails";
import WishlistPage from "./pages/Wishlist";
import OrderDetails from "./components/order/OrderDetails";
import BannerManager from "./components/Admin/banner/BannerManager";
import AllReviewsPage from "./components/Review/AllReviewsPage";

export default function App() {
  const router = createBrowserRouter([
    {
      element: <RootLayout />,
      children: [
        { index: true, element: <Home /> },
        { path: "signup", element: <Signup /> },
        { path: "login", element: <Login /> },
        { path: "category/:slug", element: <CategoryPage /> },
        { path: "product/:id", element: <Product /> },
        { path: "contact", element: <Contact /> },
        { path: "faq", element: <FaqPage /> },
        { path: "about", element: <AboutPage /> },
        { path: "Termsandconditions", element: <TermsAndConditions /> },

        {
          element: <ProtectedRoute />,
          children: [
            { path: "product/:productId/reviews", element: <AllReviewsPage /> },
            { path: "checkout", element: <Checkout /> },
            { path: "orders", element: <MyOrders /> },
            { path: "orders/:orderId", element: <OrderDetails /> },
            { path: "account/wishlist", element: <WishlistPage /> },
            {
              path: "account",
              element: <AccountLayout />,
              children: [{ index: true, element: <MyProfile /> }],
            },
          ],
        },
      ],
    },
    { path: "forgot-password", element: <ForgotPassword /> },
    { path: "reset-password/:token", element: <ResetPassword /> },
    {
      path: "/admin/login",
      element: <AdminLogin />,
    },
    {
      path: "/admin",
      element: (
        <ProtectedRoute isAdmin>
          <AdminLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Analytics /> },
        { path: "banner", element: <BannerManager /> },
        { path: "products", element: <AllProducts /> },
        { path: "products/create", element: <CreateProducts /> },
        { path: "orders", element: <Orders /> },
        { path: "analytics", element: <Analytics /> },
        { path: "settings", element: <Settings /> },
        { path: "products/:id", element: <AdminProductDetails /> },
      ],
    },
    { path: "*", element: <Error /> },
  ]);

  return (
    <ThemeProvider>
      <Provider store={store}>
        <Toaster />
        <RouterProvider
          router={router}
          fallbackElement={<div>Loading...</div>}
        />
      </Provider>
    </ThemeProvider>
  );
}
