"use client";
import React from "react";
import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

const Page = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setLoading] = useState(false);
  /**
   * Function for sign in
   */
  const onSubmit = async () => {
    setLoading(true);
    const signInData = await signIn("credentials", {
      redirect: true,
      email: email,
      password: password,
      callbackUrl: "/upload",
    });

    if (signInData?.error) {
      console.log("Sign-in Error:", signInData.error);
      setLoading(false);
    } else {
      console.log("Sign-in successful, redirecting to Upload section...");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in here!</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Password"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={onSubmit}>Submit</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
