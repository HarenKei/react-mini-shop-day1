function ProductCard({ product, onAddToCart }) {
  return (
    <article className="product-card">
      <div className="product-emoji" role="img" aria-label={product.name}>
        {product.emoji}
      </div>
      <p className="product-category">{product.category}</p>
      <h3>{product.name}</h3>
      <p className="product-price">{product.price.toLocaleString()}원</p>
      <button type="button" onClick={() => onAddToCart(product.id)}>
        장바구니에 담기
      </button>
    </article>
  );
}

export default ProductCard;
