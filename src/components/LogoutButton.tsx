"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/" }); // Redirect to the home page after logout
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  return (
    <Button variant="default" onClick={handleLogout} className="p-2" >
      Logout
    </Button>
  );
}