"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export function SignupModal() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleSignup = async () => {
    try {
      // Validate inputs
      if (!username || !email || !password) {
        toast.error("Username, email and password are required");
        return;
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Registration successful!");
        router.push("/login");
      } else {
        toast.error(data.error || "Registration failed");
      }
    } catch (error) {
      console.error("Signup failed:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <Card className="w-xl">
      <CardContent>
        <CardHeader className="relative">
          <CardTitle className="text-xl font-medium">Sign Up</CardTitle>
        </CardHeader>

        <div className="grid gap-4 py-4">
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border rounded-md px-3 py-2"
          />
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded-md px-3 py-2"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded-md px-3 py-2"
          />
          <Button onClick={handleSignup} className="w-full mt-2">
            Register
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <Link href="/login" className="text-sm text-blue-600 hover:underline">Already have an account?</Link>
      </CardFooter>
    </Card>
  );
}
