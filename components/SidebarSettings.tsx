
import React, { useState } from 'react';
import { ActiveFeatures, CheckoutSettings } from '../types';

interface Feature {
  id: string;
  label: string;
  description?: string;
  isSubHeader?: boolean;
}

interface FeatureSection {
  title: string;
  subLabel?: string;
  features: Feature[];
  renderType?: 'toggle' | 'card' | 'radio';
}

const CORE_TEMPLATES = [
  { id: 'Individual', label: 'Individual' },
  { id: 'Organization', label: 'Organization' }
];

const CUSTOMER_TEMPLATES = [
  { id: 'JW Pepper', label: 'JW Pepper' },
  { id: 'USESI', label: 'USESI' },
  { id: 'Helmet House', label: 'Helmet House' },
  { id: 'Pierce', label: 'Pierce' },
  { id: 'SBD', label: 'SBD' },
  { id: 'Electrolux BR', label: 'Electrolux BR' },
  { id: 'Kohler', label: 'Kohler' },
  { id: 'ODP', label: 'ODP' },
  { id: 'CAE', label: 'CAE' },
  { id: 'Amazon Business', label: 'Amazon Business' },
  { id: 'Pague Menos', label: 'Pague Menos' }
];

const GENERAL_SECTIONS: FeatureSection[] = [
  { 
    title: 'Layout', 
    renderType: 'card',
    features: [
      { 
        id: 'single-step', 
        label: 'Single-step', 
        description: 'All sections on one page.' 
      },
      { 
        id: 'multi-step', 
        label: 'Multi-step', 
        description: 'Guided sequential steps.' 
      }
    ] 
  },
  { 
    title: 'Templates', 
    features: [] 
  }
];

const CAPABILITIES_SECTIONS: FeatureSection[] = [
  { 
    title: 'Customer', 
    features: [] 
  },
  { 
    title: 'Cart', 
    subLabel: 'Line items',
    features: [
      { id: 'Image', label: 'Image' },
      { id: 'Name', label: 'Name' },
      { id: 'Variant', label: 'Variant' },
      { id: 'Discount badge', label: 'Discount badge' },
      { id: 'Quantity selector', label: 'Quantity selector' },
      { id: 'Remove action', label: 'Remove action' },
      { id: 'Prices', label: 'Prices' }
    ] 
  },
  { 
    title: 'Delivery', 
    features: [
      { id: 'Shipping address', label: 'Shipping address' },
      { id: 'Shipping method', label: 'Shipping method' },
      { id: 'Returns', label: 'Returns' },
      { id: 'Multi address', label: 'Multiple shipping addresses' },
      { id: 'Multi method', label: 'Multiple shipping methods' }
    ] 
  },
  { 
    title: 'Payment', 
    features: [
      { id: 'Credit card', label: 'Credit card' },
      { id: 'Account billing', label: 'Account billing' },
      { id: 'Shop Pay', label: 'Shop Pay' },
      { id: 'Paypal', label: 'PayPal' },
      { id: 'Pix', label: 'Pix' },
      { id: 'Google Pay', label: 'Google Pay' },
      { id: 'Afterpay', label: 'Afterpay' },
      { id: 'Billing address', label: 'Billing address' },
      { id: 'Use shipping address', label: 'Use shipping address' }
    ] 
  },
  {
    title: 'Additional data',
    features: [
      { id: 'Accounting fields', label: 'Accounting fields', isSubHeader: true },
      { id: 'Accounting fields-Order level', label: 'Order level' },
      { id: 'Accounting fields-Item level', label: 'Item level' },
      { id: 'Comments', label: 'Comments', isSubHeader: true },
      { id: 'Comments-Order level', label: 'Order level' },
      { id: 'Comments-Item level', label: 'Item level' },
    ]
  },
  {
    title: 'Actions',
    features: [
      { id: 'Place order', label: 'Place order' },
      { id: 'Request Quote', label: 'Request quote' },
      { id: 'Import file', label: 'Import file' },
      { id: 'Share order', label: 'Share order' },
      { id: 'Print order', label: 'Print order' },
      { id: 'Save order', label: 'Save order' }
    ]
  },
  {
    title: 'Summary',
    features: [
      { id: 'Taxes', label: 'Taxes' },
      { id: 'Budget', label: 'Budget' }
    ]
  }
];

// Explicitly type LOGGED_OUT_FEATURES as Feature[]
const LOGGED_OUT_FEATURES: Feature[] = [
  { id: 'Sign in button', label: 'Sign in button' },
  { id: 'Email', label: 'Email' },
  { id: 'Full name', label: 'Full name' },
  { id: 'Phone number', label: 'Phone number' },
  { id: 'News checkbox', label: 'News checkbox' }
];

// Explicitly type LOGGED_IN_FEATURES as Feature[]
const LOGGED_IN_FEATURES: Feature[] = [
  { id: 'Contract', label: 'Contract' },
  { id: 'Contract switcher', label: 'Contract switcher' },
  { id: 'User', label: 'User', isSubHeader: true },
  { id: 'Organizational unit', label: 'Organizational unit' },
  { id: 'Username', label: 'Username' },
  { id: 'Email', label: 'Email' },
  { id: 'Full name', label: 'Full name' },
  { id: 'Phone', label: 'Phone' },
  { id: 'Roles', label: 'Roles' }
];

interface SidebarSettingsProps {
  width: number;
  activeFeatures: ActiveFeatures;
  onToggleFeature: (id: string) => void;
  settings: CheckoutSettings;
  onUpdateSettings: (updates: Partial<CheckoutSettings>) => void;
  onCollapse: () => void;
}

const SidebarSettings: React.FC<SidebarSettingsProps> = ({ width, activeFeatures, onToggleFeature, settings, onUpdateSettings, onCollapse }) => {
  const [activeView, setActiveView] = useState<'main' | 'detail' | 'templates'>('main');
  const [activeSection, setActiveSection] = useState<FeatureSection | null>(null);
  
  const themeColor = settings.themeColor;
  const selectedTemplate = settings.selectedTemplate;

  const renderSectionItem = (section: { title: string }, isLast: boolean, customOnClick: () => void) => (
    <div key={section.title} className="w-full">
      <button 
        onClick={customOnClick}
        className="w-full flex items-center justify-between py-3 transition-all focus:outline-none group text-left gap-2"
      >
        <span className="text-[14px] font-medium tracking-[-1%] text-[#B3B3B3] group-hover:text-white transition-colors truncate">
          {section.title}
        </span>
        <span className="material-symbols-outlined text-[18px] text-[#444444] group-hover:text-white transition-colors shrink-0">
          chevron_right
        </span>
      </button>
      {!isLast && <div className="h-[1px] w-full bg-[#1F1F1F]" />}
    </div>
  );

  const getTranslateX = () => {
    switch (activeView) {
      case 'main': return '0%';
      case 'detail': return '-33.33%';
      case 'templates': return '-66.66%';
      default: return '0%';
    }
  };

  return (
    <div 
      style={{ width: `${width}px` }}
      className={`h-full flex flex-col shrink-0 relative p-[16px] font-inter bg-transparent z-20 cursor-default group/sidebar`}
    >
      <div 
        className="h-full bg-black rounded-[20px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden border border-neutral-800/50"
      >
        <div className="p-[20px] pb-[16px] flex items-center justify-between gap-2">
          <h1 className="text-[14px] font-medium tracking-[-1%] text-white truncate">Checkout Settings</h1>
          <button 
            onClick={onCollapse}
            className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/10 text-[#5C5C5C] hover:text-white transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">first_page</span>
          </button>
        </div>
        
        <div className="h-[1px] w-full bg-[#1F1F1F]" />

        <div className="flex-1 relative overflow-hidden">
          <div 
            className="flex h-full w-[300%] transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(${getTranslateX()})` }}
          >
            {/* Main view */}
            <div className="w-1/3 h-full flex flex-col p-[20px]">
              <div className="flex-1 overflow-y-auto scrollbar-hide -mx-5 px-5">
                <div className="flex flex-col">
                  <div className="mb-2">
                    <h3 className="text-[12px] font-medium text-[#5C5C5C] mb-1 truncate">General</h3>
                    <div className="flex flex-col">
                      {renderSectionItem(GENERAL_SECTIONS[0], false, () => {
                        setActiveSection(GENERAL_SECTIONS[0]);
                        setActiveView('detail');
                      })}
                      {renderSectionItem(GENERAL_SECTIONS[1], true, () => setActiveView('templates'))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-[12px] font-medium text-[#5C5C5C] mb-1 truncate">Capabilities</h3>
                    <div className="flex flex-col">
                      {CAPABILITIES_SECTIONS.map((s, idx) => 
                        renderSectionItem(s, idx === CAPABILITIES_SECTIONS.length - 1, () => {
                          setActiveSection(s);
                          setActiveView('detail');
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail view */}
            <div className="w-1/3 h-full flex flex-col p-[20px] bg-black">
              <div className="flex items-center gap-2 mb-6 -ml-1 overflow-hidden">
                <button 
                  onClick={() => setActiveView('main')}
                  className="w-8 h-8 flex items-center justify-center rounded-full transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-white text-[20px]">arrow_back</span>
                </button>
                <h2 className="text-[14px] font-medium tracking-[-1%] text-white truncate">
                  {activeSection?.title}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide -mx-5 px-5">
                {activeSection && (
                  <div className="flex flex-col gap-3 pt-2">
                    {activeSection.subLabel && (
                      <div className="text-[12px] tracking-[-1%] text-[#5C5C5C] font-semibold truncate mb-1">
                        {activeSection.subLabel}
                      </div>
                    )}

                    {activeSection.renderType === 'card' ? (
                      <div className="space-y-2">
                        {activeSection.features.map((feature) => (
                          <LayoutCard 
                            key={feature.id}
                            id={feature.id}
                            title={feature.label}
                            description={feature.description || ''}
                            selected={settings.layout === feature.id}
                            onClick={() => onUpdateSettings({ layout: feature.id as any })}
                            themeColor={themeColor}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {(activeSection.title === 'Customer' 
                          ? (settings.customerStatus === 'logged-out' ? LOGGED_OUT_FEATURES : LOGGED_IN_FEATURES)
                          : activeSection.features
                        ).map((feature) => {
                          if (feature.isSubHeader) {
                            return (
                              <div key={feature.id} className="pt-3 pb-1">
                                <span className="text-[12px] font-medium text-[#5C5C5C] font-inter">
                                  {feature.label}
                                </span>
                              </div>
                            );
                          }

                          const id = `${activeSection.title}-${feature.id}`;
                          
                          if (feature.id === 'Multi address') {
                             return (
                               <SettingToggle 
                                key={id}
                                label={feature.label} 
                                active={settings.multiShippingAddress} 
                                onClick={() => onUpdateSettings({ multiShippingAddress: !settings.multiShippingAddress })}
                                activeColor={themeColor}
                              />
                             )
                          }
                          if (feature.id === 'Multi method') {
                             return (
                               <SettingToggle 
                                key={id}
                                label={feature.label} 
                                active={settings.multiShippingMethod} 
                                onClick={() => onUpdateSettings({ multiShippingMethod: !settings.multiShippingMethod })}
                                activeColor={themeColor}
                              />
                             )
                          }
                          
                          if (feature.id === 'Taxes' && activeSection.title === 'Summary') {
                             return (
                               <SettingToggle 
                                key={id}
                                label={feature.label} 
                                active={settings.showTaxes} 
                                onClick={() => onUpdateSettings({ showTaxes: !settings.showTaxes })}
                                activeColor={themeColor}
                              />
                             )
                          }

                          return (
                            <SettingToggle 
                              key={id}
                              label={feature.label} 
                              active={!!activeFeatures[id]} 
                              onClick={() => onToggleFeature(id)}
                              activeColor={themeColor}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Templates view */}
            <div className="w-1/3 h-full flex flex-col p-[20px] bg-black">
              <div className="flex items-center gap-2 mb-6 -ml-1 overflow-hidden">
                <button 
                  onClick={() => setActiveView('main')}
                  className="w-8 h-8 flex items-center justify-center rounded-full transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-white text-[20px]">arrow_back</span>
                </button>
                <h2 className="text-[14px] font-medium tracking-[-1%] text-white truncate">Templates</h2>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide -mx-5 px-5">
                <div className="flex flex-col gap-2">
                  {CORE_TEMPLATES.map((feature) => (
                    <TemplateOption 
                      key={feature.id}
                      id={feature.id}
                      label={feature.label}
                      isSelected={selectedTemplate === feature.id}
                      onSelect={() => onUpdateSettings({ selectedTemplate: feature.id })}
                      themeColor={themeColor}
                    />
                  ))}
                  
                  <div className="mt-5 mb-1.5">
                    <h3 className="text-[12px] font-medium text-[#5C5C5C] truncate font-inter">Merchants</h3>
                  </div>

                  <div className="flex flex-col gap-2">
                    {CUSTOMER_TEMPLATES.map((feature) => (
                      <TemplateOption 
                        key={feature.id}
                        id={feature.id}
                        label={feature.label}
                        isSelected={selectedTemplate === feature.id}
                        onSelect={() => onUpdateSettings({ selectedTemplate: feature.id })}
                        themeColor={themeColor}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="mt-auto">
          <div className="h-[1px] w-full bg-[#1F1F1F]" />
          <div className="p-[20px]">
            <div className="relative">
              <select 
                className="w-full h-[40px] bg-[#1F1F1F] text-white rounded-full px-[12px] text-[14px] outline-none border border-[#333] cursor-pointer appearance-none transition-all hover:border-[#444] focus:border-[#555]"
                value={settings.customerStatus}
                onChange={(e) => onUpdateSettings({ customerStatus: e.target.value as any })}
              >
                <option value="logged-out">Logged out</option>
                <option value="logged-in">Logged in</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#707070] pointer-events-none text-[18px]">
                expand_more
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const TemplateOption: React.FC<{ 
  id: string; 
  label: string; 
  isSelected: boolean; 
  onSelect: () => void; 
  themeColor: string; 
}> = ({ id, label, isSelected, onSelect, themeColor }) => (
  <button 
    onClick={onSelect}
    className="flex items-center gap-3 w-full group text-left py-0.5 overflow-hidden"
  >
    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0 ${
      isSelected 
        ? 'border-transparent' 
        : 'border-[#444444] group-hover:border-[#666666]'
    }`}
    style={{ backgroundColor: isSelected ? themeColor : 'transparent' }}
    >
      {isSelected && (
        <div className="w-1.5 h-1.5 bg-white rounded-full" />
      )}
    </div>
    <span className={`text-[14px] font-medium transition-colors truncate font-inter ${
      isSelected ? 'text-white' : 'text-[#B3B3B3] group-hover:text-white'
    }`}>
      {label}
    </span>
  </button>
);

const LayoutIllustration: React.FC<{ type: 'single' | 'multi' }> = ({ type }) => {
  return (
    <div className="w-full h-[80px] bg-neutral-900 relative overflow-hidden flex items-center justify-center p-4 shrink-0">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
      {type === 'single' ? (
        <div className="w-24 h-12 bg-gradient-to-b from-neutral-200 to-neutral-400 rounded-sm shadow-inner flex flex-col p-2 gap-1.5 overflow-hidden">
          <div className="h-1 w-full bg-white/40 rounded-full"></div>
          <div className="h-1 w-5/6 bg-white/30 rounded-full"></div>
          <div className="h-1 w-1/2 bg-white/20 rounded-full"></div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-b from-neutral-200 to-neutral-400 rounded-sm shadow-inner"></div>
          <div className="w-4 h-[1px] bg-neutral-600"></div>
          <div className="w-8 h-8 bg-gradient-to-b from-neutral-700 to-neutral-800 rounded-sm border border-neutral-700"></div>
          <div className="w-4 h-[1px] bg-neutral-800"></div>
          <div className="w-8 h-8 bg-gradient-to-b from-neutral-900 to-neutral-900 rounded-sm border border-neutral-800"></div>
        </div>
      )}
    </div>
  );
};

const LayoutCard: React.FC<{ 
  id: string; 
  title: string; 
  description: string; 
  selected: boolean; 
  onClick: () => void;
  themeColor: string;
}> = ({ id, title, description, selected, onClick, themeColor }) => (
  <button 
    onClick={onClick}
    className="w-full flex flex-col items-start rounded-[12px] border transition-all duration-200 text-left group overflow-hidden"
    style={{ 
      borderColor: selected ? themeColor : '#1F1F1F',
      backgroundColor: selected ? '#0A0A0A' : '#050505'
    }}
  >
    <LayoutIllustration type={id === 'single-step' ? 'single' : 'multi'} />
    <div className="p-4 pt-3 flex flex-col w-full overflow-hidden">
      <h4 className="text-[14px] font-semibold text-white mb-0.5 truncate">{title}</h4>
      <p className="text-[12px] text-[#707070] leading-tight truncate">{description}</p>
    </div>
  </button>
);

const SettingToggle: React.FC<{ label: string, active: boolean, onClick: () => void, activeColor: string, disabled?: boolean }> = ({ label, active, onClick, activeColor, disabled }) => (
  <button 
    onClick={(e) => {
      if (disabled) return;
      e.stopPropagation();
      onClick();
    }}
    disabled={disabled}
    className={`flex items-center justify-between w-full group focus:outline-none py-0.5 gap-4 overflow-hidden h-[32px] ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <span className="text-[14px] font-medium tracking-[-1%] text-[#B3B3B3] group-hover:text-white transition-colors truncate text-left">
      {label}
    </span>
    <div 
      style={{ backgroundColor: active ? activeColor : '#3D3D3D' }}
      className="w-[32px] h-[18px] rounded-full relative transition-colors duration-200 ease-in-out shrink-0"
    >
      <div 
        className={`absolute top-[2px] w-[14px] h-[14px] bg-white rounded-full shadow-md transition-all duration-200 ease-in-out ${
          active ? 'left-[16px]' : 'left-[2px]'
        }`} 
      />
    </div>
  </button>
);

export default SidebarSettings;
