function OrderSuccessCard({ result }) {
  if (!result) return null;

  return (
    <section className="order-success-card" role="status">
      <h3>주문이 저장되었습니다</h3>
      <p>주문번호: #{result.order_id}</p>
      <p>서버 총액: {result.total_price.toLocaleString()}원</p>
      <p>실제 결제는 포함하지 않은 실습 주문입니다.</p>
    </section>
  );
}

export default OrderSuccessCard;
