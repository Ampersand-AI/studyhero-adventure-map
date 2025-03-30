
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

interface StudyAIHeaderProps {
  userName: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  navigation: Array<{ name: string; href: string; icon: React.ReactNode }>;
}

const StudyAIHeader = ({ 
  userName = "User", // Default value if userName is not provided
  avatarUrl, 
  level, 
  xp,
  navigation
}: StudyAIHeaderProps) => {
  // Ensure userName is a non-empty string for the avatar fallback
  const fallbackInitial = (userName && userName.length > 0) ? userName[0] : "U";
  
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="flex flex-col h-full">
                <div className="px-2">
                  <h2 className="text-lg font-display mb-2 text-center text-primary">Study AI</h2>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={avatarUrl} alt={userName || "User"} />
                      <AvatarFallback>{fallbackInitial}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{userName || "User"}</p>
                      <p className="text-xs text-muted-foreground">Level {level}</p>
                    </div>
                  </div>
                </div>
                <Separator className="my-4" />
                <nav className="flex-1 px-2">
                  <div className="space-y-1">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-muted"
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <Link to="/" className="hidden md:flex items-center gap-2">
            <span className="font-display text-2xl text-primary">Study AI</span>
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary"
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <div className="flex flex-col items-end">
              <p className="text-sm font-medium">Level {level}</p>
              <p className="text-xs text-muted-foreground">{xp} XP</p>
            </div>
          </div>
          <Avatar>
            <AvatarImage src={avatarUrl} alt={userName || "User"} />
            <AvatarFallback>{fallbackInitial}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default StudyAIHeader;
