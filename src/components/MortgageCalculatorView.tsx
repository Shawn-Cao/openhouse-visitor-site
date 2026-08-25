import React, { useState } from 'react';
import { PropertyListing } from '../types';
import { 
  Calculator, 
  DollarSign, 
  Percent, 
  TrendingUp, 
  ShieldCheck, 
  Info, 
  ArrowRight,
  PieChart
} from 'lucide-react';

interface MortgageCalculatorViewProps {
  listing: PropertyListing;
  onBookPrivateShowing: () => void;
}

export const MortgageCalculatorView: React.FC<MortgageCalculatorViewProps> = ({
  listing,
  onBookPrivateShowing,
}) => {
  const [homePrice, setHomePrice] = useState<number>(listing.price);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(6.65);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);
  const [propertyTaxRate, setPropertyTaxRate] = useState<number>(1.25); // California standard ~1.25%
  const [annualInsurance, setAnnualInsurance] = useState<number>(4200);
  const [hoaMonthly] = useState<number>(180);

  // Calculations
  const downPaymentAmount = (homePrice * downPaymentPercent) / 100;
  const loanPrincipal = homePrice - downPaymentAmount;

  // Monthly Principal & Interest: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1]
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = loanTermYears * 12;

  const monthlyPrincipalAndInterest =
    monthlyRate === 0
      ? loanPrincipal / totalMonths
      : (loanPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);

  const monthlyPropertyTax = (homePrice * (propertyTaxRate / 100)) / 12;
  const monthlyInsurance = annualInsurance / 12;
  const totalMonthlyPayment = monthlyPrincipalAndInterest + monthlyPropertyTax + monthlyInsurance + hoaMonthly;

  return (
    <div className="space-y-6 animate-fade-in text-stone-100">
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calculator className="w-5 h-5 text-amber-400" />
            <span className="text-xs uppercase tracking-wider font-bold text-amber-400">
              Personalized Buyer Financing Tool
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Comprehensive Monthly Payment & Ownership Estimator
          </h2>
          <p className="text-xs text-stone-300 max-w-2xl mt-1 leading-relaxed">
            Customize your down payment, interest rate, and term to see your exact estimated monthly investment for {listing.address}.
          </p>
        </div>

        <button
          onClick={onBookPrivateShowing}
          className="shrink-0 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-lg cursor-pointer"
        >
          Discuss Financing with Sarah →
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input Parameters Controls */}
        <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-5">
          <h3 className="font-bold text-sm text-stone-200 border-b border-stone-800 pb-3 flex items-center justify-between">
            <span>Loan Parameters & Financial Assumptions</span>
            <span className="text-[11px] text-amber-400 font-normal">Trousdale Estates Tax Base: 1.25%</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Purchase Price */}
            <div>
              <label className="block text-stone-400 mb-1 font-medium">Home Purchase Price ($)</label>
              <input
                type="number"
                step="10000"
                value={homePrice}
                onChange={(e) => setHomePrice(Number(e.target.value) || 0)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-100 font-mono text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Down Payment % */}
            <div>
              <label className="block text-stone-400 mb-1 font-medium">
                Down Payment: {downPaymentPercent}% (${Math.round(downPaymentAmount).toLocaleString()})
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                  className="flex-1 accent-amber-500 cursor-pointer"
                />
                <span className="font-mono text-amber-400 font-bold w-12 text-right">{downPaymentPercent}%</span>
              </div>
            </div>

            {/* Interest Rate */}
            <div>
              <label className="block text-stone-400 mb-1 font-medium">Interest Rate (Annual %)</label>
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value) || 0)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-100 font-mono text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Loan Term */}
            <div>
              <label className="block text-stone-400 mb-1 font-medium">Loan Term</label>
              <div className="grid grid-cols-2 gap-2">
                {[15, 30].map((years) => (
                  <button
                    key={years}
                    type="button"
                    onClick={() => setLoanTermYears(years)}
                    className={`py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      loanTermYears === years
                        ? 'bg-amber-500 text-stone-950'
                        : 'bg-stone-950 text-stone-400 hover:bg-stone-800'
                    }`}
                  >
                    {years} Years Fixed
                  </button>
                ))}
              </div>
            </div>

            {/* Annual Property Insurance */}
            <div>
              <label className="block text-stone-400 mb-1 font-medium">Est. Annual Homeowner Insurance ($)</label>
              <input
                type="number"
                step="100"
                value={annualInsurance}
                onChange={(e) => setAnnualInsurance(Number(e.target.value) || 0)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-100 font-mono text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* HOA Dues */}
            <div>
              <label className="block text-stone-400 mb-1 font-medium">Monthly HOA Dues (Trousdale)</label>
              <input
                type="text"
                readOnly
                value={`$${hoaMonthly} / month (Security Patrol)`}
                className="w-full bg-stone-950/60 border border-stone-800 rounded-xl px-3 py-2.5 text-stone-400 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Breakdown Output Summary Card */}
        <div className="lg:col-span-5 bg-gradient-to-b from-stone-900 to-stone-950 border border-stone-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-5">
          <div>
            <span className="text-[11px] text-stone-400 uppercase font-semibold block">Total Estimated Monthly Investment</span>
            <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono mt-1">
              ${Math.round(totalMonthlyPayment).toLocaleString()}
              <span className="text-sm font-normal text-stone-400"> / mo</span>
            </div>

            {/* Itemized Stack */}
            <div className="mt-5 space-y-3 pt-4 border-t border-stone-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-300 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  Principal & Interest ({interestRate}%)
                </span>
                <span className="font-mono font-bold text-stone-100">
                  ${Math.round(monthlyPrincipalAndInterest).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-300 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  Property Taxes (1.25% CA rate)
                </span>
                <span className="font-mono font-bold text-stone-100">
                  ${Math.round(monthlyPropertyTax).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-300 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  Homeowners Hazard Insurance
                </span>
                <span className="font-mono font-bold text-stone-100">
                  ${Math.round(monthlyInsurance).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-300 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  Trousdale HOA Security Dues
                </span>
                <span className="font-mono font-bold text-stone-100">
                  ${hoaMonthly}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 text-[11px] text-stone-400 space-y-1">
            <span className="font-bold text-stone-200 block">Financing Insight:</span>
            <p>
              Pre-approved buyers or cash offers receive priority review before the {listing.openHouseEvent.offerDeadline} deadline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
