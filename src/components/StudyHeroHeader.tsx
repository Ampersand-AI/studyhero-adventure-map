
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface StudyHeroHeaderProps {
  userName: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  navigation: Array<{ name: string; href: string; icon: React.ReactNode }>;
}

const StudyHeroHeader = ({ 
  userName, 
  avatarUrl, 
  level, 
  xp,
  navigation
}: StudyHeroHeaderProps) => {
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
                      <AvatarImage src={avatarUrl} alt={userName} />
                      <AvatarFallback>{userName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{userName}</p>
                      <p className="text-xs text-muted-foreground">Level {level}</p>
                    </div>
                  </div>
                </div>
                <Separator className="my-4" />
                <nav className="flex-1 px-2">
                  <div className="space-y-1">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-muted"
                      >
                        {item.icon}
                        {item.name}
                      </a>
                    ))}
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <a href="/" className="hidden md:flex items-center gap-2">
            <span className="font-display text-2xl text-primary">Study AI</span>
          </a>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary"
            >
              {item.icon}
              {item.name}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive"></span>
          </Button>
          <div className="hidden md:flex items-center gap-2">
            <div className="flex flex-col items-end">
              <p className="text-sm font-medium">Level {level}</p>
              <p className="text-xs text-muted-foreground">{xp} XP</p>
            </div>
          </div>
          <Avatar>
            <AvatarImage src={avatarUrl} alt={userName} />
            <AvatarFallback>{userName[0]}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default StudyHeroHeader;
