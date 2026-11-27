
import React from 'react';
import { OrderDetails, CheckoutSettings, ActiveFeatures } from '../types';

interface OrderSummaryProps {
  orderDetails: OrderDetails;
  settings: CheckoutSettings;
  activeFeatures: ActiveFeatures;
  onOpenDrawer: () => void;
}

const CartThumbnail = ({ onOpenDrawer, themeColor, count }: { onOpenDrawer: () => void; themeColor: string; count: number }) => (
  <div className="mb-10 w-full">
    {/* Main Card Container - Material Elevation 1, 12px radius */}
    <div className="bg-white rounded-[12px] border border-neutral-100 shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.14)] flex items-center p-3 w-full transition-shadow hover:shadow-[0_2px_5px_rgba(0,0,0,0.15)]">
      
      {/* Product Image Square - 48x48, Background #F5F5F5, radius 8px, no stroke */}
      <div className="w-[48px] h-[48px] bg-[#F5F5F5] rounded-[8px] flex items-center justify-center overflow-hidden shrink-0">
        <img 
          src="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=100&h=100&auto=format&fit=crop" 
          alt="Product thumbnail" 
          className="w-full h-full object-cover rounded-[8px]"
        />
      </div>

      {/* Text Info - Cart Title & Clickable Item Count */}
      <div className="ml-4 flex flex-col justify-center flex-1">
        <h4 className="text-[14px] font-medium text-black leading-tight font-inter tracking-tight">Cart</h4>
        <button 
          onClick={onOpenDrawer}
          className="text-[14px] font-medium text-neutral-500 hover:text-neutral-900 transition-colors text-left mt-0.5 font-inter"
        >
          {count} items
        </button>
      </div>

      {/* Manage Button - Right aligned */}
      <div className="flex items-center justify-center px-2">
        <button 
          onClick={onOpenDrawer}
          className="text-[14px] font-medium transition-opacity hover:opacity-70 whitespace-nowrap font-inter"
          style={{ color: themeColor }}
        >
          Manage
        </button>
      </div>
    </div>
  </div>
);

const OrderSummary: React.FC<OrderSummaryProps> = ({ orderDetails, settings, activeFeatures, onOpenDrawer }) => {
  const currentShipping = settings.freeShipping ? 0 : orderDetails.shipping;
  const currentTaxes = settings.showTaxes ? orderDetails.taxes : 0;
  
  const total = orderDetails.subtotal + currentShipping + orderDetails.pickup + currentTaxes + (orderDetails.returnsProtection || 0);

  // Style definitions based on request: #5C5C5C for labels, #000 for values
  const labelStyle = "text-[14px] font-medium text-[#5C5C5C] tracking-[-1%] font-inter";
  const blackValueStyle = "text-[14px] font-medium text-[#000000] tracking-[-1%] font-inter";
  const totalTextStyle = "text-[14px] font-semibold text-black tracking-tight font-inter";

  // Budget data
  const budgetAvailable = 500000.00;
  const budgetToBeSpent = total;
  const budgetRemaining = budgetAvailable - budgetToBeSpent;

  return (
    <div className="p-[40px] h-full flex flex-col overflow-y-auto scrollbar-hide">
      {/* Carrinho Thumbnail */}
      <CartThumbnail 
        onOpenDrawer={onOpenDrawer} 
        themeColor={settings.themeColor}
        count={orderDetails.totalItems || 0}
      />

      {/* Budget Section */}
      {activeFeatures['Summary-Budget'] && (
        <div className="mb-8 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
           <div className="flex flex-col gap-1">
             <span className="text-[12px] font-medium text-[#5C5C5C] font-inter">Budget</span>
             <div className="flex items-center gap-1.5">
               <span className="text-[14px] font-semibold text-[#000] font-inter">Marketing-Ads-Q126</span>
               <span className="text-[14px] font-medium text-[#5C5C5C] font-inter">·</span>
               <span className="text-[14px] font-medium text-[#5C5C5C] font-inter">kdavis</span>
             </div>
           </div>
           
           <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className={labelStyle}>Available</span>
                <span className={blackValueStyle}>${budgetAvailable.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={labelStyle}>To be spent</span>
                <span className={blackValueStyle}>${budgetToBeSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={labelStyle}>Remaining</span>
                <span className={`text-[14px] font-medium font-inter ${budgetRemaining < 0 ? 'text-red-600' : 'text-[#000000]'}`}>
                  {budgetRemaining < 0 ? '-' : ''}${Math.abs(budgetRemaining).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
           </div>
        </div>
      )}

      {/* Visual hierarchy separator if Budget is active */}
      {activeFeatures['Summary-Budget'] && <div className="h-[1px] bg-neutral-200 w-full mb-8" />}

      {/* Resumo de valores */}
      <div className="space-y-4">
        <SummaryRow label="Subtotal" value={orderDetails.subtotal} labelStyle={labelStyle} valueStyle={blackValueStyle} />
        <SummaryRow 
          label="Shipping" 
          value={currentShipping} 
          isFree={settings.freeShipping} 
          labelStyle={labelStyle}
          valueStyle={blackValueStyle}
        />
        <SummaryRow label="Pickup" value={orderDetails.pickup} labelStyle={labelStyle} valueStyle={blackValueStyle} />
        
        {orderDetails.returnsProtection > 0 && (
          <SummaryRow label="Returns protection" value={orderDetails.returnsProtection} labelStyle={labelStyle} valueStyle={blackValueStyle} />
        )}

        <SummaryRow 
          label="Taxes" 
          value={currentTaxes} 
          isHidden={!settings.showTaxes}
          labelStyle={labelStyle}
          valueStyle={blackValueStyle}
        />
        
        <div className="pt-4 border-t border-neutral-300 flex justify-between items-center">
          <span className={totalTextStyle}>Total</span>
          <span className={totalTextStyle}>${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  );
};

interface SummaryRowProps {
  label: string;
  value: number;
  isFree?: boolean;
  isHidden?: boolean;
  labelStyle: string;
  valueStyle: string;
}

const SummaryRow: React.FC<SummaryRowProps> = ({ label, value, isFree, isHidden, labelStyle, valueStyle }) => {
  if (isHidden) return null;
  return (
    <div className="flex justify-between items-center">
      <span className={labelStyle}>{label}</span>
      <span className={valueStyle}>
        {isFree ? (
          <span className="text-green-600 uppercase text-[12px] font-medium">Free</span>
        ) : (
          `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
        )}
      </span>
    </div>
  );
};

export default OrderSummary;
