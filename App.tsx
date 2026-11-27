
import React, { useState, useCallback, useEffect, useRef } from 'react';
import SidebarSettings from './components/SidebarSettings.tsx';
import CheckoutForm from './components/CheckoutForm.tsx';
import OrderSummary from './components/OrderSummary.tsx';
import { OrderDetails, CheckoutSettings, ActiveFeatures } from './types.ts';

interface TemplateConfig {
  settings: Partial<CheckoutSettings>;
  features: Partial<ActiveFeatures>;
}

const MERCHANT_TEMPLATES: Record<string, TemplateConfig> = {
  'Individual': {
    settings: { layout: 'single-step', customerStatus: 'logged-out', multiShippingAddress: false, multiShippingMethod: false, showTaxes: true },
    features: {
      'Customer-Sign in button': true, 'Customer-Email': true, 'Customer-Full name': true, 'Customer-Phone number': true, 'Customer-News checkbox': true,
      'Customer-Contract': false, 'Customer-Contract switcher': false, 'Customer-Organizational unit': false, 'Customer-Username': false, 'Customer-Roles': false,
      'Cart-Image': true, 'Cart-Name': true, 'Cart-Variant': true, 'Cart-Discount badge': true, 'Cart-Quantity selector': true, 'Cart-Remove action': true, 'Cart-Prices': true,
      'Delivery-Shipping address': true, 'Delivery-Shipping method': true, 'Delivery-Returns': true,
      'Payment-Credit card': true, 'Payment-Account billing': false, 'Payment-Shop Pay': true, 'Payment-Paypal': true, 'Payment-Pix': true, 'Payment-Google Pay': true, 'Payment-Afterpay': true, 'Payment-Billing address': true, 'Payment-Use shipping address': true,
      'Additional data-Accounting fields-Order level': false, 'Additional data-Accounting fields-Item level': false, 'Additional data-Comments-Order level': false, 'Additional data-Comments-Item level': false,
      'Actions-Place order': true, 'Actions-Request Quote': false, 'Actions-Import file': false, 'Actions-Share order': false, 'Actions-Print order': false, 'Actions-Save order': false,
      'Summary-Taxes': true, 'Summary-Budget': false
    }
  },
  'Organization': {
    settings: { layout: 'single-step', customerStatus: 'logged-in', multiShippingAddress: true, multiShippingMethod: true, showTaxes: true },
    features: {
      'Customer-Contract': true, 'Customer-Contract switcher': true, 'Customer-Organizational unit': true, 'Customer-Username': true, 'Customer-Email': true, 'Customer-Full name': true, 'Customer-Phone': true, 'Customer-Roles': true,
      'Cart-Image': true, 'Cart-Name': true, 'Cart-Variant': true, 'Cart-Discount badge': true, 'Cart-Quantity selector': true, 'Cart-Remove action': true, 'Cart-Prices': true,
      'Delivery-Shipping address': true, 'Delivery-Shipping method': true, 'Delivery-Returns': false,
      'Payment-Credit card': true, 'Payment-Account billing': true, 'Payment-Shop Pay': true, 'Payment-Paypal': true, 'Payment-Afterpay': true, 'Payment-Billing address': true, 'Payment-Use shipping address': true,
      'Additional data-Accounting fields-Order level': true, 'Additional data-Accounting fields-Item level': true, 'Additional data-Comments-Order level': true, 'Additional data-Comments-Item level': true,
      'Actions-Place order': true, 'Actions-Request Quote': true, 'Actions-Import file': true, 'Actions-Share order': true, 'Actions-Print order': true, 'Actions-Save order': true,
      'Summary-Taxes': true, 'Summary-Budget': true
    }
  },
  'JW Pepper': {
    settings: { layout: 'single-step', customerStatus: 'logged-in', multiShippingAddress: false, multiShippingMethod: true, showTaxes: true },
    features: {
      'Customer-Contract': true, 'Customer-Contract switcher': true, 'Customer-Organizational unit': true, 'Customer-Full name': true, 'Customer-Phone': true, 'Customer-Email': true,
      'Cart-Image': true, 'Cart-Name': true, 'Cart-Variant': true, 'Cart-Discount badge': true, 'Cart-Quantity selector': true, 'Cart-Remove action': true, 'Cart-Prices': true,
      'Delivery-Shipping address': true, 'Delivery-Shipping method': true,
      'Payment-Credit card': true, 'Payment-Account billing': true,
      'Additional data-Accounting fields-Order level': true, 'Additional data-Comments-Order level': true,
      'Actions-Place order': true, 'Actions-Request Quote': true, 'Actions-Save order': true,
      'Summary-Taxes': true
    }
  },
  'USESI': {
    settings: { layout: 'multi-step', customerStatus: 'logged-in', multiShippingAddress: false, multiShippingMethod: true, showTaxes: true },
    features: {
      'Customer-Contract': true, 'Customer-Contract switcher': true, 'Customer-Full name': true, 'Customer-Phone': true,
      'Cart-Image': true, 'Cart-Name': true, 'Cart-Variant': true, 'Cart-Discount badge': true, 'Cart-Quantity selector': true, 'Cart-Remove action': true, 'Cart-Prices': true,
      'Delivery-Shipping address': true, 'Delivery-Shipping method': true,
      'Payment-Account billing': true,
      'Additional data-Accounting fields-Order level': true, 'Additional data-Comments-Item level': true,
      'Actions-Place order': true, 'Actions-Request Quote': true, 'Actions-Save order': true,
      'Summary-Taxes': true
    }
  },
  'Helmet House': {
    settings: { layout: 'single-step', customerStatus: 'logged-in', multiShippingAddress: false, multiShippingMethod: false, showTaxes: true },
    features: {
      'Customer-Contract': true,
      'Cart-Image': true, 'Cart-Name': true, 'Cart-Quantity selector': true, 'Cart-Remove action': true, 'Cart-Prices': true,
      'Delivery-Shipping address': true, 'Delivery-Shipping method': true,
      'Payment-Credit card': true, 'Payment-Billing address': true,
      'Additional data-Accounting fields-Order level': true, 'Additional data-Comments-Order level': true,
      'Actions-Place order': true, 'Actions-Share order': true, 'Actions-Print order': true, 'Actions-Save order': true,
      'Summary-Taxes': true
    }
  },
  'Pierce': {
    settings: { layout: 'single-step', customerStatus: 'logged-in', multiShippingAddress: false, multiShippingMethod: false, showTaxes: true },
    features: {
      'Customer-Contract': true, 'Customer-Contract switcher': true, 'Customer-Full name': true,
      'Cart-Image': true, 'Cart-Name': true, 'Cart-Quantity selector': true, 'Cart-Remove action': true, 'Cart-Prices': true,
      'Delivery-Shipping address': true, 'Delivery-Shipping method': true,
      'Payment-Account billing': true,
      'Additional data-Comments-Item level': true,
      'Actions-Place order': true, 'Actions-Save order': true,
      'Summary-Taxes': true
    }
  },
  'SBD': {
    settings: { layout: 'single-step', customerStatus: 'logged-in', multiShippingAddress: false, multiShippingMethod: false, showTaxes: false },
    features: {
      'Customer-Contract': true,
      'Cart-Name': true, 'Cart-Quantity selector': true, 'Cart-Remove action': true, 'Cart-Prices': true,
      'Delivery-Shipping address': true,
      'Payment-Account billing': true,
      'Additional data-Accounting fields-Order level': true,
      'Actions-Place order': true,
      'Summary-Taxes': false
    }
  },
  'Electrolux BR': {
    settings: { layout: 'multi-step', customerStatus: 'logged-in', multiShippingAddress: false, multiShippingMethod: false, showTaxes: false },
    features: {
      'Customer-Contract': true,
      'Cart-Name': true, 'Cart-Quantity selector': true, 'Cart-Remove action': true, 'Cart-Prices': true,
      'Delivery-Shipping address': true, 'Delivery-Shipping method': true,
      'Payment-Pix': true, 'Payment-Credit card': true, 'Payment-Account billing': false,
      'Additional data-Accounting fields-Order level': false,
      'Actions-Place order': true,
      'Summary-Taxes': false
    }
  },
  'Kohler': {
    settings: { layout: 'single-step', customerStatus: 'logged-in', multiShippingAddress: false, multiShippingMethod: false, showTaxes: true },
    features: {
      'Customer-Contract': true, 'Customer-Contract switcher': true,
      'Cart-Image': true, 'Cart-Name': true, 'Cart-Variant': true, 'Cart-Discount badge': true, 'Cart-Quantity selector': true, 'Cart-Remove action': true, 'Cart-Prices': true,
      'Delivery-Shipping address': true, 'Delivery-Shipping method': true,
      'Payment-Account billing': true,
      'Additional data-Comments-Order level': true,
      'Actions-Place order': true, 'Actions-Request Quote': true, 'Actions-Import file': true, 'Actions-Save order': true,
      'Summary-Taxes': true
    }
  },
  'ODP': {
    settings: { layout: 'single-step', customerStatus: 'logged-in', multiShippingAddress: false, multiShippingMethod: true, showTaxes: true },
    features: {
      'Customer-Contract': true, 'Customer-Email': true, 'Customer-Full name': true, 'Customer-Phone': true,
      'Cart-Image': true, 'Cart-Name': true, 'Cart-Variant': true, 'Cart-Discount badge': true, 'Cart-Quantity selector': true, 'Cart-Remove action': true, 'Cart-Prices': true,
      'Delivery-Shipping address': true, 'Delivery-Shipping method': true,
      'Payment-Credit card': true, 'Payment-Account billing': true,
      'Additional data-Accounting fields-Order level': true, 'Additional data-Accounting fields-Item level': true, 'Additional data-Comments-Item level': true,
      'Actions-Place order': true, 'Actions-Share order': true, 'Actions-Print order': true, 'Actions-Save order': true,
      'Summary-Taxes': true, 'Summary-Budget': true
    }
  },
  'CAE': {
    settings: { layout: 'single-step', customerStatus: 'logged-in', multiShippingAddress: false, multiShippingMethod: false, showTaxes: false },
    features: {
      'Customer-Contract': true, 'Customer-Email': true,
      'Cart-Image': true, 'Cart-Name': true, 'Cart-Remove action': true, 'Cart-Prices': true,
      'Delivery-Shipping address': true,
      'Payment-Credit card': true, 'Payment-Account billing': true,
      'Actions-Place order': true,
      'Summary-Taxes': false
    }
  },
  'Amazon Business': {
    settings: { layout: 'multi-step', customerStatus: 'logged-in', multiShippingAddress: true, multiShippingMethod: true, showTaxes: true },
    features: {
      'Customer-Contract': true,
      'Cart-Image': true, 'Cart-Name': true, 'Cart-Variant': true, 'Cart-Discount badge': true, 'Cart-Quantity selector': true, 'Cart-Remove action': true, 'Cart-Prices': true,
      'Delivery-Shipping address': true, 'Delivery-Shipping method': true,
      'Payment-Credit card': true, 'Payment-Account billing': true, 'Payment-Billing address': true, 'Payment-Use shipping address': true,
      'Additional data-Accounting fields-Order level': true,
      'Actions-Place order': true, 'Actions-Share order': true, 'Actions-Save order': true,
      'Summary-Taxes': true
    }
  },
  'Pague Menos': {
    settings: { layout: 'single-step', customerStatus: 'logged-out', multiShippingAddress: false, multiShippingMethod: false, showTaxes: true },
    features: {
      'Customer-Sign in button': true, 'Customer-Email': true, 'Customer-Full name': true, 'Customer-Phone number': true, 'Customer-News checkbox': true,
      'Customer-Contract': false, 'Customer-Contract switcher': false, 'Customer-Organizational unit': false, 'Customer-Username': false, 'Customer-Roles': false,
      'Cart-Image': true, 'Cart-Name': true, 'Cart-Variant': true, 'Cart-Discount badge': true, 'Cart-Quantity selector': true, 'Cart-Remove action': true, 'Cart-Prices': true,
      'Delivery-Shipping address': true, 'Delivery-Shipping method': true, 'Delivery-Returns': false,
      'Payment-Credit card': true, 'Payment-Account billing': false, 'Payment-Shop Pay': false, 'Payment-Paypal': false, 'Payment-Pix': true, 'Payment-Google Pay': true, 'Payment-Afterpay': false, 'Payment-Billing address': true, 'Payment-Use shipping address': true,
      'Additional data-Accounting fields-Order level': false, 'Additional data-Accounting fields-Item level': false, 'Additional data-Comments-Order level': false, 'Additional data-Comments-Item level': false,
      'Actions-Place order': true, 'Actions-Request Quote': false, 'Actions-Import file': false, 'Actions-Share order': false, 'Actions-Print order': false, 'Actions-Save order': false,
      'Summary-Taxes': true, 'Summary-Budget': false
    }
  }
};

const App: React.FC = () => {
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isResizing = useRef(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState('Cart');

  const handleOpenDrawer = (title: string = 'Cart') => {
    setDrawerTitle(title);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => setIsDrawerOpen(false);

  const startResizing = useCallback(() => {
    if (isSidebarCollapsed) return;
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [isSidebarCollapsed]);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = Math.max(160, Math.min(480, e.clientX));
    setSidebarWidth(newWidth);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    subtotal: 0,
    shipping: 15.00,
    pickup: 0,
    taxes: 135.80,
    returnsProtection: 0,
    totalItems: 0,
  });

  const [settings, setSettings] = useState<CheckoutSettings>({
    showTaxes: true,
    freeShipping: false,
    storeName: 'Demostore',
    themeColor: '#0366DD',
    layout: 'single-step',
    multiShippingAddress: true,
    multiShippingMethod: true,
    customerStatus: 'logged-out',
    selectedTemplate: 'Individual',
  });

  const [activeFeatures, setActiveFeatures] = useState<ActiveFeatures>(MERCHANT_TEMPLATES['Individual'].features as ActiveFeatures);

  const handleUpdateOrder = (updates: Partial<OrderDetails>) => {
    setOrderDetails(prev => ({ ...prev, ...updates }));
  };

  const handleToggleFeature = (id: string) => {
    setActiveFeatures(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUpdateSettings = (updates: Partial<CheckoutSettings>) => {
    const nextSettings = { ...settings, ...updates };
    
    if (updates.selectedTemplate) {
      const template = MERCHANT_TEMPLATES[updates.selectedTemplate];
      if (template) {
        setSettings({ ...nextSettings, ...template.settings });
        setActiveFeatures(current => {
          // Deep merge or overwrite? Based on prompt, templates define the state.
          // Let's reset all known features to false and then apply TRUEs from template.
          const base: ActiveFeatures = {};
          Object.keys(current).forEach(key => base[key] = false);
          return { ...base, ...template.features } as ActiveFeatures;
        });
        return;
      }
    }
    setSettings(nextSettings);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white selection:bg-blue-100 relative">
      {!isSidebarCollapsed && (
        <>
          <SidebarSettings 
            width={sidebarWidth}
            activeFeatures={activeFeatures} 
            onToggleFeature={handleToggleFeature} 
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onCollapse={() => setIsSidebarCollapsed(true)}
          />
          <div 
            className="w-[1px] cursor-col-resize bg-transparent hover:bg-[#0366DD]/5 active:bg-[#0366DD]/10 transition-colors z-50 h-full relative"
            onMouseDown={startResizing}
          >
            <div className="absolute top-0 bottom-0 -left-1 -right-1 cursor-col-resize" />
          </div>
        </>
      )}

      <div className="flex-1 flex h-full min-w-0 transition-all duration-300">
        <main className="flex-[2] h-full overflow-y-auto bg-white scrollbar-hide">
          <CheckoutForm 
            settings={settings} 
            orderDetails={orderDetails}
            activeFeatures={activeFeatures}
            onUpdateOrder={handleUpdateOrder}
            onToggleFeature={handleToggleFeature}
            isDrawerOpen={isDrawerOpen}
            drawerTitle={drawerTitle}
            onOpenDrawer={handleOpenDrawer}
            onOpenDrawerByName={handleOpenDrawer}
            onCloseDrawer={handleCloseDrawer}
            sidebarWidth={isSidebarCollapsed ? 0 : sidebarWidth}
            isSidebarCollapsed={isSidebarCollapsed}
            onExpandSidebar={() => setIsSidebarCollapsed(false)}
          />
        </main>

        <aside className="flex-1 h-full bg-[#F5F5F5] min-w-[320px]">
          <OrderSummary 
            orderDetails={orderDetails} 
            settings={settings}
            activeFeatures={activeFeatures}
            onOpenDrawer={() => handleOpenDrawer('Cart')}
          />
        </aside>
      </div>
    </div>
  );
};

export default App;
