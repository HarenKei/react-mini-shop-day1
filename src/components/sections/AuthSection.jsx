function AuthSection({
  accessToken, currentUser, loginForm,
  loginError, isLoggingIn, handleLoginChange,
  handleLoginSubmit, handleLogout,
}) {
  return (
    <section className="auth-section" aria-labelledby="auth-title">
      <h2 id="auth-title">고객 로그인</h2>
      {accessToken && currentUser ? (
        <div className="auth-signed-in">
          <p>
            <strong>{currentUser.name}</strong>님, 환영합니다.
          </p>
          <button type="button" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      ) : (
        <form className="auth-form" noValidate onSubmit={handleLoginSubmit}>
          <div>
            <label htmlFor="login-userid">아이디</label>
            <input
              id="login-userid"
              name="userid"
              autoComplete="username"
              value={loginForm.userid}
              onChange={handleLoginChange}
            />
          </div>
          <div>
            <label htmlFor="login-password">비밀번호</label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={loginForm.password}
              onChange={handleLoginChange}
            />
          </div>
          <button type="submit" disabled={isLoggingIn}>
            {isLoggingIn ? "확인 중..." : "로그인"}
          </button>
          {loginError && (
            <p className="form-error" role="alert">
              {loginError}
            </p>
          )}
        </form>
      )}
    </section>
  );
}

export default AuthSection;
