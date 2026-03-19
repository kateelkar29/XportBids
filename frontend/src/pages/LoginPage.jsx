import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/auth/login', { email, password });
      const { access_token, user_id, role } = response.data;
      
      login(access_token, { id: user_id, email, role });
      toast.success('Login successful!');
      
      // Redirect based on role
      if (role === 'manufacturer') {
        navigate('/manufacturer');
      } else if (role === 'importer') {
        navigate('/importer');
      } else if (role === 'admin') {
        navigate('/admin');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 data-testid="login-title" className="text-4xl font-bold uppercase tracking-tight text-[#0F172A] mb-2">Sign In</h1>
            <p className="text-slate-600">Access your trade platform account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email" className="uppercase text-xs font-bold tracking-wider">Email Address</Label>
              <Input
                data-testid="email-input"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-none border-[#E2E8F0] mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="uppercase text-xs font-bold tracking-wider">Password</Label>
              <Input
                data-testid="password-input"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 rounded-none border-[#E2E8F0] mt-2"
                required
              />
            </div>

            <Button
              data-testid="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-[#0F172A] text-white hover:bg-[#0F172A]/90 h-12 rounded-none uppercase font-bold tracking-wider shadow-[4px_4px_0px_0px_rgba(15,23,42,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#F97316] font-bold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div
        className="hidden lg:block bg-cover bg-center relative"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.8) 100%), url('https://images.unsplash.com/photo-1772209415876-76ea6cbc2f0c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHw0fHxtb2Rlcm4lMjBmYWN0b3J5JTIwaW50ZXJpb3IlMjBpbmR1c3RyaWFsfGVufDB8fHx8MTc3MzMzMjg1NHww&ixlib=rb-4.1.0&q=85')`
        }}
      >
        <div className="absolute inset-0 flex items-end p-16">
          <div className="text-white">
            <p className="text-xs font-mono uppercase tracking-wider mb-2">SECURE ACCESS</p>
            <p className="text-3xl font-bold">Welcome back to the platform</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;