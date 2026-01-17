import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  Plus, 
  Leaf,
  FlaskConical,
  Bug,
  Wrench,
  AlertCircle,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { InventoryItem } from "@shared/schema";

const categoryIcons: Record<string, any> = {
  seeds: Leaf,
  fertilizers: FlaskConical,
  pesticides: Bug,
  equipment: Wrench,
};

const categoryColors: Record<string, string> = {
  seeds: 'bg-green-500/10 text-green-600 border-green-500/20',
  fertilizers: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  pesticides: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  equipment: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

export default function Inventory() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ name: '', category: 'seeds', quantity: 0, unit: 'kg', minStock: 10 });

  const { data: items, isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  const createItem = useMutation({
    mutationFn: async (item: typeof newItem) => {
      const res = await apiRequest("POST", "/api/inventory", item);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      setShowForm(false);
      setNewItem({ name: '', category: 'seeds', quantity: 0, unit: 'kg', minStock: 10 });
      toast({ title: t('common.success'), description: t('inventory.itemAdded') });
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const res = await apiRequest("PATCH", `/api/inventory/${id}`, { quantity });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/inventory/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({ title: t('common.success'), description: t('inventory.itemRemoved') });
    },
  });

  const categories = ['seeds', 'fertilizers', 'pesticides', 'equipment'];
  const filteredItems = selectedCategory 
    ? items?.filter(i => i.category === selectedCategory) 
    : items;

  const lowStockItems = items?.filter(i => (i.quantity || 0) < (i.minStock || 0)) || [];

  const getCategoryCount = (cat: string) => items?.filter(i => i.category === cat).length || 0;

  return (
    <div className="p-6 space-y-8 bg-background/50 min-h-screen">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary">{t('inventory.title')}</h1>
          <p className="text-muted-foreground text-lg mt-1">{t('inventory.subtitle')}</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2" data-testid="button-add-item">
          <Plus className="w-4 h-4" />
          {t('inventory.addItem')}
        </Button>
      </header>

      {lowStockItems.length > 0 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-600 font-medium">
              {t('inventory.lowStock')}: {lowStockItems.map(i => i.name).join(', ')}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const Icon = categoryIcons[cat];
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(isSelected ? null : cat)}
              className={`p-4 rounded-xl border transition-all ${
                isSelected 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50 bg-card'
              }`}
              data-testid={`button-category-${cat}`}
            >
              <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="font-medium text-sm">{t(`inventory.${cat}`)}</p>
              <p className="text-2xl font-bold text-primary">{getCategoryCount(cat)}</p>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={ { opacity: 0, height: 0 } }
            animate={ { opacity: 1, height: 'auto' } }
            exit={ { opacity: 0, height: 0 } }
          >
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  {t('inventory.addItem')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('inventory.itemName')}</Label>
                    <Input
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="Enter item name..."
                      data-testid="input-item-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('inventory.category')}</Label>
                    <div className="flex gap-2 flex-wrap">
                      {categories.map((cat) => (
                        <Button
                          key={cat}
                          variant={newItem.category === cat ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setNewItem({ ...newItem, category: cat })}
                          data-testid={`button-select-${cat}`}
                        >
                          {t(`inventory.${cat}`)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t('inventory.quantity')}</Label>
                    <Input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                      data-testid="input-quantity"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('inventory.unit')}</Label>
                    <Input
                      value={newItem.unit}
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                      placeholder="kg, liters, pieces..."
                      data-testid="input-unit"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('inventory.minStockAlert')}</Label>
                    <Input
                      type="number"
                      value={newItem.minStock}
                      onChange={(e) => setNewItem({ ...newItem, minStock: Number(e.target.value) })}
                      data-testid="input-min-stock"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button 
                    onClick={() => createItem.mutate(newItem)}
                    disabled={!newItem.name || createItem.isPending}
                    data-testid="button-save-item"
                  >
                    {t('common.save')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            {selectedCategory ? t(`inventory.${selectedCategory}`) : t('inventory.allItems')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">{t('common.loading')}</p>
          ) : filteredItems?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t('inventory.noItems')}</p>
          ) : (
            <div className="space-y-3">
              {filteredItems?.map((item) => {
                const Icon = categoryIcons[item.category] || Package;
                const isLow = (item.quantity || 0) < (item.minStock || 0);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-muted hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoryColors[item.category]}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {item.name}
                          {isLow && <AlertCircle className="w-4 h-4 text-red-500" />}
                        </p>
                        <p className="text-xs text-muted-foreground">{t(`inventory.${item.category}`)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateItem.mutate({ id: item.id, quantity: Math.max(0, (item.quantity || 0) - 1) })}
                          data-testid={`button-decrease-${item.id}`}
                        >
                          -
                        </Button>
                        <span className={`font-bold min-w-[60px] text-center ${isLow ? 'text-red-500' : ''}`}>
                          {item.quantity} {item.unit}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateItem.mutate({ id: item.id, quantity: (item.quantity || 0) + 1 })}
                          data-testid={`button-increase-${item.id}`}
                        >
                          +
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteItem.mutate(item.id)}
                        data-testid={`button-delete-item-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
