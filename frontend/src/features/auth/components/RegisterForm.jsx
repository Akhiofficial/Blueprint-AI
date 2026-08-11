import { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import ErrorMessage from '../../../components/common/ErrorMessage';

// UI layer — collects input, calls handleRegister from parent. Never touches axios.
const RegisterForm = ({ onSubmit, isLoading, error }) => {
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    setLocalError('');
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    const { confirmPassword, ...payload } = form;
    onSubmit(payload);
  };

  return (
    <form id="register-form" onSubmit={handleSubmit} className="space-y-4">
      <ErrorMessage message={error || localError} />

      <Input
        id="name"
        label="Full name"
        placeholder="Jane Doe"
        value={form.name}
        onChange={handleChange}
        required
      />

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
        placeholder="Min. 8 characters"
        hint="At least 8 characters"
        value={form.password}
        onChange={handleChange}
        required
      />

      <Input
        id="confirmPassword"
        type="password"
        label="Confirm password"
        placeholder="Re-enter your password"
        value={form.confirmPassword}
        onChange={handleChange}
        required
        error={localError && form.confirmPassword ? localError : ''}
      />

      <Button
        id="register-submit"
        type="submit"
        isLoading={isLoading}
        className="w-full"
      >
        Create account
      </Button>
    </form>
  );
};

export default RegisterForm;
