import { useEffect, useState } from "react";
import "./App.css";
import { Routes, Route, Link, useNavigate } from "react-router";
import ShopNav from "./components/ShopNav";
import AuthSection from "./components/sections/AuthSection";
import FeaturedSection from "./components/sections/FeaturedSection";
import ProductListSection from "./components/sections/ProductListSection";
import CartSection from "./components/sections/CartSection";
import OrderSection from "./components/sections/OrderSection";

function App() {
  const shopName = "오늘의 상점";
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productError, setProductError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [cartItems, setCartItems] = useState([]);
  const [orderForm, setOrderForm] = useState({
    name: "",
    email: "",
  });
  const [useMemberInfo, setUseMemberInfo] = useState(false);
  const [wasSubmitted, setWasSubmitted] = useState(false);

  const [loginForm, setLoginForm] = useState({ userid: "", password: "" });
  const [accessToken, setAccessToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderResult, setOrderResult] = useState(null);

  const featuredProduct = products[0];
  const categories = [
    "전체",
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ];

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch("http://127.0.0.1:8000/products", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`상품 조회 실패 (${response.status})`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("상품 응답 형식이 올바르지 않습니다.");
        }

        setProducts(data);
        setCartItems([]);
        setProductError("");
      } catch (error) {
        if (error.name !== "AbortError") {
          setProductError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => controller.abort();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase());
    const matchesCategory =
      selectedCategory === "전체" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  function resetFilters() {
    setSearchTerm("");
    setSelectedCategory("전체");
  }

  function addToCart(productId) {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.productId === productId);

      if (existingItem) {
        return currentItems.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...currentItems, { productId, quantity: 1 }];
    });
  }

  function decreaseQuantity(productId) {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  function removeFromCart(productId) {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.productId !== productId),
    );
  }

  function handleOrderChange(event) {
    const { name, value } = event.target;
    setOrderForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  async function handleOrderSubmit(event) {
    event.preventDefault();
    setWasSubmitted(true);
    setOrderError("");
    setOrderResult(null);

    if (!isOrderValid) return;
    if (!accessToken) {
      setOrderError("주문하려면 먼저 로그인해 주세요.");
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: orderName.trim(),
          email: orderEmail.trim(),
          items: cartItems.map((item) => ({
            product_id: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        setAccessToken(null);
        setCurrentUser(null);
        setUseMemberInfo(false);
        setOrderForm({ name: "", email: "" });
        setOrderResult(null);
        setWasSubmitted(false);
        throw new Error("로그인이 만료되었습니다. 다시 로그인해 주세요.");
      }
      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : `주문을 저장하지 못했습니다 (${response.status}).`,
        );
      }

      setOrderResult(data);
      setCartItems([]);
      setWasSubmitted(false);
    } catch (error) {
      setOrderError(error.message || "서버 연결을 확인해 주세요.");
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  function handleLoginChange(event) {
    const { name, value } = event.target;
    setLoginForm((current) => ({ ...current, [name]: value }));
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setLoginError("");

    if (!loginForm.userid.trim() || !loginForm.password) {
      setLoginError("아이디와 비밀번호를 입력해 주세요.");
      return;
    }

    setIsLoggingIn(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "아이디 또는 비밀번호가 올바르지 않습니다."
            : `로그인 요청 실패 (${response.status})`,
        );
      }

      const { access_token: token } = await response.json();
      const meResponse = await fetch("http://127.0.0.1:8000/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!meResponse.ok) {
        throw new Error("로그인 상태를 확인하지 못했습니다.");
      }

      const user = await meResponse.json();
      setAccessToken(token);
      setCurrentUser(user);
      navigate("/cart");
      setLoginForm((current) => ({ ...current, password: "" }));
    } catch (error) {
      setAccessToken(null);
      setCurrentUser(null);
      setUseMemberInfo(false);
      setOrderForm({ name: "", email: "" });
      setOrderResult(null);
      setWasSubmitted(false);
      setLoginError(error.message);
      setLoginForm((current) => ({ ...current, password: "" }));
    } finally {
      setIsLoggingIn(false);
    }
  }

  function handleLogout() {
    setAccessToken(null);
    setCurrentUser(null);
    setUseMemberInfo(false);
    setOrderForm({ name: "", email: "" });
    setOrderResult(null);
    setWasSubmitted(false);
    setLoginError("");
    navigate("/login");
  }

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return total + (product?.price ?? 0) * item.quantity;
  }, 0);

  const orderName = useMemberInfo && currentUser ? currentUser.name : orderForm.name;
  const orderEmail = useMemberInfo && currentUser ? currentUser.email : orderForm.email;

  const orderErrors = {
    name: orderName.trim() ? "" : "이름을 입력해 주세요.",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderEmail.trim())
      ? ""
      : "올바른 이메일을 입력해 주세요.",
    cart: cartCount > 0 ? "" : "장바구니에 상품을 담아 주세요.",
  };
  const isOrderValid = Object.values(orderErrors).every((message) => !message);

  return (
    <main className="shop">
      <header className="shop-header">
        <p>작은 발견이 있는 쇼핑</p>
        <h1>{shopName}</h1>
        <span>취향에 맞는 물건을 찾아보세요.</span>
      </header>
      <ShopNav cartCount={cartCount} currentUser={currentUser} />
      <Routes>
        <Route
          path="/login"
          element={
            <AuthSection
              accessToken={accessToken}
              currentUser={currentUser}
              loginForm={loginForm}
              loginError={loginError}
              isLoggingIn={isLoggingIn}
              handleLoginChange={handleLoginChange}
              handleLoginSubmit={handleLoginSubmit}
              handleLogout={handleLogout}
            />
          }
        />
        <Route
          path="/"
          element={
            <>
              <FeaturedSection
                featuredProduct={featuredProduct}
                isLoading={isLoading}
              />

              <ProductListSection
                products={products}
                filteredProducts={filteredProducts}
                categories={categories}
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                isLoading={isLoading}
                productError={productError}
                setSearchTerm={setSearchTerm}
                setSelectedCategory={setSelectedCategory}
                resetFilters={resetFilters}
                addToCart={addToCart}
              />
            </>
          }
        />
        <Route
          path="/cart"
          element={
            <>
              <CartSection
                products={products}
                cartItems={cartItems}
                cartCount={cartCount}
                cartTotal={cartTotal}
                addToCart={addToCart}
                decreaseQuantity={decreaseQuantity}
                removeFromCart={removeFromCart}
                clearCart={clearCart}
              />
              {accessToken && currentUser ? (
                <OrderSection
                  products={products}
                  cartItems={cartItems}
                  cartCount={cartCount}
                  cartTotal={cartTotal}
                  useMemberInfo={useMemberInfo}
                  setUseMemberInfo={setUseMemberInfo}
                  orderName={orderName}
                  orderEmail={orderEmail}
                  orderErrors={orderErrors}
                  wasSubmitted={wasSubmitted}
                  isSubmittingOrder={isSubmittingOrder}
                  orderError={orderError}
                  orderResult={orderResult}
                  handleOrderChange={handleOrderChange}
                  handleOrderSubmit={handleOrderSubmit}
                />
              ) : (
                <p className="empty-state">
                  주문하려면 <Link to="/login">로그인</Link>해 주세요.
                </p>
              )}
            </>
          }
        />
        <Route
          path="*"
          element={
            <p className="empty-state">
              없는 화면입니다. <Link to="/">상품 보기</Link>
            </p>
          }
        />
      </Routes>
    </main>
  );
}

export default App;
