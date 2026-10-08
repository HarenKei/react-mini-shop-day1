import { useEffect, useState } from "react";
import "./App.css";
import ProductCard from "./components/ProductCard";

function App() {
  const shopName = "오늘의 상점";
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productError, setProductError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [cartItems, setCartItems] = useState([]);
  const [orderForm, setOrderForm] = useState({
    name: "",
    email: "",
    emailConfirm: "",
  });
  const [wasSubmitted, setWasSubmitted] = useState(false);

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
      const existingItem = currentItems.find(
        (item) => item.productId === productId,
      );

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

  function removeFromCart(productId) {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.productId !== productId),
    );
  }

  function handleOrderChange(event) {
    const { name, value } = event.target;
    setOrderForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function handleOrderSubmit(event) {
    event.preventDefault();
    setWasSubmitted(true);
  }

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return total + (product?.price ?? 0) * item.quantity;
  }, 0);

  const orderErrors = {
    name: orderForm.name.trim() ? "" : "이름을 입력해 주세요.",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderForm.email.trim())
      ? ""
      : "올바른 이메일을 입력해 주세요.",
    emailConfirm:
      orderForm.emailConfirm.trim() === orderForm.email.trim()
        ? ""
        : "이메일이 일치하지 않습니다.",
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

      <section className="featured-section">
        <h2>오늘의 추천 상품</h2>
        {featuredProduct ? (
          <article className="featured-product">
            <div role="img" aria-label={`${featuredProduct.name} 상품 이미지`}>
              {featuredProduct.emoji}
            </div>
            <h3>{featuredProduct.name}</h3>
            <p>{featuredProduct.price.toLocaleString()}원</p>
            <button type="button">상품 보러 가기</button>
          </article>
        ) : (
          <p className="empty-state">
            {isLoading
              ? "추천 상품을 불러오는 중입니다."
              : "추천 상품이 없습니다."}
          </p>
        )}
      </section>

      <section aria-labelledby="all-products-title">
        <h2 id="all-products-title">전체 상품</h2>
        <div className="filter-panel">
          <div className="filter-field">
            <label htmlFor="product-search">상품 검색</label>
            <input
              id="product-search"
              type="search"
              placeholder="상품 이름을 입력하세요"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="filter-field">
            <label htmlFor="category-select">카테고리</label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <button className="reset-button" type="button" onClick={resetFilters}>
            초기화
          </button>
        </div>

        {isLoading ? (
          <p className="api-status" role="status">
            상품을 불러오는 중입니다.
          </p>
        ) : productError ? (
          <p className="api-status api-error" role="alert">
            상품을 불러오지 못했습니다: {productError}
          </p>
        ) : (
          <>
            <p className="result-count">
              검색 결과: {filteredProducts.length}개
            </p>
            {filteredProducts.length > 0 ? (
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
            ) : (
              <p className="empty-state">
                {products.length === 0
                  ? "등록된 상품이 없습니다."
                  : "조건에 맞는 상품이 없습니다."}
              </p>
            )}
          </>
        )}
      </section>
      <section className="cart-section" aria-labelledby="cart-title">
        <h2 id="cart-title">장바구니 ({cartCount}개)</h2>
        <button type="button" onClick={() => setCartItems([])}>
          장바구니 비우기
        </button>

        {cartItems.length === 0 ? (
          <p className="empty-state">아직 담은 상품이 없습니다.</p>
        ) : (
          <>
            <ul className="cart-list">
              {cartItems.map((item) => {
                const product = products.find(
                  (entry) => entry.id === item.productId,
                );
                if (!product) return null;
                return (
                  <li className="cart-item" key={item.productId}>
                    <div>
                      <strong>{product.name}</strong>
                      <p>
                        {product.price.toLocaleString()}원 × {item.quantity}
                      </p>
                    </div>
                    <div className="quantity-controls">
                      <button type="button" onClick={() => removeFromCart(product.id)}>
                        삭제
                      </button>

                      <button
                        type="button"
                        aria-label={`${product.name} 수량 줄이기`}
                        onClick={() => decreaseQuantity(product.id)}
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        aria-label={`${product.name} 수량 늘리기`}
                        onClick={() => addToCart(product.id)}
                      >
                        +
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="cart-total">합계: {cartTotal.toLocaleString()}원</p>
          </>
        )}
      </section>
      <section className="order-section" aria-labelledby="order-title">
        <h2 id="order-title">주문서 미리 보기</h2>
        <div className="order-layout">
          <form className="order-form" noValidate onSubmit={handleOrderSubmit}>
            <h3>주문자 정보</h3>
            <label htmlFor="order-name">이름</label>
            <input
              id="order-name"
              name="name"
              value={orderForm.name}
              onChange={handleOrderChange}
              aria-invalid={wasSubmitted && Boolean(orderErrors.name)}
            />
            {wasSubmitted && orderErrors.name && (
              <p className="form-error" role="alert">
                {orderErrors.name}
              </p>
            )}

            <label htmlFor="order-email">이메일</label>
            <input
              id="order-email"
              name="email"
              type="email"
              value={orderForm.email}
              onChange={handleOrderChange}
              aria-invalid={wasSubmitted && Boolean(orderErrors.email)}
            />
            {wasSubmitted && orderErrors.email && (
              <p className="form-error" role="alert">
                {orderErrors.email}
              </p>
            )}

            <label htmlFor="order-email-confirm">이메일 확인</label>
            <input
              id="order-email-confirm"
              name="emailConfirm"
              type="email"
              value={orderForm.emailConfirm}
              onChange={handleOrderChange}
              aria-invalid={wasSubmitted && Boolean(orderErrors.emailConfirm)}
            />
            {wasSubmitted && orderErrors.emailConfirm && (
              <p className="form-error" role="alert">{orderErrors.emailConfirm}</p>
            )}


            {wasSubmitted && orderErrors.cart && (
              <p className="form-error" role="alert">
                {orderErrors.cart}
              </p>
            )}
            <button type="submit">입력 확인</button>
            {wasSubmitted && isOrderValid && (
              <p className="form-success" role="status">
                입력 확인 완료! 실제 주문 저장은 9차시에 연결합니다.
              </p>
            )}
          </form>

          <div className="order-summary">
            <h3>주문 요약</h3>
            {cartItems.length === 0 ? (
              <p>담은 상품이 없습니다.</p>
            ) : (
              <ul>
                {cartItems.map((item) => {
                  const product = products.find(
                    (entry) => entry.id === item.productId,
                  );
                  if (!product) return null;
                  return (
                    <li key={item.productId}>
                      <span>
                        {product.name} × {item.quantity}
                      </span>
                      <span>
                        {(product.price * item.quantity).toLocaleString()}원
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="order-total">
              상품 {cartCount}개 · 합계 {cartTotal.toLocaleString()}원
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
