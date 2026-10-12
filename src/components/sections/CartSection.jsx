function CartSection({
  products, cartItems, cartCount,
  cartTotal, addToCart, decreaseQuantity,
  removeFromCart, clearCart,
}) {
  return (
    <section className="cart-section" aria-labelledby="cart-title">
      <h2 id="cart-title">장바구니 ({cartCount}개)</h2>
      <button type="button" onClick={clearCart}>
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
                    <button
                      type="button"
                      onClick={() => removeFromCart(product.id)}
                    >
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
  );
}

export default CartSection;
