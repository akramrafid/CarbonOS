# GHG Protocol Standards & Accounting Principles

**Publisher**: World Resources Institute (WRI) & World Business Council for Sustainable Development (WBCSD)  
**Year**: 2004 / 2015  
**Version**: Corporate Standard (revised 2004), Scope 2 Guidance (2015), Scope 3 Standard (2011)  
**License**: Creative Commons Attribution 4.0 International (CC-BY-4.0)  
**URL**: https://ghgprotocol.org/standards  

## 1. Accounting Principles

The GHG Protocol Corporate Accounting and Reporting Standard defines five foundational principles:
- **Relevance**: Ensure the GHG inventory appropriately reflects the GHG emissions of the company and serves the decision-making needs of users.
- **Completeness**: Account for and report on all GHG emission sources and activities within the chosen inventory boundary. Disclose and justify any specific exclusions.
- **Consistency**: Use consistent methodologies to allow for meaningful comparisons of emissions over time. Transparently document any changes to data, inventory boundary, methods, or any other relevant factors.
- **Accuracy**: Ensure that the quantification of GHG emissions is systematically neither over nor under true emissions, and that uncertainties are reduced as far as practicable.
- **Transparency**: Address all relevant issues in a factual and coherent manner, based on a clear audit trail. Disclose any relevant assumptions and make appropriate references to the accounting and calculation methodologies and data sources used.

## 2. Organizational Boundaries: Operational Control vs Equity Share

Companies select either the **Control Approach** or the **Equity Share Approach**:
- **Operational Control**: A company accounts for 100% of the GHG emissions from operations over which it or one of its subsidiaries has the full authority to introduce and implement its operating policies.
- **Financial Control**: A company accounts for 100% of emissions from operations over which it directs financial and operating policies with a view to gaining economic benefits.
- **Equity Share**: A company accounts for GHG emissions according to its share of equity in the operation. The equity share reflects economic interest.

## 3. Scope 2 Dual-Reporting Guidance (2015)

Companies with operations in markets where contractual instruments exist shall report Scope 2 emissions using two distinct methods:
- **Location-Based Method**: Reflects the average emissions intensity of grids on which energy consumption occurs (using mostly grid-average emission factor data).
- **Market-Based Method**: Reflects emissions from electricity that companies have purposefully chosen (contractual instruments, supplier-specific emission rates, energy attribute certificates like I-RECs, and residual mixes).

### Scope 2 Market-Based Hierarchy

When computing market-based Scope 2 emissions, the hierarchy of emission factors is:
1. **Contractual Instruments**: Bundled/unbundled certificates (e.g. I-RECs), Power Purchase Agreements (PPAs) that meet the Scope 2 Quality Criteria.
2. **Supplier-Specific Emission Rates**: Emission rates provided by electricity utility suppliers for specific billing contracts.
3. **Residual Mix**: The grid mix that remains after contractual claims are subtracted.
4. **Grid Average Fallback**: If no contractual instruments, supplier rates, or residual mixes exist, companies shall use the location-based grid average rate as a fallback, explicitly disclosed as `MARKET_FALLBACK_GRID_AVERAGE`.

## 4. Scope 3 Corporate Value Chain Standard

Scope 3 encompasses all other indirect emissions in a company's value chain across 15 categories:
- **Upstream Categories**:
  - Category 1: Purchased Goods and Services
  - Category 2: Capital Goods
  - Category 3: Fuel- and Energy-Related Activities (not included in Scope 1 or Scope 2)
  - Category 4: Upstream Transportation and Distribution
  - Category 5: Waste Generated in Operations
  - Category 6: Business Travel
  - Category 7: Employee Commuting
  - Category 8: Upstream Leased Assets
- **Downstream Categories**:
  - Category 9: Downstream Transportation and Distribution
  - Category 10: Processing of Sold Products
  - Category 11: Use of Sold Products
  - Category 12: End-of-Life Treatment of Sold Products
  - Category 13: Downstream Leased Assets
  - Category 14: Franchises
  - Category 15: Investments

