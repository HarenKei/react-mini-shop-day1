import ProductCard from "../ProductCard";

function ProductListSection({
  products, filteredProducts, categories,
  searchTerm, selectedCategory, isLoading,
  productError, setSearchTerm, setSelectedCategory,
  resetFilters, addToCart,
}) {
  return (
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
  );
}

export default ProductListSection;
