// models/Stock.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

// (A) Sub-schema for a single dividend record (assuming the DIVIDENDS API returns this format)
const dividendSchema = new Schema({
  ex_dividend_date: String,
  declaration_date: String,
  record_date: String,
  payment_date: String,
  amount: String
}, { _id: false });

// (B) Sub-schema for a single quarterly income statement entry
const incomeSchema = new Schema({
  fiscalDateEnding: String,
  reportedCurrency: String,
  grossProfit: String,
  totalRevenue: String,
  costOfRevenue: String,
  costofGoodsAndServicesSold: String,
  operatingIncome: String,
  sellingGeneralAndAdministrative: String,
  researchAndDevelopment: String,
  operatingExpenses: String,
  investmentIncomeNet: String,
  netInterestIncome: String,
  interestIncome: String,
  interestExpense: String,
  nonInterestIncome: String,
  otherNonOperatingIncome: String,
  depreciation: String,
  depreciationAndAmortization: String,
  incomeBeforeTax: String,
  incomeTaxExpense: String,
  interestAndDebtExpense: String,
  netIncomeFromContinuingOperations: String,
  comprehensiveIncomeNetOfTax: String,
  ebit: String,
  ebitda: String,
  netIncome: String
}, { _id: false });

// (C) Sub-schema for a single quarterly balance sheet entry
const balanceSheetSchema = new Schema({
  fiscalDateEnding: String,
  reportedCurrency: String,
  totalAssets: String,
  totalCurrentAssets: String,
  cashAndCashEquivalentsAtCarryingValue: String,
  cashAndShortTermInvestments: String,
  inventory: String,
  currentNetReceivables: String,
  totalNonCurrentAssets: String,
  propertyPlantEquipment: String,
  accumulatedDepreciationAmortizationPPE: String,
  intangibleAssets: String,
  intangibleAssetsExcludingGoodwill: String,
  goodwill: String,
  investments: String,
  longTermInvestments: String,
  shortTermInvestments: String,
  otherCurrentAssets: String,
  otherNonCurrentAssets: String,
  totalLiabilities: String,
  totalCurrentLiabilities: String,
  currentAccountsPayable: String,
  deferredRevenue: String,
  currentDebt: String,
  shortTermDebt: String,
  totalNonCurrentLiabilities: String,
  capitalLeaseObligations: String,
  longTermDebt: String,
  currentLongTermDebt: String,
  longTermDebtNoncurrent: String,
  shortLongTermDebtTotal: String,
  otherCurrentLiabilities: String,
  otherNonCurrentLiabilities: String,
  totalShareholderEquity: String,
  treasuryStock: String,
  retainedEarnings: String,
  commonStock: String,
  commonStockSharesOutstanding: String
}, { _id: false });

// (D) Sub-schema for a single quarterly cash flow entry
const cashFlowSchema = new Schema({
  fiscalDateEnding: String,
  reportedCurrency: String,
  operatingCashflow: String,
  paymentsForOperatingActivities: String,
  proceedsFromOperatingActivities: String,
  changeInOperatingLiabilities: String,
  changeInOperatingAssets: String,
  depreciationDepletionAndAmortization: String,
  capitalExpenditures: String,
  changeInReceivables: String,
  changeInInventory: String,
  profitLoss: String,
  cashflowFromInvestment: String,
  cashflowFromFinancing: String,
  proceedsFromRepaymentsOfShortTermDebt: String,
  paymentsForRepurchaseOfCommonStock: String,
  paymentsForRepurchaseOfEquity: String,
  paymentsForRepurchaseOfPreferredStock: String,
  dividendPayout: String,
  dividendPayoutCommonStock: String,
  dividendPayoutPreferredStock: String,
  proceedsFromIssuanceOfCommonStock: String,
  proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet: String,
  proceedsFromIssuanceOfPreferredStock: String,
  proceedsFromRepurchaseOfEquity: String,
  proceedsFromSaleOfTreasuryStock: String,
  changeInCashAndCashEquivalents: String,
  changeInExchangeRate: String,
  netIncome: String
}, { _id: false });

// (E) Sub-schema for a single quarterly earnings entry
const earningsSchema = new Schema({
  fiscalDateEnding: String,
  reportedDate: String,
  reportedEPS: String,
  estimatedEPS: String,
  surprise: String,
  surprisePercentage: String,
  reportTime: String
}, { _id: false });

// The main Stock document schema
const stockSchema = new Schema({
  symbol: {
    type: String,
    required: true,
    unique: true
  },
  // Arrays of sub-documents for each quarterly record
  dividends: [dividendSchema],
  incomeStatements: [incomeSchema],
  balanceSheets: [balanceSheetSchema],
  cashFlows: [cashFlowSchema],
  earnings: [earningsSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

// Pre-save hook to update the updatedAt field
stockSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Stock', stockSchema);
