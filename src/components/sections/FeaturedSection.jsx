function FeaturedSection({
  featuredProduct, isLoading,
}) {
  return (
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
  );
}

export default FeaturedSection;
