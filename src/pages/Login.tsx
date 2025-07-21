import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { LayoutDashboard, Lock, User, Eye, EyeOff, UserPlus } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Campos adicionais para cadastro
  const [signUpData, setSignUpData] = useState({
    nome: '',
    nome_usuario: '',
    empresa_id: 1, // Default para primeira empresa
    funcao: 'usuario' as 'usuario' | 'administrador' | 'supervisor' | 'estagiario'
  });

  const { signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await signIn(email, password);
      
      if (success) {
        navigate('/');
      }
    } catch (error) {
      console.error('Erro no login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !signUpData.nome || !signUpData.nome_usuario) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await signUp({
        email,
        password,
        ...signUpData
      });
      
      if (success) {
        toast.success('Conta criada com sucesso! Faça login para continuar.');
        setIsSignUp(false);
        // Limpar formulário
        setEmail('');
        setPassword('');
        setSignUpData({
          nome: '',
          nome_usuario: '',
          empresa_id: 1,
          funcao: 'usuario'
        });
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSignUpData(prev => ({
      ...prev,
      [name]: name === 'empresa_id' ? parseInt(value) : value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full px-8 py-10 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white mb-6 shadow-lg">
            <LayoutDashboard size={36} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            VieiraStock
          </h1>
          <p className="text-gray-600 mt-2 font-medium">Sistema de Estoque TI</p>
        </div>
        
        <div className="mb-6">
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                !isSignUp 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                isSignUp 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cadastrar
            </button>
          </div>
        </div>
        
        <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
          <div className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    value={signUpData.nome}
                    onChange={handleSignUpDataChange}
                    required
                    className="block w-full rounded-lg border border-gray-300 bg-white py-3 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    placeholder="Digite seu nome completo"
                  />
                </div>

                <div>
                  <label htmlFor="nome_usuario" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome de Usuário *
                  </label>
                  <input
                    id="nome_usuario"
                    name="nome_usuario"
                    type="text"
                    value={signUpData.nome_usuario}
                    onChange={handleSignUpDataChange}
                    required
                    className="block w-full rounded-lg border border-gray-300 bg-white py-3 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    placeholder="Digite seu nome de usuário"
                  />
                </div>

                <div>
                  <label htmlFor="funcao" className="block text-sm font-medium text-gray-700 mb-1">
                    Função
                  </label>
                  <select
                    id="funcao"
                    name="funcao"
                    value={signUpData.funcao}
                    onChange={handleSignUpDataChange}
                    className="block w-full rounded-lg border border-gray-300 bg-white py-3 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <option value="usuario">Usuário</option>
                    <option value="administrador">Administrador</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="estagiario">Estagiário</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 block w-full rounded-lg border border-gray-300 bg-white py-3 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  placeholder="Digite seu email"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10 block w-full rounded-lg border border-gray-300 bg-white py-3 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  placeholder="Digite sua senha"
                />
              </div>
              {isSignUp && (
                <p className="mt-1 text-xs text-gray-500">
                  A senha deve ter pelo menos 6 caracteres
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isSignUp ? 'Criando conta...' : 'Entrando...'}
                </div>
              ) : (
                <div className="flex items-center">
                  {isSignUp ? <UserPlus className="w-5 h-5 mr-2" /> : <User className="w-5 h-5 mr-2" />}
                  {isSignUp ? 'Criar Conta' : 'Entrar'}
                </div>
              )}
            </button>
          </div>
        </form>

        {/* Demo credentials */}
        {!isSignUp && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Credenciais de Demonstração:</h3>
            <div className="text-xs text-blue-800 space-y-1">
              <p><strong>Admin:</strong> admin@vieirastock.com / admin123</p>
              <p><strong>Usuário:</strong> user@vieirastock.com / user123</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;