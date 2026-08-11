import { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import ErrorMessage from '../../../components/common/ErrorMessage';

// UI layer — collects input, calls handleLogin from parent. Never touches axios.
const LoginForm = ({ onSubmit, isLoading, error }) => {
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form id="login-form" onSubmit={handleSubmit} className="space-y-5">
      <ErrorMessage message={error} />

      <Input
        id="email"
        type="email"
        label="Email address"
        placeholder="you@example.com"
        value={form.email}
        onChange={handleChange}
        required
      />

      <Input
        id="password"
        type="password"
        label="Password"
        placeholder="••••••••"
        value={form.password}
        onChange={handleChange}
        required
      />

      <Button
        id="login-submit"
        type="submit"
        isLoading={isLoading}
        className="w-full"
      >
        Sign in
      </Button>
    </form>
  );
};

export default LoginForm;
