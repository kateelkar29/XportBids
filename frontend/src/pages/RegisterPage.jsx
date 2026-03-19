import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!role) {
      toast.error('Please select your role');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/auth/register', { email, password, role });
      const { access_token, user_id } = response.data;
      
      login(access_token, { id: user_id, email, role });
      toast.success('Registration successful!');
      
      // Redirect based on role
      if (role === 'manufacturer') {
        navigate('/manufacturer');
      } else if (role === 'importer') {
        navigate('/importer');
      } else if (role === 'admin') {
        navigate('/admin');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
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
            <h1 data-testid="register-title" className="text-4xl font-bold uppercase tracking-tight text-[#0F172A] mb-2">Create Account</h1>
            <p className="text-slate-600">Join the global trade platform</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <Label htmlFor="role" className="uppercase text-xs font-bold tracking-wider">I am a</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger data-testid="role-select" className="h-10 rounded-none border-[#E2E8F0] mt-2">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="manufacturer" data-testid="role-manufacturer">Manufacturer</SelectItem>
                  <SelectItem value="importer" data-testid="role-importer">Importer</SelectItem>
                  <SelectItem value="admin" data-testid="role-admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="email" className="uppercase text-xs font-bold tracking-wider">Email Address</Label>
              <Input
                data-testid="register-email-input"
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
                data-testid="register-password-input"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 rounded-none border-[#E2E8F0] mt-2"
                required
              />
            </div>

            <Button
              data-testid="register-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-[#0F172A] text-white hover:bg-[#0F172A]/90 h-12 rounded-none uppercase font-bold tracking-wider shadow-[4px_4px_0px_0px_rgba(15,23,42,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-[#F97316] font-bold hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div
        className="hidden lg:block bg-cover bg-center relative"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.8) 100%), url('https://images.unsplash.com/photo-1583737077549-d078beef3046?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHw0fHxsYXJnZSUyMHdhcmVob3VzZSUyMHNoZWx2aW5nJTIwbG9naXN0aWNzfGVufDB8fHx8MTc3MzMzMjg2N3ww&ixlib=rb-4.1.0&q=85')`
        }}
      >
        <div className="absolute inset-0 flex items-end p-16">
          <div className="text-white">
            <p className="text-xs font-mono uppercase tracking-wider mb-2">JOIN NOW</p>
            <p className="text-3xl font-bold">Start trading globally today</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;