export const CASH_ROUNDING_DENOMINATION = 100;

export const roundToCashDenomination = (amount = 0, denomination = CASH_ROUNDING_DENOMINATION) => {
    const rawTotal = Math.max(0, Math.round(Number(amount) || 0));
    const safeDenomination = Math.max(1, Number(denomination) || CASH_ROUNDING_DENOMINATION);
    const grandTotal = Math.round(rawTotal / safeDenomination) * safeDenomination;

    return {
        rawTotal,
        roundingAdjustment: grandTotal - rawTotal,
        grandTotal,
    };
};
