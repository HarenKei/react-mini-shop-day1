function OrderSection({
  products, cartItems, cartCount,
  cartTotal, useMemberInfo, setUseMemberInfo,
  orderName, orderEmail, orderErrors,
  wasSubmitted, isSubmittingOrder, orderError,
  orderResult, handleOrderChange, handleOrderSubmit,
}) {
  return (
    <section className="order-section" aria-labelledby="order-title">
      <h2 id="order-title">주문서</h2>
      <div className="order-layout">
        <form
          className="order-form"
          noValidate
          onSubmit={handleOrderSubmit}
        >
          <h3>주문자 정보</h3>
          <label className="member-info-option" htmlFor="use-member-info">
            <input
              id="use-member-info"
              type="checkbox"
              checked={useMemberInfo}
              onChange={(event) => setUseMemberInfo(event.target.checked)}
            />
            회원 정보 불러오기
          </label>
          <p className="member-info-help">
            체크하면 회원 이름과 이메일을 사용합니다. 해제하면 직접 입력하던
            값으로 돌아갑니다.
          </p>
          <label htmlFor="order-name">이름</label>
          <input
            id="order-name"
            name="name"
            value={orderName}
            readOnly={useMemberInfo}
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
            value={orderEmail}
            readOnly={useMemberInfo}
            onChange={handleOrderChange}
            aria-invalid={wasSubmitted && Boolean(orderErrors.email)}
          />
          {wasSubmitted && orderErrors.email && (
            <p className="form-error" role="alert">
              {orderErrors.email}
            </p>
          )}

          {wasSubmitted && orderErrors.cart && (
            <p className="form-error" role="alert">
              {orderErrors.cart}
            </p>
          )}
          <button type="submit" disabled={isSubmittingOrder}>
            {isSubmittingOrder ? "주문 저장 중..." : "주문하기"}
          </button>
          {orderError && (
            <p className="form-error" role="alert">
              {orderError}
            </p>
          )}
          {orderResult && (
            <p className="form-success" role="status">
              주문 #{orderResult.order_id} 저장 완료 · 총액{" "}
              {orderResult.total_price.toLocaleString()}원
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
  );
}

export default OrderSection;
