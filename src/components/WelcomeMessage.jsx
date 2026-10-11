function WelcomeMessage({ user }) {
  return (
    <p className={user ? "welcome-message signed-in" : "welcome-message"}>
      {user
        ? `${user.name}님, 오늘의 상점에 다시 오셨네요!`
        : "로그인하고 나만의 주문을 시작해 보세요."}
    </p>
  );
}

export default WelcomeMessage;
