
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { DollarSign, ShoppingCart, BarChart3 as ReportsIcon, CalendarDays, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { useState, useMemo } from 'react';
import { useCurrency } from '@/hooks/useCurrency'; // Import useCurrency

// Mock Data
const mockOverallStats = {
  totalSales: 12560.75,
  totalOrders: 342,
  averageOrderValue: 36.73,
  totalCustomers: 280,
};

const mockSalesByCategoryData = [
  { category: 'Appetizers', sales: 1850.50 },
  { category: 'Main Courses', sales: 6500.25 },
  { category: 'Desserts', sales: 2200.00 },
  { category: 'Beverages', sales: 1510.00 },
  { category: 'Sides', sales: 500.00 },
];

const mockTopSellingItemsData = [
  { id: 'item4', name: 'Margherita Pizza', quantitySold: 85, revenue: 1275.00 },
  { id: 'item3', name: 'Grilled Salmon', quantitySold: 60, revenue: 1320.00 },
  { id: 'item5', name: 'Chicken Pasta', quantitySold: 70, revenue: 1295.00 },
  { id: 'item1', name: 'Spring Rolls', quantitySold: 120, revenue: 1078.80 },
  { id: 'item8', name: 'Coca-Cola', quantitySold: 150, revenue: 450.00 },
];

const mockPaymentMethodsData = [
  { name: 'Cash', value: 4500.00, fill: 'var(--color-chart-1)' },
  { name: 'Card', value: 6560.75, fill: 'var(--color-chart-2)' },
  { name: 'Mobile', value: 1500.00, fill: 'var(--color-chart-3)' },
];

const chartConfigBase = {
  sales: { label: 'Sales', color: 'hsl(var(--chart-1))' },
  Cash: { label: 'Cash', color: 'hsl(var(--chart-1))' },
  Card: { label: 'Card', color: 'hsl(var(--chart-2))' },
  Mobile: { label: 'Mobile', color: 'hsl(var(--chart-3))' },
};


export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -29),
    to: new Date(),
  });
  const { formatCurrency, currency } = useCurrency(); // Use the hook

  const chartConfig = useMemo(() => ({
    ...chartConfigBase,
    sales: { label: `Sales (${currency.symbol})`, color: 'hsl(var(--chart-1))' },
  }), [currency.symbol]);

  const filteredSalesByCategory = useMemo(() => mockSalesByCategoryData, [dateRange]);
  const filteredTopSellingItems = useMemo(() => mockTopSellingItemsData, [dateRange]);
  const filteredPaymentMethods = useMemo(() => mockPaymentMethodsData, [dateRange]);
  const overallStats = useMemo(() => mockOverallStats, [dateRange]);

  const yAxisTickFormatter = (value: number) => `${currency.symbol}${Number(value/1000).toFixed(0)}k`;
  
  const barChartTooltipFormatter = (value: number, name: string, props: any) => {
    if (name === 'sales') {
      return [formatCurrency(value), `Sales`];
    }
    return [value, name];
  };

  const pieChartTooltipFormatter = (value: number, name: string) => {
    return [formatCurrency(value), name];
  };


  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-headline font-bold flex items-center">
          <ReportsIcon className="w-8 h-8 mr-3 text-primary" />
          Performance Reports
        </h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant="outline"
              className="w-full sm:w-[300px] justify-start text-left font-normal bg-card hover:bg-muted"
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-card" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overallStats.totalSales)}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month (mock)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15% from last month (mock)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overallStats.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">+5.2% from last month (mock)</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalCustomers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+10 new this month (mock)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Sales by Category */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Revenue generated from each menu category.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={filteredSalesByCategory} margin={{ top: 5, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="category" tickLine={false} tickMargin={10} angle={-35} textAnchor="end" interval={0} style={{ fontSize: '12px' }} />
                <YAxis tickFormatter={yAxisTickFormatter} style={{ fontSize: '12px' }} />
                <ChartTooltip 
                  cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                  content={<ChartTooltipContent indicator="dot" formatter={barChartTooltipFormatter} />} 
                />
                <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Payment Method Distribution */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Distribution of payment methods used.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center pt-6">
            <ChartContainer config={chartConfig} className="h-[300px] w-full max-w-[350px]">
              <PieChart accessibilityLayer>
                <RechartsTooltip content={<ChartTooltipContent hideLabel nameKey="name" formatter={pieChartTooltipFormatter} />} />
                <Pie 
                  data={filteredPaymentMethods} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={90}
                  labelLine={false} 
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.4;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    if ((percent * 100) < 5) return null; 
                    return (
                      <text x={x} y={y} fill="hsl(var(--primary-foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10px" fontWeight="medium">
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                >
                  {filteredPaymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke={'hsl(var(--card))'} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="name" className="text-xs"/>} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Items */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Items</CardTitle>
          <CardDescription>Most popular items by quantity and revenue for the selected period.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Showing top 5 selling items.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead className="text-center">Quantity Sold</TableHead>
                <TableHead className="text-right">Total Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTopSellingItems.length > 0 ? (
                filteredTopSellingItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-center">{item.quantitySold.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                </TableRow>
              ))
              ) : (
                 <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">No sales data for top items in this period.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
