
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CheckoutSettings, OrderDetails, ActiveFeatures } from '../types.ts';

interface Product {
  id: string;
  name: string;
  sku: string;
  image: string;
  unitPrice: number;
  originalUnitPrice: number;
  discountLabel: string;
  quantity: number;
}

interface ShippingSelection {
  id: string;
  methodId: string;
  itemCount: number;
}

interface Address {
  id: string;
  country: string;
  street: string;
  apt: string;
  city: string;
  state: string;
  zip: string;
  shippingSelections: ShippingSelection[];
}

interface CheckoutFormProps {
  settings: CheckoutSettings;
  orderDetails: OrderDetails;
  activeFeatures: ActiveFeatures;
  onUpdateOrder: (updates: Partial<OrderDetails>) => void;
  onToggleFeature: (id: string) => void;
  isDrawerOpen: boolean;
  drawerTitle: string;
  onOpenDrawer: (title?: string) => void;
  onOpenDrawerByName: (title?: string) => void;
  onCloseDrawer: () => void;
  sidebarWidth: number;
  isSidebarCollapsed: boolean;
  onExpandSidebar: () => void;
}

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'BR', name: 'Brazil' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'FR', name: 'France' },
];

const STATES = [
  'Alabama', 'Alaska', 'California', 'Florida', 'New York', 'Texas'
];

const SHIPPING_METHODS = [
  { id: 'standard', label: 'Standard Shipping', price: 0, deliveryTime: '1-2 Business weeks' },
  { id: 'express', label: 'Express Shipping', price: 15.00, deliveryTime: '3-5 Business days' },
  { id: 'pickup', label: 'Pickup', price: 0, deliveryTime: 'Ready in 2 hours' }
];

const CUSTOMER_ROLES = [
  'Buyer',
  'Organization Manager',
  'Financial Administrator',
  'Store Manager',
  'Order Approver',
  'Procurement Specialist',
  'Inventory Manager'
];

const generateInitialProducts = (): Product[] => {
  const products: Product[] = [];
  const baseNames = [
    'Business smartphone X5 256GB/8GB Green',
    'Professional Tablet Pro 11-inch Space Gray',
    'Enterprise Laptop Z-Series 16" Silver',
    'Wireless Noise Cancelling Headphones 700',
    'Smartwatch Series 9 45mm Midnight',
    'Cloud Storage Annual Subscription 2TB',
    'Ultra-Wide 4K Monitor 34-inch',
    'Ergonomic Mechanical Keyboard RGB',
    'Precision Laser Mouse Wireless',
    'Portable External SSD 1TB USB-C',
    'HD Video Conferencing Camera 4K',
    'Smart Home Hub v3.0 White',
    'Noise Isolation Earbuds Pro',
    'Graphic Tablet with Stylus Pen',
    'Smart Power Strip 6-Outlet',
    'Microphone Stand with Pop Filter',
    'Studio Quality USB Microphone',
    'Desktop Speaker System 2.1',
    'Privacy Screen Filter for 16" Laptop',
    'Compact Document Scanner',
    'High-Speed Wi-Fi 6 Router',
    'Universal Laptop Docking Station',
    'Anti-Glare Laptop Stand',
    'Bluetooth Trackpad Silver',
    'Wired USB-C to Ethernet Adapter'
  ];

  for (let i = 0; i < 112; i++) {
    const baseName = baseNames[i % baseNames.length];
    const suffix = i >= baseNames.length ? ` (Unit ${i + 1})` : '';
    products.push({
      id: `p${i + 1}`,
      name: `${baseName}${suffix}`,
      sku: `E-PROD-${1000 + i}-X`,
      image: `https://picsum.photos/seed/${i + 100}/100/100`,
      unitPrice: Math.floor(Math.random() * 500) + 49.90,
      originalUnitPrice: Math.floor(Math.random() * 700) + 99.90,
      discountLabel: `${Math.floor(Math.random() * 15) + 5}% discount`,
      quantity: Math.floor(Math.random() * 20) + 1
    });
  }
  return products;
};

const INITIAL_PRODUCTS = generateInitialProducts();

const SECTIONS_ORDER = {
  'single-step': [
    { id: 'customer', title: 'Customer' },
    { id: 'delivery', title: 'Delivery' },
    { id: 'payment', title: 'Payment' }
  ],
  'multi-step': [
    { id: 'customer', title: 'Customer' },
    { id: 'delivery', title: 'Delivery' },
    { id: 'payment', title: 'Payment' }
  ]
};

const GoogleCheckbox: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string | React.ReactNode;
  themeColor: string;
}> = ({ checked, onChange, label, themeColor }) => {
  return (
    <div 
      className="flex items-center group cursor-pointer h-10" 
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
    >
      <div className="relative flex items-center justify-center w-10 h-10 -ml-2.5 shrink-0">
        <div className="absolute inset-0 rounded-full bg-neutral-100 opacity-0 group-hover:opacity-100 group-active:bg-neutral-200 transition-opacity duration-200" />
        <div 
          className={`w-[18px] h-[18px] border-2 rounded-[2px] transition-all duration-200 flex items-center justify-center z-10
            ${checked ? 'border-transparent' : 'border-neutral-400 group-hover:border-neutral-500'}
          `}
          style={{ backgroundColor: checked ? themeColor : 'transparent' }}
        >
          <span 
            className={`material-symbols-outlined text-white text-[16px] font-bold transition-transform duration-200 ${checked ? 'scale-100' : 'scale-0'}`}
          >
            check
          </span>
        </div>
      </div>
      {label && (
        <span className="text-[14px] text-neutral-600 group-hover:text-neutral-900 transition-colors pl-1 select-none">
          {label}
        </span>
      )}
    </div>
  );
};

const FloatingInput: React.FC<{
  label: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  themeColor: string;
  rightIcon?: string;
}> = ({ label, type = 'text', value, onChange, themeColor, rightIcon }) => {
  const [isFocused, setIsFocused] = useState(false);
  const isFloating = isFocused || (value && value.length > 0);

  return (
    <div className="relative w-full">
      <div 
        className={`w-full h-[56px] border transition-all duration-300 ease-in-out bg-white rounded-[4px] ${
          isFocused ? 'border-2' : 'border-neutral-200'
        }`}
        style={{ 
          borderColor: isFocused ? themeColor : undefined,
          boxShadow: isFocused ? `0 0 0 4px ${themeColor}15` : undefined,
        } as any}
      >
        <input 
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full h-full px-4 pt-5 pb-1 bg-transparent border-none outline-none text-[14px] text-neutral-900 transition-all duration-300 ${rightIcon ? 'pr-12' : ''}`}
        />
        <label 
          className={`absolute pointer-events-none transition-all duration-300 ease-in-out whitespace-nowrap left-[16px]
            ${isFloating 
              ? 'top-[8px] text-[11px] text-neutral-500 font-medium translate-y-0' 
              : 'top-1/2 -translate-y-1/2 text-[14px] font-normal tracking-[-1%] text-neutral-400'
            }`}
        >
          {label}
        </label>
        {rightIcon && (
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 text-[18px]">
            {rightIcon}
          </span>
        )}
      </div>
    </div>
  );
};

const FloatingTextArea: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  themeColor: string;
  maxLength?: number;
}> = ({ label, value, onChange, themeColor, maxLength }) => {
  const [isFocused, setIsFocused] = useState(false);
  const isFloating = isFocused || (value && value.length > 0);

  return (
    <div className="relative w-full">
      <div 
        className={`w-full min-h-[120px] border transition-all duration-300 ease-in-out bg-white rounded-[4px] relative ${
          isFocused ? 'border-2' : 'border-neutral-200'
        }`}
        style={{ 
          borderColor: isFocused ? themeColor : undefined,
          boxShadow: isFocused ? `0 0 0 4px ${themeColor}15` : undefined,
        } as any}
      >
        <textarea 
          value={value}
          onChange={(e) => {
            if (maxLength && e.target.value.length > maxLength) return;
            onChange(e.target.value);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full h-full min-h-[120px] px-4 pt-7 pb-8 bg-transparent border-none outline-none text-[14px] text-neutral-900 transition-all duration-300 resize-none"
        />
        <label 
          className={`absolute pointer-events-none transition-all duration-300 ease-in-out whitespace-nowrap left-[16px]
            ${isFloating 
              ? 'top-[8px] text-[11px] text-neutral-500 font-medium translate-y-0' 
              : 'top-[22px] text-[14px] font-normal tracking-[-1%] text-neutral-400'
            }`}
        >
          {label}
        </label>
        {maxLength && (
          <div className="absolute bottom-2 right-4 text-[11px] text-neutral-400 font-medium font-inter">
            {value.length}/{maxLength}
          </div>
        )}
      </div>
    </div>
  );
};

const FloatingSelect: React.FC<{
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
  themeColor: string;
}> = ({ label, options, value, onChange, themeColor }) => {
  const [isFocused, setIsFocused] = useState(false);
  const isFloating = isFocused || (value && value.length > 0);

  return (
    <div className="relative w-full">
      <div 
        className={`w-full h-[56px] border transition-all duration-300 ease-in-out bg-white rounded-[4px] ${
          isFocused ? 'border-2' : 'border-neutral-200'
        }`}
        style={{ 
          borderColor: isFocused ? themeColor : undefined,
          boxShadow: isFocused ? `0 0 0 4px ${themeColor}15` : undefined,
        } as any}
      >
        <select 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full h-full px-4 pt-5 pb-1 bg-transparent border-none outline-none text-[14px] text-neutral-900 appearance-none cursor-pointer pr-10 transition-all duration-300"
        >
          <option value="" disabled hidden></option>
          {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <label 
          className={`absolute pointer-events-none transition-all duration-300 ease-in-out whitespace-nowrap left-[16px]
            ${isFloating 
              ? 'top-[8px] text-[11px] text-neutral-500 font-medium translate-y-0' 
              : 'top-1/2 -translate-y-1/2 text-[14px] font-normal tracking-[-1%] text-neutral-400'
            }`}
        >
          {label}
        </label>
        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none text-[20px]">expand_more</span>
      </div>
    </div>
  );
};

const ShippingMethodSelect: React.FC<{
  value: string;
  onChange: (id: string) => void;
  itemCount: number;
  themeColor: string;
  onOpenDrawer: () => void;
  onRemove?: () => void;
  onToggleOpen?: (isOpen: boolean) => void;
  availableMethods: typeof SHIPPING_METHODS;
}> = ({ value, onChange, itemCount, themeColor, onOpenDrawer, onRemove, onToggleOpen, availableMethods }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedMethod = SHIPPING_METHODS.find(m => m.id === value) || SHIPPING_METHODS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onToggleOpen?.(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onToggleOpen]);

  const toggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    onToggleOpen?.(next);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        onClick={toggle}
        className="w-full h-[64px] border border-neutral-200 rounded-[4px] bg-white px-4 flex items-center justify-between cursor-pointer hover:border-neutral-300 transition-all shadow-sm group"
      >
        <div className="flex flex-col">
          <span className="text-[14px] font-medium text-neutral-900">
            {selectedMethod.label}
          </span>
          <span className="text-[12px] text-neutral-500 font-normal">
            {selectedMethod.deliveryTime}
          </span>
        </div>
        <div className="flex items-center">
          <div className="flex items-center">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onOpenDrawer();
              }}
              className="text-[13px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              {itemCount === 0 ? 'Add items' : `${itemCount} items`}
            </button>
            <div className="w-[20px]" /> 
            <span className={`text-[14px] font-bold ${selectedMethod.price === 0 ? 'text-[#000]' : 'text-neutral-900'}`}>
              {selectedMethod.price === 0 ? 'Free' : `$${selectedMethod.price.toFixed(2)}`}
            </span>
          </div>
          <div className="w-2" />
          <span className={`material-symbols-outlined text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-neutral-200 rounded-[8px] shadow-lg z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          {availableMethods.map((method) => (
            <div 
              key={method.id}
              onClick={() => {
                onChange(method.id);
                setIsOpen(false);
                onToggleOpen?.(false);
              }}
              className={`flex items-center justify-between px-4 h-[48px] cursor-pointer hover:bg-neutral-50 transition-colors ${method.id === value ? 'bg-blue-50/20' : ''}`}
            >
              <div className="flex flex-col">
                <span className={`text-[14px] ${method.id === value ? 'font-bold text-neutral-900' : 'text-neutral-600'}`}>
                  {method.label}
                </span>
                <span className="text-[12px] text-neutral-400">{method.deliveryTime}</span>
              </div>
              <span className={`text-[14px] font-bold ${method.price === 0 ? 'text-[#000]' : 'text-neutral-900'}`}>
                {method.price === 0 ? 'Free' : `$${method.price.toFixed(2)}`}
              </span>
            </div>
          ))}
          {onRemove && (
             <div 
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
                setIsOpen(false);
                onToggleOpen?.(false);
              }}
              className="flex items-center gap-2 px-4 h-[48px] cursor-pointer hover:bg-red-50 text-red-500 border-t border-neutral-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              <span className="text-[13px] font-medium">Remove this method</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SectionHeader = ({ title, extra, titleStyle, onCollapse, isCollapsed, iconLeft }: { title: string, extra?: React.ReactNode, titleStyle?: React.CSSProperties, onCollapse?: () => void, isCollapsed?: boolean, iconLeft?: React.ReactNode }) => (
  <div className="flex items-center justify-between w-full">
    <div className="flex items-center gap-2">
      {onCollapse && (
        <button 
          onClick={(e) => { e.stopPropagation(); onCollapse(); }}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-all text-neutral-500"
        >
          <span className={`material-symbols-outlined transition-transform duration-300 ${isCollapsed ? '-rotate-90' : ''}`}>
            expand_more
          </span>
        </button>
      )}
      {iconLeft}
      <h4 
        className="text-[16px] font-semibold text-neutral-900 leading-none"
        style={{ letterSpacing: '-2%', fontFamily: 'Inter', ...titleStyle }}
      >
        {title}
      </h4>
    </div>
    {extra}
  </div>
);

const CheckoutForm: React.FC<CheckoutFormProps> = ({ 
  settings, 
  orderDetails, 
  activeFeatures, 
  onUpdateOrder, 
  onToggleFeature,
  isDrawerOpen,
  drawerTitle,
  onOpenDrawer,
  onOpenDrawerByName,
  onCloseDrawer,
  sidebarWidth,
  isSidebarCollapsed,
  onExpandSidebar
}) => {
  const currentSections = useMemo(() => SECTIONS_ORDER[settings.layout], [settings.layout]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    setCurrentStepIndex(0);
  }, [settings.layout]);

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedProducts, setSelectedProducts] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  
  const [useShippingForBilling, setUseShippingForBilling] = useState(true);
  const [newsChecked, setNewsChecked] = useState(true);

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Additional Data - Accounting Fields
  const [poNumber, setPoNumber] = useState('');
  const [costCenter, setCostCenter] = useState('');
  const [department, setDepartment] = useState('');

  // Additional Data - Comments
  const [orderComment, setOrderComment] = useState('');
  const [showCommentField, setShowCommentField] = useState(false);
  const [isAdditionalDataCollapsed, setIsAdditionalDataCollapsed] = useState(false);
  
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [collapsedAddresses, setCollapsedAddresses] = useState<Set<string>>(new Set());

  const [shippingAddresses, setShippingAddresses] = useState<Address[]>([
    { 
      id: '1', country: 'US', street: '', apt: '', city: '', state: '', zip: '', 
      shippingSelections: [{ id: 'sel-1', methodId: 'standard', itemCount: INITIAL_PRODUCTS.length }] 
    }
  ]);

  useEffect(() => {
    if (!settings.multiShippingAddress && shippingAddresses.length > 1) {
      setShippingAddresses(prev => [prev[0]]);
    }
  }, [settings.multiShippingAddress]);

  useEffect(() => {
    if (!settings.multiShippingMethod) {
      setShippingAddresses(prev => prev.map(addr => ({
        ...addr,
        shippingSelections: [addr.shippingSelections[0]]
      })));
    }
  }, [settings.multiShippingMethod]);

  const toggleAddressCollapse = (id: string) => {
    setCollapsedAddresses(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const [billingAddressFields, setBillingAddressFields] = useState({
    street: '',
    apt: '',
    city: '',
    zip: ''
  });
  const [selectedBillingCountry, setSelectedBillingCountry] = useState('US');
  const [selectedBillingState, setSelectedBillingState] = useState('');

  const availablePaymentMethods = [
    { id: 'Credit card', label: 'Credit card', featureId: 'Payment-Credit card' },
    { id: 'Account billing', label: 'Account billing', featureId: 'Payment-Account billing' },
    { id: 'Shop Pay', label: 'Shop Pay • Pay in full or in installments', featureId: 'Payment-Shop Pay' },
    { id: 'PayPal', label: 'Paypal', featureId: 'Payment-Paypal' },
    { id: 'Pix', label: 'Pix', featureId: 'Payment-Pix' },
    { id: 'Google Pay', label: 'Google Pay', featureId: 'Payment-Google Pay' },
    { id: 'Afterpay', label: 'Afterpay', featureId: 'Payment-Afterpay' }
  ].filter(m => !!activeFeatures[m.featureId]);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(availablePaymentMethods[0]?.id || 'Credit card');

  useEffect(() => {
    if (availablePaymentMethods.length > 0 && !availablePaymentMethods.find(m => m.id === selectedPaymentMethod)) {
      setSelectedPaymentMethod(availablePaymentMethods[0].id);
    }
  }, [activeFeatures]);

  const handleToggleReturns = (checked: boolean) => {
    onUpdateOrder({ returnsProtection: checked ? 3.00 : 0 });
  };

  const updateShippingAddress = (index: number, field: keyof Address, value: any) => {
    setShippingAddresses(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addShippingAddress = () => {
    setShippingAddresses(prev => [
      ...prev,
      { 
        id: Date.now().toString(), country: 'US', street: '', apt: '', city: '', state: '', zip: '', 
        shippingSelections: [{ id: `sel-${Date.now()}`, methodId: 'standard', itemCount: 0 }] 
      }
    ]);
  };

  const removeShippingAddress = (index: number) => {
    if (shippingAddresses.length > 1) {
      setShippingAddresses(prev => prev.filter((_, i) => i !== index));
    }
  };

  const addShippingMethodToAddress = (addrIdx: number) => {
    setShippingAddresses(prev => {
      const next = [...prev];
      const currentSelectedMethods = next[addrIdx].shippingSelections.map(s => s.methodId);
      const remainingMethods = SHIPPING_METHODS.filter(m => !currentSelectedMethods.includes(m.id));
      
      if (remainingMethods.length > 0) {
        // Fix: Remove non-existent property 'height' from ShippingSelection
        next[addrIdx].shippingSelections.push({ 
          id: `sel-${Date.now()}`, 
          methodId: remainingMethods[0].id, 
          itemCount: 0 
        });
      }
      return next;
    });
  };

  const updateShippingMethodInAddress = (addrIdx: number, selIdx: number, methodId: string) => {
    setShippingAddresses(prev => {
      const next = [...prev];
      next[addrIdx].shippingSelections[selIdx].methodId = methodId;
      return next;
    });
  };

  const removeShippingMethodFromAddress = (addrIdx: number, selIdx: number) => {
    setShippingAddresses(prev => {
      const next = [...prev];
      if (next[addrIdx].shippingSelections.length > 1) {
        next[addrIdx].shippingSelections.splice(selIdx, 1);
      }
      return next;
    });
  };
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const updateQuantity = (id: string, delta: number) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p
    ));
  };

  const removeItem = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleSelect = (id: string) => {
    setSelectedProducts(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      const all: Record<string, boolean> = {};
      products.forEach(p => all[p.id] = true);
      setSelectedProducts(all);
    } else {
      setSelectedProducts({});
    }
  };

  const calculateSubtotal = () => {
    return products.reduce((acc, p) => acc + (p.unitPrice * p.quantity), 0);
  };

  useEffect(() => {
    const totalShipping = shippingAddresses.reduce((acc, addr) => {
      const addrTotal = addr.shippingSelections.reduce((selAcc, sel) => {
        const method = SHIPPING_METHODS.find(m => m.id === sel.methodId);
        return selAcc + (method?.price || 0);
      }, 0);
      return acc + addrTotal;
    }, 0);

    onUpdateOrder({ 
      subtotal: calculateSubtotal(),
      totalItems: products.length,
      shipping: totalShipping
    });
  }, [products, shippingAddresses]);

  const isAllSelected = products.length > 0 && products.every(p => selectedProducts[p.id]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const totalFilteredCount = filteredProducts.length;
  const totalPages = Math.ceil(totalFilteredCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalFilteredCount);
  const currentItems = filteredProducts.slice(startIndex, endIndex);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const PaginationControls = ({ position }: { position: 'top' | 'bottom' }) => (
    <div className={`flex items-center gap-6 ${position === 'bottom' ? 'py-8 border-t border-neutral-100 mt-4' : ''}`}>
      <div className="flex items-center">
        <span className="text-[13px] text-neutral-500 font-medium">
          {totalFilteredCount > 0 ? `${startIndex + 1}–${endIndex}` : '0'} of {totalFilteredCount}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button 
          onClick={prevPage}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-400 disabled:opacity-20 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>
        <button 
          onClick={nextPage}
          disabled={currentPage === totalPages || totalPages === 0}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-400 disabled:opacity-20 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>
      </div>
    </div>
  );

  const renderDetailedProductList = () => (
    <div className="flex flex-col pb-[80px]">
      <div className="flex items-center gap-4 py-4 px-2 border-b border-neutral-100 sticky top-0 bg-white z-[20]">
        <div className="flex items-center">
          <GoogleCheckbox 
            checked={isAllSelected}
            onChange={(checked) => toggleSelectAll(checked)}
            themeColor={settings.themeColor}
          />
          <span className="material-symbols-outlined text-neutral-400 text-[20px] cursor-pointer -ml-1">arrow_drop_down</span>
        </div>
        <span className="text-[14px] text-neutral-500 font-medium tracking-[-1%]">
          {Object.keys(selectedProducts).length} items selected - ${calculateSubtotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      </div>

      <div className="flex flex-col">
        {currentItems.map((product) => (
          <div 
            key={product.id} 
            className={`flex flex-col py-[12px] border-b border-neutral-100 transition-colors duration-200 ${selectedProducts[product.id] ? 'bg-[#F8F8F8]' : 'bg-transparent'}`}
          >
            <div className="flex gap-4 px-2">
              <div className="pt-0.5">
                <GoogleCheckbox 
                  checked={!!selectedProducts[product.id]}
                  onChange={() => toggleSelect(product.id)}
                  themeColor={settings.themeColor}
                />
              </div>
              
              {activeFeatures['Cart-Image'] && (
                <div className="w-[40px] h-[40px] rounded-lg overflow-hidden bg-neutral-50 shrink-0 border border-neutral-100 flex items-center justify-center">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex-1 flex flex-col gap-1 min-w-0">
                {activeFeatures['Cart-Name'] && (
                  <span className="text-[14px] font-medium text-neutral-900 leading-tight block pr-4">
                    {product.name}
                  </span>
                )}
                {activeFeatures['Cart-Variant'] && (
                  <span className="text-[14px] text-neutral-400 font-medium">
                    {product.sku}
                  </span>
                )}
              </div>

              <div className="flex items-start">
                {activeFeatures['Cart-Remove action'] && (
                  <button 
                    onClick={() => removeItem(product.id)}
                    className="w-10 h-10 flex items-center justify-center text-neutral-900 hover:text-red-600 hover:bg-neutral-100 rounded-full transition-all"
                  >
                    <span className="material-symbols-outlined text-[24px]">delete</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 px-2">
              <div className="pl-[36px]">
                {activeFeatures['Cart-Discount badge'] && (
                  <span className="inline-block px-3 py-1 rounded-full bg-[#EDFDF5] text-[#16A56F] text-[12px] font-medium">
                    {product.discountLabel}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-[20px]">
                {activeFeatures['Cart-Quantity selector'] && (
                  <div className="flex items-center justify-between gap-1 border border-neutral-200 rounded-full p-1 bg-white h-[44px] w-[130px]">
                    <button 
                      onClick={() => updateQuantity(product.id, -1)}
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-50 text-blue-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[24px]">remove</span>
                    </button>
                    <span className="text-[14px] font-medium w-6 text-center">{product.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(product.id, 1)}
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-50 text-blue-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[24px]">add</span>
                    </button>
                  </div>
                )}

                {activeFeatures['Cart-Prices'] && (
                  <div className="flex gap-4">
                    <div className="flex flex-col text-right">
                      <span className="text-[12px] text-neutral-400 font-medium">${product.originalUnitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} /un</span>
                      <span className="text-[14px] font-medium text-neutral-700">${product.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} /un</span>
                    </div>
                    <div className="flex flex-col text-right min-w-[80px]">
                      <span className="text-[12px] text-neutral-300 line-through font-medium">
                        ${(product.originalUnitPrice * product.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[14px] font-bold text-neutral-900">
                        ${(product.unitPrice * product.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const Breadcrumb = () => (
    <nav className="flex items-center gap-2">
      {currentSections.map((step, idx) => (
        <React.Fragment key={step.id}>
          <button 
            onClick={() => setCurrentStepIndex(idx)}
            className={`text-[13px] font-medium transition-colors whitespace-nowrap ${
              idx === currentStepIndex 
                ? 'text-neutral-900 font-bold underline underline-offset-8 decoration-2' 
                : idx < currentStepIndex 
                  ? 'text-neutral-900 cursor-pointer' 
                  : 'text-neutral-400 cursor-default'
            }`}
            style={{ textDecorationColor: idx === currentStepIndex ? settings.themeColor : 'transparent' }}
          >
            {step.title}
          </button>
          {idx < currentSections.length - 1 && (
            <span className="material-symbols-outlined text-[16px] text-neutral-300">chevron_right</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );

  const isMultiStep = settings.layout === 'multi-step';

  const handleContinue = () => {
    if (currentStepIndex < currentSections.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      const scrollContainer = document.querySelector('main');
      if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isAddressFilled = (address: Address) => {
    return address.street.length > 3 && address.city.length > 2;
  };

  const renderFooter = () => (
    <div className="mt-[60px] animate-in fade-in duration-500">
      <footer className="flex flex-col pb-[80px]">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {['Refund policy', 'Privacy policy', 'Terms of service'].map((link) => (
            <button key={link} className="text-[12px] text-neutral-400 hover:text-neutral-700 font-medium transition-colors underline-offset-4 hover:underline">
              {link}
            </button>
          ))}
        </div>
        <p className="mt-[20px] text-[12px] text-neutral-400 leading-relaxed font-normal tracking-[-0.5%]">
          By placing this order, you agree to our <span className="text-neutral-500 font-medium cursor-pointer hover:underline">Terms of Service</span> and understand our <span className="text-neutral-500 font-medium cursor-pointer hover:underline">Privacy Policy</span>.
        </p>
      </footer>
    </div>
  );

  const renderActionButton = (isLast: boolean) => (
    <div className="mt-[60px] flex flex-col gap-6">
      {isLast ? (
        <div className="flex flex-col gap-6 w-full">
          <div className="flex gap-[20px] w-full">
            {activeFeatures['Actions-Request Quote'] && (
              <button 
                className="flex-1 h-[48px] rounded-full border border-neutral-200 bg-white text-neutral-600 font-semibold text-[14px] tracking-[-1%] transition-all duration-300 hover:bg-neutral-50 hover:border-neutral-300 active:scale-[0.98] focus:outline-none shadow-sm"
              >
                Request quote
              </button>
            )}
            {activeFeatures['Actions-Place order'] && (
              <button 
                className="flex-1 h-[48px] rounded-full text-white font-semibold text-[14px] tracking-[-1%] transition-all duration-300 hover:opacity-90 hover:scale-[1.01] active:scale-[0.98] focus:outline-none shadow-md"
                style={{ backgroundColor: settings.themeColor }}
              >
                Place order
              </button>
            )}
          </div>
        </div>
      ) : (
        <button 
          onClick={handleContinue}
          className="w-full h-[48px] rounded-full text-white font-semibold text-[14px] tracking-[-1%] transition-all duration-300 hover:opacity-90 hover:scale-[1.01] active:scale-[0.98] focus:outline-none shadow-sm"
          style={{ backgroundColor: settings.themeColor }}
        >
          Continue
        </button>
      )}
    </div>
  );

  const ActionMenu = () => {
    const actions = [
      { id: 'Actions-Import file', icon: 'upload_file' },
      { id: 'Actions-Share order', icon: 'share' },
      { id: 'Actions-Print order', icon: 'print' },
      { id: 'Actions-Save order', icon: 'save' }
    ].filter(a => !!activeFeatures[a.id]);

    if (actions.length === 0) return null;

    return (
      <div className="flex items-center gap-1">
        {actions.map(action => (
          <button 
            key={action.id}
            className="w-10 h-10 flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">{action.icon}</span>
          </button>
        ))}
      </div>
    );
  };

  const showAdditionalDataSection = activeFeatures['Additional data-Accounting fields-Order level'] || activeFeatures['Additional data-Comments-Order level'];

  return (
    <div className={`px-[80px] pt-[80px] w-full h-full bg-white relative transition-all duration-500 ease-in-out`}>
      {isSidebarCollapsed && (
        <button 
          onClick={onExpandSidebar}
          className="fixed top-10 left-10 w-[48px] h-[48px] bg-black text-white rounded-full flex items-center justify-center shadow-2xl z-[100] hover:scale-105 transition-transform"
        >
          <span className="material-symbols-outlined text-[20px]">tune</span>
        </button>
      )}
      
      <div className="max-w-[600px] mx-auto w-full text-left flex flex-col relative">
        <header className="flex items-center justify-between mb-[60px] transition-all duration-500">
          <h2 
            className="text-[26px] font-bold leading-none animate-in fade-in slide-in-from-left-4 duration-700"
            style={{ color: '#0366DD', fontFamily: 'Inter', letterSpacing: '-0.03em' }}
          >
            {settings.storeName}
          </h2>
          <ActionMenu />
        </header>

        {isMultiStep && (
          <div className={`transition-all duration-500 ease-in-out opacity-100 translate-y-0 mb-[60px]`}>
            <Breadcrumb />
          </div>
        )}

        <div className={`transition-all duration-500 ease-in-out ${isMultiStep ? 'overflow-hidden -mx-4 px-4' : ''}`}>
          <div 
            className={`flex transition-transform duration-500 ease-in-out ${isMultiStep ? 'flex-row' : 'flex-col gap-[60px]'}`}
            style={isMultiStep ? { transform: `translateX(-${currentStepIndex * 100}%)`, width: '100%' } : {}}
          >
            {currentSections.map((section, idx) => {
              const isLastStep = idx === currentSections.length - 1;
              
              return (
                <div 
                  key={section.id} 
                  className={`shrink-0 w-full transition-opacity duration-500 ${isMultiStep ? (idx === currentStepIndex ? 'opacity-100' : 'opacity-0 pointer-events-none') : 'opacity-100'}`}
                >
                  <section className={`flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out`}>
                    <div className="w-full flex items-center justify-between group">
                      <div className="flex-1">
                        <h3 
                          className="text-[22px] font-bold text-neutral-900 leading-none m-0 p-0"
                          style={{ letterSpacing: '-0.03em', fontFamily: 'Inter' }}
                        >
                          {section.title}
                        </h3>
                      </div>
                      
                      {section.id === 'customer' && settings.customerStatus === 'logged-out' && activeFeatures['Customer-Sign in button'] && (
                        <div className="flex items-center">
                          <span className="text-[14px] font-medium text-neutral-600 mr-2">Already have an account?</span>
                          <button className="text-[14px] font-bold transition-opacity hover:opacity-70" style={{ color: settings.themeColor }}>
                            Sign in
                          </button>
                        </div>
                      )}
                    </div>

                    {section.id === 'payment' && (
                      <p className="text-[14px] text-neutral-500 font-normal mt-4">
                        All transactions are secure and encrypted.
                      </p>
                    )}
                    
                    <div className="mt-6 flex flex-col gap-[40px]">
                      {section.id === 'customer' && (
                        <>
                          <div className="border border-neutral-200 rounded-[8px] bg-white shadow-sm transition-all duration-300">
                            <div className="p-6 flex flex-col gap-[12px]">
                              {settings.customerStatus === 'logged-out' ? (
                                <>
                                  <div className="flex flex-col gap-[12px]">
                                    {activeFeatures['Customer-Email'] && (
                                      <div className="flex flex-col gap-[12px]">
                                        <FloatingInput 
                                          label="Email"
                                          type="email"
                                          value={email}
                                          onChange={setEmail}
                                          themeColor={settings.themeColor}
                                        />
                                        <div className="flex flex-col gap-[12px]">
                                          {activeFeatures['Customer-Full name'] && (
                                            <FloatingInput 
                                              label="Full name (optional)"
                                              value={fullName}
                                              onChange={setFullName}
                                              themeColor={settings.themeColor}
                                            />
                                          )}
                                          {activeFeatures['Customer-Phone number'] && (
                                            <FloatingInput 
                                              label="Phone (optional)"
                                              type="tel"
                                              value={phone}
                                              onChange={setPhone}
                                              themeColor={settings.themeColor}
                                            />
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  {activeFeatures['Customer-News checkbox'] && (
                                    <div className="pt-1">
                                      <GoogleCheckbox 
                                        label="Email me with news and offers"
                                        checked={newsChecked}
                                        onChange={(checked) => setNewsChecked(checked)}
                                        themeColor={settings.themeColor}
                                      />
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="flex flex-col animate-in fade-in duration-500">
                                  <div className="flex items-start justify-between mb-4">
                                    {activeFeatures['Customer-Contract'] && (
                                      <div className="w-[48px] h-[48px] bg-black rounded-full flex items-center justify-center shrink-0">
                                        <span className="text-white font-bold text-[18px]">
                                          {settings.selectedTemplate === 'Individual' ? 'K' : 'S'}
                                        </span>
                                      </div>
                                    )}
                                    {activeFeatures['Customer-Contract switcher'] && (
                                      <button 
                                        className="text-[14px] font-medium transition-opacity hover:opacity-70 whitespace-nowrap font-inter"
                                        style={{ color: settings.themeColor }}
                                      >
                                        Switch
                                      </button>
                                    )}
                                  </div>
                                  <div className="flex flex-col">
                                    {activeFeatures['Customer-Contract'] && (
                                      <h4 className="text-[20px] font-semibold text-neutral-900 tracking-[-0.04em] leading-tight mb-4">
                                        {settings.selectedTemplate === 'Individual' ? 'Kelly Davis' : 'Stellar Global'}
                                      </h4>
                                    )}
                                    <div className="flex flex-col gap-[6px]">
                                      {activeFeatures['Customer-Username'] && (
                                        <span className="text-[14px] font-bold text-neutral-900 leading-tight">kdavis</span>
                                      )}
                                      {activeFeatures['Customer-Organizational unit'] && (
                                        <span className="text-[14px] font-normal text-neutral-900 leading-tight">Operations and facilities</span>
                                      )}
                                      {activeFeatures['Customer-Full name'] && (
                                        <span className="text-[14px] font-normal text-neutral-900 leading-tight">Kelly Davis</span>
                                      )}
                                      {activeFeatures['Customer-Email'] && (
                                        <span className="text-[14px] font-normal text-neutral-900 leading-tight">
                                          {settings.selectedTemplate === 'Individual' ? 'kdavis@individual.com' : 'kdavis@stellar.com'}
                                        </span>
                                      )}
                                      {activeFeatures['Customer-Phone'] && (
                                        <span className="text-[14px] font-normal text-neutral-900 leading-tight">+1 (617) 234-5678</span>
                                      )}
                                      {activeFeatures['Customer-Roles'] && (
                                        <div className="text-[14px] font-normal text-neutral-900 leading-tight flex items-center gap-1">
                                          <span>
                                            {CUSTOMER_ROLES.length > 3 
                                              ? `${CUSTOMER_ROLES[0]}, ${CUSTOMER_ROLES[1]}, ` 
                                              : CUSTOMER_ROLES.join(', ')
                                            }
                                          </span>
                                          {CUSTOMER_ROLES.length > 3 && (
                                            <div className="relative group flex items-center">
                                              <button className="font-bold hover:underline cursor-pointer" style={{ color: settings.themeColor }}>
                                                +{CUSTOMER_ROLES.length - 2}
                                              </button>
                                              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-[100] scale-95 group-hover:scale-100">
                                                <div className="bg-[#1a1a1a] text-white text-[12px] py-4 px-5 rounded-[12px] shadow-2xl whitespace-nowrap flex flex-col gap-2.5 border border-white/10">
                                                  {CUSTOMER_ROLES.map(role => (
                                                    <span key={role} className="flex items-center gap-2">
                                                      <div className="w-1 h-1 rounded-full bg-white/40"></div>
                                                      {role}
                                                    </span>
                                                  ))}
                                                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#1a1a1a]"></div>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {showAdditionalDataSection && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                              <div className="border border-neutral-200 rounded-[8px] bg-white shadow-sm flex flex-col transition-all duration-300 overflow-hidden">
                                <div className={`p-6 ${!isAdditionalDataCollapsed ? 'border-b border-neutral-100' : ''}`}>
                                  <SectionHeader 
                                    title="Additional data" 
                                    onCollapse={() => setIsAdditionalDataCollapsed(!isAdditionalDataCollapsed)}
                                    isCollapsed={isAdditionalDataCollapsed}
                                  />
                                  {!isAdditionalDataCollapsed && (
                                    <div className="flex flex-col gap-6 mt-6 animate-in slide-in-from-top-2 duration-300">
                                      {activeFeatures['Additional data-Accounting fields-Order level'] && (
                                        <div className="flex flex-col gap-4">
                                          <h5 className="text-[14px] font-semibold text-neutral-900 tracking-tight">Accounting fields</h5>
                                          <div className="flex flex-col gap-4">
                                            <FloatingInput 
                                              label="PO number" 
                                              value={poNumber} 
                                              onChange={setPoNumber} 
                                              themeColor={settings.themeColor} 
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                              <FloatingInput 
                                                label="Cost center" 
                                                value={costCenter} 
                                                onChange={setCostCenter} 
                                                themeColor={settings.themeColor} 
                                              />
                                              <FloatingInput 
                                                label="Department" 
                                                value={department} 
                                                onChange={setDepartment} 
                                                themeColor={settings.themeColor} 
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {activeFeatures['Additional data-Accounting fields-Order level'] && activeFeatures['Additional data-Comments-Order level'] && (
                                        <div className="h-[1px] w-full bg-neutral-100" />
                                      )}

                                      {activeFeatures['Additional data-Comments-Order level'] && (
                                        <div className="flex flex-col gap-4">
                                          {!showCommentField ? (
                                            <button 
                                              onClick={() => setShowCommentField(true)}
                                              className="flex items-center gap-2 text-[14px] font-semibold transition-all hover:opacity-70"
                                              style={{ color: settings.themeColor }}
                                            >
                                              <span className="material-symbols-outlined text-[20px]">add_comment</span>
                                              Add comment
                                            </button>
                                          ) : (
                                            <div className="animate-in fade-in slide-in-from-top-2 duration-500 flex flex-col gap-4">
                                              <div className="flex items-center justify-between">
                                                <h5 className="text-[14px] font-semibold text-neutral-900 tracking-tight">Comments</h5>
                                                <button 
                                                  onClick={() => {
                                                    setShowCommentField(false);
                                                    setOrderComment('');
                                                  }}
                                                  className="flex items-center gap-1.5 text-[12px] font-medium text-neutral-400 hover:text-red-500 transition-colors"
                                                >
                                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                                  Remove
                                                </button>
                                              </div>
                                              <FloatingTextArea 
                                                label="Order comments" 
                                                value={orderComment} 
                                                onChange={setOrderComment} 
                                                themeColor={settings.themeColor} 
                                                maxLength={300}
                                              />
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {section.id === 'delivery' && (
                        <div className="flex flex-col gap-8">
                          <div className="flex flex-col gap-6">
                            {shippingAddresses.map((address, aIdx) => {
                              const isCollapsed = collapsedAddresses.has(address.id);
                              const isLoggedOut = settings.customerStatus === 'logged-out';

                              return (
                                <div 
                                  key={address.id} 
                                  className={`border border-neutral-200 rounded-[8px] bg-white shadow-sm transition-all duration-300 flex flex-col ${activeDropdownId && activeDropdownId.startsWith(`addr-${address.id}`) ? 'z-50 relative' : 'z-10'}`}
                                >
                                  {activeFeatures['Delivery-Shipping address'] && (
                                    <div className={`p-6 ${!isCollapsed ? 'border-b border-neutral-100' : ''}`}>
                                      <SectionHeader 
                                        title={`Shipping address${shippingAddresses.length > 1 ? ` ${aIdx + 1}` : ''}`}
                                        onCollapse={() => toggleAddressCollapse(address.id)}
                                        isCollapsed={isCollapsed}
                                        extra={aIdx > 0 && settings.multiShippingAddress && (
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); removeShippingAddress(aIdx); }}
                                            className="w-10 h-10 flex items-center justify-center text-[#1F1F1F] hover:text-red-500 hover:bg-neutral-50 rounded-full transition-all"
                                          >
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                          </button>
                                        )}
                                      />
                                      {!isCollapsed && (
                                        <div className="mt-6 animate-in slide-in-from-top-2 duration-300">
                                          {isLoggedOut ? (
                                            <div className="flex flex-col gap-4">
                                              <FloatingSelect 
                                                label="Country"
                                                value={address.country}
                                                onChange={(val) => updateShippingAddress(aIdx, 'country', val)}
                                                options={COUNTRIES.map(c => ({ value: c.code, label: c.name }))}
                                                themeColor={settings.themeColor}
                                              />
                                              <FloatingInput 
                                                label="Street address"
                                                value={address.street}
                                                onChange={(val) => updateShippingAddress(aIdx, 'street', val)}
                                                themeColor={settings.themeColor}
                                              />
                                              <FloatingInput 
                                                label="Apt, suite, building (optional)"
                                                value={address.apt}
                                                onChange={(val) => updateShippingAddress(aIdx, 'apt', val)}
                                                themeColor={settings.themeColor}
                                              />
                                              <div className="grid grid-cols-2 gap-4">
                                                <FloatingInput label="City" value={address.city} onChange={(val) => updateShippingAddress(aIdx, 'city', val)} themeColor={settings.themeColor} />
                                                <FloatingSelect label="State" value={address.state} onChange={(val) => updateShippingAddress(aIdx, 'state', val)} options={STATES.map(s => ({ value: s, label: s }))} themeColor={settings.themeColor} />
                                              </div>
                                              <FloatingInput label="Zip code" value={address.zip} onChange={(val) => updateShippingAddress(aIdx, 'zip', val)} themeColor={settings.themeColor} />
                                            </div>
                                          ) : (
                                            <div className="flex items-start justify-between">
                                              <div className="flex flex-col gap-0.5">
                                                <p className="text-[14px] font-medium text-neutral-900 leading-tight">11E 44th 13th floor</p>
                                                <p className="text-[14px] font-medium text-neutral-900 leading-tight">New York, NY</p>
                                                <p className="text-[14px] font-medium text-neutral-900 leading-tight">United States</p>
                                              </div>
                                              <button 
                                                className="text-[14px] font-bold transition-opacity hover:opacity-70 whitespace-nowrap"
                                                style={{ color: settings.themeColor }}
                                              >
                                                Change
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {!isCollapsed && activeFeatures['Delivery-Shipping method'] && (
                                    <div className="p-6 bg-neutral-50/10 animate-in slide-in-from-top-2 duration-300">
                                      <SectionHeader title="Shipping method" titleStyle={{ fontSize: '14px' }} />
                                      <div className="mt-4 flex flex-col gap-4">
                                        {(isAddressFilled(address) || !isLoggedOut) ? (
                                          <>
                                            {address.shippingSelections.map((sel, sIdx) => {
                                              const otherSelectedMethodIds = address.shippingSelections.filter((_, idx) => idx !== sIdx).map(s => s.methodId);
                                              const filteredMethods = SHIPPING_METHODS.filter(m => !otherSelectedMethodIds.includes(m.id));
                                              return (
                                                <ShippingMethodSelect 
                                                  key={sel.id}
                                                  value={sel.methodId}
                                                  onChange={(methodId) => updateShippingMethodInAddress(aIdx, sIdx, methodId)}
                                                  itemCount={sel.itemCount}
                                                  themeColor={settings.themeColor}
                                                  onOpenDrawer={onOpenDrawer}
                                                  onRemove={address.shippingSelections.length > 1 && settings.multiShippingMethod ? () => removeShippingMethodFromAddress(aIdx, sIdx) : undefined}
                                                  onToggleOpen={(isOpen) => setActiveDropdownId(isOpen ? `addr-${address.id}-sel-${sel.id}` : null)}
                                                  availableMethods={filteredMethods}
                                                />
                                              );
                                            })}
                                            {settings.multiShippingMethod && address.shippingSelections.length < SHIPPING_METHODS.length && (
                                              <button 
                                                onClick={() => addShippingMethodToAddress(aIdx)}
                                                className="text-[14px] font-medium transition-opacity hover:opacity-70 whitespace-nowrap font-inter mt-1 w-fit"
                                                style={{ color: settings.themeColor }}
                                              >
                                                Add shipping method
                                              </button>
                                            )}
                                          </>
                                        ) : (
                                          <div className="w-full bg-[#F5F5F5] rounded-[8px] py-[24px] px-4 flex items-center justify-center border border-dashed border-neutral-200">
                                            <p className="text-[13px] text-neutral-400 font-normal tracking-[-1%] text-center max-w-[240px]">
                                              Enter your address above to see shipping options for this destination.
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          {settings.multiShippingAddress && (
                            <div className="flex justify-center -mt-2">
                              <button onClick={addShippingAddress} className="flex items-center gap-2 px-6 py-3 rounded-full border border-neutral-200 text-[14px] font-semibold text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-all shadow-sm">
                                <span className="material-symbols-outlined text-[20px]">add</span>
                                Add another shipping address
                              </button>
                            </div>
                          )}
                          {activeFeatures['Delivery-Returns'] && (
                            <div className="mt-4">
                              <SectionHeader title="Returns" />
                              <div onClick={() => handleToggleReturns(!(orderDetails.returnsProtection > 0))} className={`w-full border rounded-[8px] mt-4 px-8 py-6 flex items-center justify-between group cursor-pointer transition-colors shadow-sm bg-white ${orderDetails.returnsProtection > 0 ? 'border-neutral-300' : 'border-neutral-200 hover:border-neutral-300'}`}>
                                <div className="flex items-center gap-8 flex-1">
                                  <div className="shrink-0"><GoogleCheckbox checked={orderDetails.returnsProtection > 0} onChange={(checked) => handleToggleReturns(checked)} themeColor={settings.themeColor} /></div>
                                  <div className="flex flex-col gap-0.5 min-w-0">
                                    <h4 className="text-[14px] font-medium text-neutral-900 leading-none">Returns protection</h4>
                                    <p className="text-[12px] text-neutral-400 font-normal">Buy returns protection now, and you’ll qualify for free returns. Does not apply to final sale items.</p>
                                  </div>
                                </div>
                                <div className="shrink-0 ml-4"><span className="text-[14px] font-bold text-neutral-900">$3.00</span></div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {section.id === 'payment' && (
                        <div className="flex flex-col">
                          <div className="border border-neutral-200 rounded-[8px] bg-white overflow-hidden transition-all duration-500 shadow-sm">
                            {availablePaymentMethods.map((method, idx) => {
                              const isSelected = selectedPaymentMethod === method.id;
                              const isWallet = ['Shop Pay', 'PayPal', 'Afterpay'].some(wallet => method.id.includes(wallet));
                              return (
                                <React.Fragment key={method.id}>
                                  <div onClick={() => setSelectedPaymentMethod(method.id)} className={`flex items-center gap-4 px-4 h-[56px] cursor-pointer transition-all duration-300 ${isSelected ? 'bg-blue-50/20' : 'hover:bg-neutral-50'} ${idx !== availablePaymentMethods.length - 1 && !isSelected ? 'border-b border-neutral-100' : ''}`}>
                                    <div className={`w-[20px] h-[20px] rounded-full border flex items-center justify-center transition-all duration-300 ${isSelected ? 'border-transparent' : 'border-neutral-300'}`} style={{ backgroundColor: isSelected ? settings.themeColor : 'transparent' }}>
                                      {isSelected && <div className="w-[8px] h-[8px] bg-white rounded-full transition-transform animate-in zoom-in duration-300" />}
                                    </div>
                                    <span className={`text-[14px] font-medium tracking-[-1%] transition-colors duration-300 ${isSelected ? 'text-neutral-900' : 'text-neutral-600'}`}>{method.label}</span>
                                  </div>
                                  {isSelected && (
                                    <div className="border-b border-neutral-100 overflow-hidden transition-all duration-500 animate-in fade-in slide-in-from-top-2">
                                      {method.id === 'Credit card' ? (
                                        <div className="px-4 pb-6 pt-2 bg-neutral-50/40">
                                          <div className="flex flex-col gap-4 mt-2">
                                            <FloatingInput label="Card number" value={cardNumber} onChange={setCardNumber} themeColor={settings.themeColor} rightIcon="lock" />
                                            <div className="grid grid-cols-2 gap-4">
                                              <FloatingInput label="Expiration date (MM/YY)" value={expiryDate} onChange={setExpiryDate} themeColor={settings.themeColor} />
                                              <FloatingInput label="Security code" value={securityCode} onChange={setSecurityCode} themeColor={settings.themeColor} rightIcon="help" />
                                            </div>
                                            <FloatingInput label="Name on card" value={nameOnCard} onChange={setNameOnCard} themeColor={settings.themeColor} />
                                          </div>
                                          {activeFeatures['Payment-Billing address'] && (
                                            <div className="mt-10">
                                              <SectionHeader title="Billing address" titleStyle={{ fontSize: '14px' }} />
                                              {activeFeatures['Payment-Use shipping address'] && (
                                                <div className="mt-2 mb-4">
                                                  <GoogleCheckbox label="Use shipping address as billing address" checked={useShippingForBilling} onChange={(checked) => setUseShippingForBilling(checked)} themeColor={settings.themeColor} />
                                                </div>
                                              )}
                                              <div className={`grid transition-all duration-500 ease-in-out ${useShippingForBilling ? 'grid-rows-[0fr] opacity-0 pointer-events-none' : 'grid-rows-[1fr] opacity-100'}`}>
                                                <div className="overflow-hidden">
                                                  <div className="flex flex-col gap-4 py-2">
                                                    <FloatingSelect label="Country" value={selectedBillingCountry} onChange={setSelectedBillingCountry} options={COUNTRIES.map(c => ({ value: c.code, label: c.name }))} themeColor={settings.themeColor} />
                                                    <FloatingInput label="Street address" value={billingAddressFields.street} onChange={(val) => setBillingAddressFields(prev => ({ ...prev, street: val }))} themeColor={settings.themeColor} />
                                                    <FloatingInput label="Apt, suite, building (optional)" value={billingAddressFields.apt} onChange={(val) => setBillingAddressFields(prev => ({ ...prev, apt: val }))} themeColor={settings.themeColor} />
                                                    <div className="grid grid-cols-2 gap-4">
                                                      <FloatingInput label="City" value={billingAddressFields.city} onChange={(val) => setBillingAddressFields(prev => ({ ...prev, city: val }))} themeColor={settings.themeColor} />
                                                      <FloatingSelect label="State" value={selectedBillingState} onChange={setSelectedBillingState} options={STATES.map(s => ({ value: s, label: s }))} themeColor={settings.themeColor} />
                                                    </div>
                                                    <FloatingInput label="Zip code" value={billingAddressFields.zip} onChange={(val) => setBillingAddressFields(prev => ({ ...prev, zip: val }))} themeColor={settings.themeColor} />
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ) : method.id === 'Account billing' ? (
                                        <div className="p-4 bg-neutral-50/40">
                                          <div className="flex flex-col gap-4 mt-2">
                                            <p className="text-[14px] text-neutral-600 font-inter mb-2">Pay using your available credit line or pre-approved billing account.</p>
                                            <FloatingInput label="Purchase Order Reference" value={poNumber} onChange={setPoNumber} themeColor={settings.themeColor} />
                                          </div>
                                        </div>
                                      ) : method.id === 'Pix' ? (
                                        <div className="p-6 bg-neutral-50/40 flex flex-col items-center text-center gap-4">
                                          <div className="w-[160px] h-[160px] bg-white border border-neutral-200 rounded-[12px] p-2 flex items-center justify-center shadow-inner">
                                            <img 
                                              src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ComposableCheckoutPixPayment" 
                                              alt="Pix QR Code" 
                                              className="w-full h-full grayscale opacity-40"
                                            />
                                          </div>
                                          <div className="flex flex-col gap-1">
                                            <p className="text-[14px] font-bold text-neutral-900">Finalize via Pix</p>
                                            <p className="text-[12px] text-neutral-500 leading-relaxed max-w-[280px]">
                                              The QR code will be generated after you place the order. You will have 30 minutes to pay.
                                            </p>
                                          </div>
                                          <button 
                                            className="text-[13px] font-semibold flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 transition-all shadow-sm"
                                            style={{ color: settings.themeColor }}
                                          >
                                            <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                            Copy Pix Key
                                          </button>
                                        </div>
                                      ) : method.id === 'Google Pay' ? (
                                        <div className="p-6 bg-white flex flex-col items-center gap-4">
                                          <button className="w-full h-[48px] bg-black text-white rounded-[4px] flex items-center justify-center gap-2 hover:bg-neutral-900 transition-all font-inter font-medium">
                                            <img 
                                              src="https://www.gstatic.com/instantbuy/svg/dark_gpay.svg" 
                                              alt="Google Pay" 
                                              className="h-[20px]"
                                            />
                                            Pay
                                          </button>
                                          <p className="text-[12px] text-neutral-400 font-inter">Quick and secure payment with your Google account.</p>
                                        </div>
                                      ) : isWallet ? (
                                        <div className="p-4 bg-white">
                                           <div className="bg-[#F5F5F5] rounded-[4px] px-6 py-8 flex flex-col items-center justify-center text-center gap-2">
                                              <span className="material-symbols-outlined text-neutral-400 text-[24px] mb-1">payments</span>
                                              <p className="text-[14px] text-neutral-700 font-normal tracking-[-1%] leading-relaxed max-w-[320px] font-inter">After clicking “Place order”, you will be redirected to {method.id.split(' •')[0]} to complete your purchase securely.</p>
                                           </div>
                                        </div>
                                      ) : null}
                                    </div>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    {isMultiStep && (
                      <div className={`flex flex-col ${section.id === 'delivery' ? 'pb-[80px]' : ''}`}>
                        {renderActionButton(isLastStep)}
                        {isLastStep && renderFooter()}
                      </div>
                    )}
                  </section>
                </div>
              );
            })}
          </div>
        </div>
        {!isMultiStep && (
          <div className="flex flex-col">
            {renderActionButton(true)}
            {renderFooter()}
          </div>
        )}
      </div>

      {isDrawerOpen && <div className="fixed inset-0 bg-black/40 z-[60] transition-opacity animate-in fade-in duration-300" onClick={onCloseDrawer} />}
      <div className={`fixed top-0 right-0 h-full bg-white z-[70] shadow-2xl transition-transform duration-300 ease-in-out transform ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ width: '66.666667%' }}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between pl-[60px] pr-[20px] h-[68px] border-b border-neutral-100 shrink-0 bg-white">
            <h3 className="text-[20px] font-semibold text-neutral-900 tracking-tight">{drawerTitle}</h3>
            <div className="flex items-center gap-4">
              <span className="text-[14px] font-medium text-neutral-900">Subtotal: <span className="font-bold">${calculateSubtotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></span>
              <button onClick={onCloseDrawer} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"><span className="material-symbols-outlined text-neutral-500">close</span></button>
            </div>
          </div>
          <div className="flex items-center justify-between py-4 px-[60px] border-b border-neutral-100 shrink-0 bg-white z-[30]">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-[400px]">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-[20px]">search</span>
                <input type="text" placeholder="Search items" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="w-full h-[40px] pl-10 pr-4 bg-neutral-100 border-transparent rounded-full text-[14px] focus:bg-white focus:border-neutral-200 focus:outline-none transition-all" />
              </div>
            </div>
            <PaginationControls position="top" />
          </div>
          <div className="flex-1 overflow-y-auto px-[60px] py-0 scrollbar-hide">{renderDetailedProductList()}</div>
          <div className="px-[60px] py-5 border-t border-neutral-100 bg-[#FFF] flex justify-end gap-4 shrink-0">
            <button onClick={onCloseDrawer} className="px-6 h-[44px] rounded-full border border-neutral-200 text-[14px] font-semibold text-neutral-600 hover:bg-neutral-50 transition-all">Cancel</button>
            <button onClick={onCloseDrawer} className="px-6 h-[44px] rounded-full text-white text-[14px] font-semibold transition-all hover:opacity-90" style={{ backgroundColor: settings.themeColor }}>Save changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
