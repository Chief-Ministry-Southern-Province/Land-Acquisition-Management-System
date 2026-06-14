import { router } from '@inertiajs/react';
import { LogIn } from 'lucide-react';

function LoginScreen() {
  const handleLogin = () => {
    console.log('Login attempted');
    router.visit('/dashboard'); //IMPLEMENT
  };

  return (
    <div className="from-primary to-primary/80 bg-linear-to-br flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg p-8 shadow-xl">
          {/* Logo and Title */}
          <div className="mb-8 text-center">
            <div className="bg-primary mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
              <span className="text-3xl text-white">LA</span>
            </div>
            <h1 className="mb-2 text-2xl">
              Land Acquisition Management System
            </h1>
            <p className="text-muted-foreground text-sm">
              Government of Sri Lanka
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm">Username</label>
              <input
                type="text"
                // value={username}
                // onChange={(e) => setUsername(e.target.value)} //IMPLEMENT
                className="bg-input-background border-border focus:ring-primary w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm">Password</label>
              <input
                type="password"
                // value={password}
                // onChange={(e) => setPassword(e.target.value)} //IMPLEMENT
                className="bg-input-background border-border focus:ring-primary w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  // checked={rememberMe}
                  // onChange={(e) =>
                  //     setRememberMe(e.target.checked)
                  // } //IMPLEMENT
                  className="text-primary border-border focus:ring-primary h-4 w-4 rounded"
                />
                <span className="text-sm">Remember me</span>
              </label>

              <a href="#" className="text-primary text-sm hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="bg-primary hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-white transition-colors"
            >
              <LogIn className="h-5 w-5" />
              <span>Sign In</span>
            </button>
          </form>

          {/* Security Notice */}
          <div className="bg-muted/50 mt-6 rounded-lg p-4">
            <p className="text-muted-foreground text-center text-xs">
              <strong>Security Notice:</strong> This is a government system.
              Unauthorized access is prohibited and may be subject to legal
              action.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
