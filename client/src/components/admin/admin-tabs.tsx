import { useState } from "react";
import { ProductTable } from "./product-table";
import { ProductForm } from "./product-form";
import { Button } from "@/components/ui/button";

interface AdminTabsProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function AdminTabs({ onShowToast }: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'add-product'>('products');

  return (
    <section className="py-8" data-testid="section-admin">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="text-admin-title">
            Admin Dashboard
          </h2>
          <p className="text-muted-foreground" data-testid="text-admin-subtitle">
            Manage your product inventory
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-border">
            <nav className="-mb-px flex space-x-8">
              <Button
                variant="ghost"
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('products')}
                data-testid="tab-products"
              >
                Products
              </Button>
              <Button
                variant="ghost"
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'add-product'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('add-product')}
                data-testid="tab-add-product"
              >
                Add Product
              </Button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'products' && (
          <ProductTable onShowToast={onShowToast} />
        )}
        
        {activeTab === 'add-product' && (
          <ProductForm onShowToast={onShowToast} />
        )}
      </div>
    </section>
  );
}
