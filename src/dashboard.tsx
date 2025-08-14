import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const isAuthenticated = useMemo(() => Boolean(token), [token]);

  const maskedToken = useMemo(() => {
    if (!token) return "—";
    const head = token.slice(0, 8);
    const tail = token.slice(-6);
    return `${head}...${tail}`;
  }, [token]);

  const handleCopyToken = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = token;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  return (
    <div className="min-h-dvh bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600" />
            <span className="text-lg font-semibold text-gray-900">
              Dashboard
            </span>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <Link to="/login" className="text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link to="/signup" className="text-gray-600 hover:text-gray-900">
              Signup
            </Link>
            <Link
              to="/dashboard"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>
                Quick summary of your account status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2 grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardDescription>Auth status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`inline-flex h-2.5 w-2.5 rounded-full ${
                          isAuthenticated ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <span className="font-medium text-gray-900">
                        {isAuthenticated
                          ? "Authenticated"
                          : "Not authenticated"}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {isAuthenticated
                        ? "You are logged in."
                        : "Please log in to access protected features."}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardDescription>Token</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="font-mono text-sm break-all text-gray-900">
                      {maskedToken}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        type="button"
                        onClick={handleCopyToken}
                        disabled={!token}
                      >
                        {copied ? "Copied" : "Copy token"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setToken(localStorage.getItem("token"))}
                      >
                        Refresh
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Handy shortcuts.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isAuthenticated ? (
                  <Button
                    type="button"
                    onClick={handleLogout}
                    className="w-full"
                    variant="destructive"
                  >
                    Log out
                  </Button>
                ) : (
                  <Link
                    to="/login"
                    className="block w-full text-center rounded-lg bg-blue-600 text-white font-medium py-2.5 hover:bg-blue-700"
                  >
                    Go to Login
                  </Link>
                )}

                <Link
                  to="/signup"
                  className="block w-full text-center rounded-lg border font-medium py-2.5 hover:bg-gray-50"
                >
                  Create an account
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              This is a simple dashboard. After logging in, your token is stored
              in local storage. You can copy it, refresh its display, or log out
              using the actions above.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    </div>
  );
}
