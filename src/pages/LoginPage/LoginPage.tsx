/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuthContext } from "../../hooks/useAuthContext";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, Tabs, Typography, Form } from "antd";
import { authApi } from "../../api";
import styles from "./LoginPage.module.scss";
import classNames from "classnames/bind";
import { ErrorMessages } from "../../constants/messages";

const cx = classNames.bind(styles);
const { Title, Text, Link } = Typography;

const LoginPage: React.FC = () => {
  const { setUser, setAccessToken } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError("");
    try {
      // Gọi API login chuẩn qua api/auth
      const res = await authApi.login(values);
      setUser(res.user);
      setAccessToken(res.accessToken);
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      localStorage.setItem("user", JSON.stringify(res.user));
      // TODO: chuyển hướng sang trang chính
      if (res && res.user) {
        navigate("/");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || ErrorMessages.LOGIN_FAILED);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cx("loginBg")}>
      <div className={cx("loginFormContainer")}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 24 }}>
          Login Form
        </Title>
        <Tabs
          defaultActiveKey="login"
          centered
          className={cx("tabsNav")}
          items={[
            { key: "login", label: "Login" },
            { key: "signup", label: "Signup", disabled: true },
          ]}
        />
        <Form layout="vertical" onFinish={onFinish} style={{ marginTop: 16 }}>
          <Form.Item name="email" rules={[{ required: true, message: "Please enter your email" }]}>
            <Input
              placeholder="Email Address"
              size="large"
              autoComplete="email"
              style={{ padding: "6px 12px" }}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password placeholder="Password" size="large" autoComplete="current-password" />
          </Form.Item>
          <div style={{ marginBottom: 16, textAlign: "right" }}>
            <Link href="#" style={{ color: "#e75480" }}>
              Forgot password?
            </Link>
          </div>
          {error && (
            <Text className={cx("typographyDanger")} type="danger">
              {error}
            </Text>
          )}
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
            className={cx("btnPrimary")}
            style={{
              background: "linear-gradient(90deg, #e75480 0%, #a4508b 100%)",
              border: "none",
              marginTop: 8,
            }}
          >
            Login
          </Button>
        </Form>
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Text>
            Not a member?{" "}
            <Link href="#" style={{ color: "#e75480" }}>
              Signup now
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
