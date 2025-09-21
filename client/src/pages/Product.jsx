import ReviewsComponent from "@/components/custom/ReviewsComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Colors } from "@/constants/colors";
import { starsGenerator } from "@/constants/helper";
import useRazorpay from "@/hooks/use-razorpay";
import { useToast } from "@/hooks/use-toast";
import { addToCart, setCart } from "@/redux/slices/cartSlice";
import axios from "axios";
import { Circle, Minus, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import useCart from "@/hooks/useCart";
import useCartActions from "@/hooks/useCartActions";
const productStock = 5;

const Product = () => {
  const { productName } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { verifyPayment, generatePayment } = useRazorpay();
  const { fetchCart } = useCart();
  const [productQuantity, setProductQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [purchaseProduct, setPurchaseProduct] = useState(false);
  const [address, setAddress] = useState({});
  const [product, setProduct] = useState({});
  const [selectedImage, setSelectedImage] = useState(0);
  const [productColor, setProductColor] = useState("");
  const [productSize, setProductSize] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");


  useEffect(() => {
    const fetchProductByName = async () => {
      try {
        const res = await axios.get(
          import.meta.env.VITE_API_URL +
          `/get-product-by-name/${productName?.split("-").join(" ")}`
        );
        const { data } = await res.data;
        setProduct(data);

        // ✅ Auto-select black if available, otherwise first color
        if (data?.colors?.length > 0) {
          if (data.colors.includes("black")) {
            setProductColor("black");
          } else {
            setProductColor(data.colors[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      }
    };
    fetchProductByName();
  }, [productName]);

  // ✅ Reset selected image when color changes
  useEffect(() => {
    setSelectedImage(0);
  }, [productColor]);

  const now = new Date();
  const { price, discount, discountedPrice, offerValidTill } = product || {};

  const isOfferActive =
    offerValidTill && new Date(offerValidTill) >= now && discount > 0;

  const displayPrice = isOfferActive ? discountedPrice : price;
  const checkAvailability = async () => {
    if (pincode.trim() === "") {
      setAvailabilityMessage("Please enter a valid pincode");
      return;
    }
    const res = await axios.get(
      import.meta.env.VITE_API_URL + `/get-pincode/${pincode}`
    );
    const data = await res.data;
    setAvailabilityMessage(data.message);
  };

  // const handleAddToCart = async () => {
  //   if (!isAuthenticated) {
  //     navigate("/login");
  //     return;
  //   }

  //   if (!productColor) {
  //     toast({ title: "Please select a color" });
  //     return;
  //   }

  //   try {
  //     const user = JSON.parse(localStorage.getItem("user"));
  //     if (!user) return;

  //     const res = await axios.post(`${import.meta.env.VITE_API_URL}/add`, {
  //       userId: user.id,
  //       productId: product._id,
  //       quantity: productQuantity,
  //       price: product.price,
  //       color: productColor,
  //       size: productSize,
  //     });

  //     if (res.data.success) {
  //       // Fetch the updated cart from backend
  //       await fetchCart(user.id);

  //       setProductQuantity(1);
  //       toast({ title: "Product added to cart" });
  //     } else {
  //       toast({ title: "Failed to add product to cart" });
  //     }
  //   } catch (error) {
  //     console.error("Add to cart error:", error);
  //     toast({ title: "Failed to add product to cart" });
  //   }
  // };


const { addToCart } = useCartActions();

const handleAddToCart = () => {
  if (!isAuthenticated) {
    navigate("/login");
    return;
  }

  if (!productColor) {
    toast({ title: "Please select a color" });
    return;
  }

  const user = JSON.parse(localStorage.getItem("user"));
  addToCart({
    userId: user.id,
    productId: product._id,
    quantity: productQuantity,
    price: product.price,
    color: productColor,
    size: productSize,
    toast,
    setQuantityCallback: setProductQuantity,
  });
};

  const handleBuyNow = async () => {
  console.log("handleBuyNow called");

  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    navigate("/login");
    return;
  }

  console.log("Address before validation:", address);

  // ✅ Required frontend keys
  const requiredFieldsMap = {
    "full name (frist and last name)": "Full Name",
    email: "Email",
    "mobile number": "Mobile Number",
    "Flat, house no., building, apartment": "Flat/House",
    "Area, street, village": "Area/Street",
    landmark: "Landmark",
    "Town/city": "City",
    state: "State",
    "pin code": "Pin Code",
    "country/Region": "Country",
  };

  // ✅ Frontend validation
  for (const key in requiredFieldsMap) {
    if (!address[key] || address[key].trim() === "") {
      console.log(`Validation failed: ${requiredFieldsMap[key]} is missing`);
      return toast({
        title: `Please enter ${requiredFieldsMap[key]}`,
        variant: "destructive",
      });
    }
  }

  console.log("Product quantity:", productQuantity, "Stock:", product.stock);
  if (productQuantity > product.stock) {
    console.log("Product out of stock");
    toast({ title: "Product out of stock" });
    return;
  }

  if (product.blacklisted) {
    console.log("Product is blacklisted");
    toast({ title: "Product isn't available for purchase" });
    return;
  }

  if (!productColor) {
    console.log("No color selected");
    toast({ title: "Please select a color" });
    return;
  }

  if (!paymentMethod) {
    console.log("No payment method selected");
    toast({ title: "Please select a payment method" });
    return;
  }

  const totalAmount = (product.discountedPrice || product.price) * productQuantity;
  console.log("Total amount:", totalAmount);

  // ✅ Map frontend address to backend keys
  const mappedAddress = {
    name: address["full name (frist and last name)"],
    phone: address["mobile number"],
    street: address["Flat, house no., building, apartment"] + ", " + address["Area, street, village"],
    city: address["Town/city"],
    state: address["state"],
    zip: address["pin code"],
    country: address["country/Region"],
    email: address["email"],
    landmark: address["landmark"] || "",
  };

  // ✅ Prepare products array
  const orderProducts = [
    {
      id: product._id,
      name: product.name,
      price: product.discountedPrice || product.price,
      quantity: productQuantity,
      color: productColor,
      size: productSize,
      image: product?.variants?.[0]?.images?.[selectedImage]?.url || "/fallback.png",
    },
  ];

  // ✅ Payment handling
  if (paymentMethod === "razorpay") {
    try {
      console.log("Processing Razorpay payment");
      const amountInPaise = totalAmount * 100;
      const order = await generatePayment(amountInPaise);
      console.log("Razorpay order generated:", order);

      await verifyPayment({ ...order, amount: order.amount || amountInPaise }, orderProducts, mappedAddress, navigate);
      console.log("Razorpay payment verified and order placed");
    } catch (error) {
      console.error("Razorpay payment failed:", error);
      toast({ title: "Payment failed. Please try again." });
      return;
    }
  } else if (paymentMethod === "cod") {
    try {
      console.log("Processing COD order");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/cod-order`,
        {
          amount: totalAmount,
          address: mappedAddress,
          products: orderProducts,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

        if (res.data.success) {
          toast({ title: "Order placed with Cash on Delivery!" });
          navigate("/orders");
        } else {
          toast({ title: res.data.message || "Failed to place COD order." });
        }
      } catch (err) {
      console.error("COD order failed:", err.response?.data || err);
      toast({ title: "Something went wrong. Please try again." });
      return;
    }
  }

    setPurchaseProduct(false);
    setPaymentMethod("");
  };

  return (
    <div>
      <main className="w-[100vw] lg:w-[72vw] flex flex-col sm:flex-row justify-start items-start gap-10 mx-auto my-10">
        {/* LEFT SIDE */}
        <div className="relative sm:w-[45%] w-full grid gap-3">
          {/* Main Image */}
          <img
            src={
              product?.variants?.find((v) => v.color === productColor)
                ?.images?.[selectedImage]?.url || "/fallback.png"
            }
            alt="Selected product"
            className="w-full lg:h-[35rem] rounded-xl object-center object-cover border dark:border-none"
          />

          {/* Scrollable Thumbnails */}
          <div className="flex overflow-x-auto gap-2 mt-2 scrollbar-hide">
            {product?.variants
              ?.find((v) => v.color === productColor)
              ?.images?.map((img, index) => (
                <img
                  key={index}
                  src={img?.url}
                  alt={`Thumbnail ${index + 1}`}
                  onClick={() => setSelectedImage(index)}
                  className={`rounded-xl min-w-[5rem] h-20 object-cover cursor-pointer border transition-all duration-200 ${
                    selectedImage === index
                      ? "border-2 border-orange-400"
                      : "border-gray-300"
                  }`}
                />
              ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="sm:w-[50%] lg:w-[35%] px-4 sm:px-0">
          <div className="pb-5">
            <h2 className="font-extrabold text-2xl">{product?.name}</h2>
            <p className="sm:m-2 text-sm my-2">{product?.description}</p>
            <div className="flex items-center">
              {starsGenerator(product.rating, "0", 15)}
              <span className="text-md ml-1">({product?.reviews?.length})</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            {isOfferActive && discount > 0 && price !== undefined && (
              <span className="text-xs text-gray-400 line-through">
                ₹{Number(price).toFixed(2)}
              </span>
            )}
            <span className="text-lg font-bold text-gray-900 dark:text-yellow-400">
              ₹{Number(displayPrice || 0).toFixed(2)}
            </span>
          </div>

          {/* Size Selection */}
          <div className="py-5 border-b">
            <h3 className="font-bold text-lg text-white">Choose Size</h3>
            <div className="flex items-center gap-3 my-3">
              {["S", "M", "L", "XL"].map((size) => (
                <button
                  key={size}
                  onClick={() => setProductSize(size)}
                  className={`px-4 py-2 border rounded-md text-sm font-medium transition-all ${
                    productSize === size
                      ? "border-orange-500 bg-orange-100 text-orange-700 shadow-md"
                      : "border-gray-300 bg-white text-black hover:border-black"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="py-5 border-b">
            <h3 className="font-bold text-lg">Choose Color</h3>
            <div className="flex items-center my-2">
              {product?.colors?.map((color, index) => (
                <Circle
                  key={index + color}
                  fill={color}
                  strokeOpacity={0.2}
                  strokeWidth={0.2}
                  size={40}
                  onClick={() => setProductColor(color)}
                  className={`cursor-pointer filter hover:brightness-50 ${
                    productColor === color ? "ring-2 ring-orange-400" : ""
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Quantity & Stock */}
          <div className="py-5">
            <div className="flex gap-3 items-center">
              <div className="flex items-center gap-5 bg-gray-100 rounded-full px-3 py-2 w-fit">
                <Minus
                  stroke={Colors.customGray}
                  cursor={"pointer"}
                  onClick={() =>
                    setProductQuantity((qty) => (qty > 1 ? qty - 1 : 1))
                  }
                />
                <span className="text-slate-950">{productQuantity}</span>
                <Plus
                  stroke={Colors.customGray}
                  cursor={"pointer"}
                  onClick={() =>
                    setProductQuantity((qty) =>
                      qty < productStock ? qty + 1 : qty
                    )
                  }
                />
              </div>

              {product?.stock - productQuantity > 0 && (
                <div className="grid text-sm font-semibold text-gray-600">
                  <span>
                    Only{" "}
                    <span className="text-customYellow">
                      {product.stock - productQuantity} items{" "}
                    </span>
                    left!
                  </span>
                  <span>Don't miss it</span>
                </div>
              )}
            </div>

            {/* Pincode */}
            <div className="grid gap-3 my-5">
              <div className="flex gap-3">
                <Input
                  placeholder="Enter Your Pincode Here"
                  onChange={(e) => setPincode(e.target.value)}
                />
                <Button onClick={checkAvailability}>Check Availability</Button>
              </div>
              <p className="text-sm px-2">{availabilityMessage}</p>
            </div>

            {/* Buy/Add to Cart */}
            <div className="flex gap-3">
              <Button onClick={() => setPurchaseProduct(true)}>Buy Now</Button>
              <Button variant="outline" onClick={handleAddToCart}>
                Add to Cart
              </Button>
            </div>

            {/* Address & Payment */}
            {purchaseProduct && (
              <div className="my-2 space-y-4">
                <div className="grid gap-2">
                  {[
                    "full name (frist and last name)",
                    "email",
                    "mobile number",
                    "Flat, house no., building, apartment",
                    "Area, street, village",
                    "landmark",
                    "Town/city",
                    "state",
                    "pin code",
                    "country/Region",
                  ].map((field) => (
                    <Input
                      key={field}
                      placeholder={
                        field.charAt(0).toUpperCase() + field.slice(1)
                      }
                      value={address[field] || ""}
                      onChange={(e) =>
                        setAddress({ ...address, [field]: e.target.value })
                      }
                    />
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant={
                      paymentMethod === "razorpay" ? "default" : "outline"
                    }
                    onClick={() => setPaymentMethod("razorpay")}
                  >
                    Pay with Online
                  </Button>
                  <Button
                    variant={paymentMethod === "cod" ? "default" : "outline"}
                    onClick={() => setPaymentMethod("cod")}
                  >
                    Cash on Delivery
                  </Button>
                </div>

                <Button onClick={handleBuyNow}>Confirm Order</Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* REVIEW SECTION */}
      <ReviewsComponent productId={product?._id} />
    </div>
  );
};

export default Product;
