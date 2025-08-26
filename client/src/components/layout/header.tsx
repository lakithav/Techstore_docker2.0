import { Cpu, ShoppingCart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  isAdminMode: boolean;
  onToggleAdmin: () => void;
  cartItemCount: number;
  onOpenCart: () => void;
}

export function Header({ isAdminMode, onToggleAdmin, cartItemCount, onOpenCart }: HeaderProps) {
  return (
    <header className="bg-card shadow-sm border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Cpu className="text-primary text-2xl h-8 w-8" />
            <h1 className="text-xl font-bold text-foreground">TechStore</h1>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-foreground hover:text-primary transition-colors">Products</a>
            <a href="#" className="text-foreground hover:text-primary transition-colors">About</a>
            <a href="#" className="text-foreground hover:text-primary transition-colors">Contact</a>
          </nav>
          
          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button
              variant={isAdminMode ? "default" : "secondary"}
              size="sm"
              onClick={onToggleAdmin}
              data-testid="button-admin-toggle"
            >
              {isAdminMode ? "Store View" : "Admin View"}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={onOpenCart}
              data-testid="button-cart-toggle"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center"
                  data-testid="text-cart-count"
                >
                  {cartItemCount}
                </span>
              )}
            </Button>
            
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
