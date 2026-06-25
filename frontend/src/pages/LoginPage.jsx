import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import PageHeader from "../components/PageHeader";
import PrimaryButton from "../components/PrimaryButton";
import ErrorMessage from "../components/ErrorMessage";
import LoadingState from "../components/LoadingState";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { auth as authText, pages, ui } from "../content/he";
import logoImage from "../assets/brand/talal-awidat-logo.png";

function getSafeRedirectPath(fromParam) {
  if (fromParam && fromParam.startsWith("/") && !fromParam.startsWith("//")) {
    return fromParam;
  }
  return "/";
}

export default function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(getSafeRedirectPath(searchParams.get("from")), { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, searchParams]);

  if (isLoading) {
    return (
      <div className="login-page">
        <div className="login-page__card">
          <LoadingState message={ui.loading} />
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={getSafeRedirectPath(searchParams.get("from"))} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate(getSafeRedirectPath(searchParams.get("from")), { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setErrorMessage(authText.invalidLogin);
      } else {
        setErrorMessage(authText.unexpectedError);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__card">
        <div className="login-page__brand">
          <img
            src={logoImage}
            alt="לוגו המשרד — Talal Awidat C.P.A"
            className="login-page__brand-logo"
            width={88}
            height={88}
          />
        </div>
        <PageHeader title={pages.login.title} description={pages.login.description} />
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-field__label" htmlFor="login-email">
              {authText.emailLabel}
            </label>
            <input
              id="login-email"
              className="form-field__input"
              type="email"
              name="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label className="form-field__label" htmlFor="login-password">
              {authText.passwordLabel}
            </label>
            <input
              id="login-password"
              className="form-field__input"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
          <PrimaryButton type="submit" className="login-form__submit" disabled={isSubmitting}>
            {isSubmitting ? ui.loading : authText.loginButton}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
}
