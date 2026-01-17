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
  DollarSign, 
  Plus, 
  TrendingUp,
  TrendingDown,
  Wallet,
  Trash2,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Transaction } from "@shared/schema";

export default function Finances() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [newTransaction, setNewTransaction] = useState({ 
    type: 'expense' as 'income' | 'expense', 
    category: '', 
    description: '', 
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  });

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const createTransaction = useMutation({
    mutationFn: async (trans: typeof newTransaction) => {
      const res = await apiRequest("POST", "/api/transactions", trans);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setShowForm(false);
      setNewTransaction({ type: 'expense', category: '', description: '', amount: 0, date: new Date().toISOString().split('T')[0] });
      toast({ title: t('common.success'), description: t('finances.transactionRecorded') });
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({ title: t('common.success'), description: t('finances.transactionDeleted') });
    },
  });

  const totalIncome = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
  const totalExpenses = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
  const balance = totalIncome - totalExpenses;

  const chartData = transactions?.slice(0, 10).reverse().map(t => ({
    date: new Date(t.date || t.createdAt!).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    amount: t.type === 'income' ? t.amount : -(t.amount || 0),
    type: t.type
  })) || [];

  const expenseCategoryKeys = ['seeds', 'fertilizers', 'labor', 'equipmentCost', 'transport', 'other'];
  const incomeCategoryKeys = ['cropSales', 'subsidies', 'otherIncome'];

  return (
    <div className="p-6 space-y-8 bg-background/50 min-h-screen">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary">{t('finances.title')}</h1>
          <p className="text-muted-foreground text-lg mt-1">{t('finances.subtitle')}</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2" data-testid="button-add-transaction">
          <Plus className="w-4 h-4" />
          {t('finances.addTransaction')}
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-green-600">
              <TrendingUp className="w-4 h-4" />
              {t('finances.income')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">₹{totalIncome.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-600">
              <TrendingDown className="w-4 h-4" />
              {t('finances.expense')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">₹{totalExpenses.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className={`border-${balance >= 0 ? 'primary' : 'orange-500'}/20 bg-${balance >= 0 ? 'primary' : 'orange-500'}/5`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
              <Wallet className="w-4 h-4" />
              {t('finances.balance')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${balance >= 0 ? 'text-primary' : 'text-orange-600'}`}>
              ₹{balance.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('finances.thisMonth')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} />
                  <YAxis stroke="#888888" fontSize={12} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

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
                  <DollarSign className="w-5 h-5 text-primary" />
                  {t('finances.addTransaction')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={newTransaction.type === 'income' ? 'default' : 'outline'}
                    onClick={() => setNewTransaction({ ...newTransaction, type: 'income', category: '' })}
                    className="flex-1 gap-2"
                    data-testid="button-type-income"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    {t('finances.income')}
                  </Button>
                  <Button
                    variant={newTransaction.type === 'expense' ? 'default' : 'outline'}
                    onClick={() => setNewTransaction({ ...newTransaction, type: 'expense', category: '' })}
                    className="flex-1 gap-2"
                    data-testid="button-type-expense"
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    {t('finances.expense')}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('finances.amount')}</Label>
                    <Input
                      type="number"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({ ...newTransaction, amount: Number(e.target.value) })}
                      placeholder="0"
                      data-testid="input-amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('finances.date')}</Label>
                    <Input
                      type="date"
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                      data-testid="input-date"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('inventory.category')}</Label>
                  <div className="flex gap-2 flex-wrap">
                    {(newTransaction.type === 'income' ? incomeCategoryKeys : expenseCategoryKeys).map((key) => (
                      <Button
                        key={key}
                        variant={newTransaction.category === key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setNewTransaction({ ...newTransaction, category: key })}
                        data-testid={`button-category-${key}`}
                      >
                        {t(`finances.${key}`)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('finances.description')}</Label>
                  <Input
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                    placeholder="Add notes..."
                    data-testid="input-description"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button 
                    onClick={() => createTransaction.mutate(newTransaction)}
                    disabled={!newTransaction.category || !newTransaction.amount || createTransaction.isPending}
                    data-testid="button-save-transaction"
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
          <CardTitle>{t('finances.recentTransactions')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">{t('common.loading')}</p>
          ) : transactions?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t('finances.noTransactions')}</p>
          ) : (
            <div className="space-y-3">
              {transactions?.map((trans) => (
                <motion.div
                  key={trans.id}
                  layout
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-muted hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      trans.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}>
                      {trans.type === 'income' ? (
                        <ArrowUpRight className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{t(`finances.${trans.category}`) || trans.category}</p>
                      <p className="text-xs text-muted-foreground">
                        {trans.description || new Date(trans.date || trans.createdAt!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className={`font-bold ${trans.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {trans.type === 'income' ? '+' : '-'}₹{(trans.amount || 0).toLocaleString()}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTransaction.mutate(trans.id)}
                      data-testid={`button-delete-transaction-${trans.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
