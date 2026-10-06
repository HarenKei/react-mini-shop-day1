import { useState } from "react";
import "./App.css";
import ProductCard from "./components/ProductCard";

const products = [
  { id: 1, name: "캔버스 토트백", category: "가방", price: 18000, emoji: "👜" },
  { id: 2, name: "데일리 머그컵", category: "주방", price: 12000, emoji: "☕" },
  { id: 3, name: "포켓 노트", category: "문구", price: 4500, emoji: "📒" },
];

const categories = ["전체", "가방", "주방", "문구"];

function App() {
  const shopName = "오늘의 상점";
  const productName = "캔버스 토트백";
  const price = 18000;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");

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

  return (
    <main className="shop">
      <header className="shop-header">
        <p>작은 발견이 있는 쇼핑</p>
        <h1>{shopName}</h1>
        <span>취향에 맞는 물건을 찾아보세요.</span>
      </header>

      <section className="featured-section">
        <h2>오늘의 추천 상품</h2>
        <article className="featured-product">
          <div role="img" aria-label="토트백 상품 이미지">👜</div>
          <h3>{productName}</h3>
          <p>{price.toLocaleString()}원</p>
          <button type="button">상품 보러 가기</button>
        </article>
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

        <p className="result-count">검색 결과: {filteredProducts.length}개</p>
        {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="empty-state">조건에 맞는 상품이 없습니다.</p>
        )}
      </section>
    </main>
  );
}

export default App;
