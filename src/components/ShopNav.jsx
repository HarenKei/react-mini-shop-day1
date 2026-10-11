import { NavLink } from "react-router";

function ShopNav({ cartCount, currentUser }) {
  return (
    <nav className="shop-nav" aria-label="상점 메뉴">
      <NavLink to="/" end>
        {({ isActive }) => `${isActive ? "✓ " : ""}상품`}
      </NavLink>
      <NavLink to="/cart">
        {({ isActive }) => `${isActive ? "✓ " : ""}장바구니 (${cartCount})`}
      </NavLink>
      <NavLink to="/login">
        {({ isActive }) =>
          `${isActive ? "✓ " : ""}${currentUser ? `${currentUser.name}님` : "로그인"}`
        }
      </NavLink>
    </nav>
  );
}

export default ShopNav;
