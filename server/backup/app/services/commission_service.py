# app/services/commission_service.py
from decimal import Decimal, ROUND_HALF_UP

def compute_commission(gross_amount: Decimal, commission_percent: Decimal):
    """
    commission_percent: e.g. 2.5 means 2.5%
    returns (commission_amount, net_amount)
    """
    if gross_amount is None:
        gross_amount = Decimal("0")
    if commission_percent is None:
        commission_percent = Decimal("0")

    commission = (gross_amount * commission_percent / Decimal("100")).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )
    net = (gross_amount - commission).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return commission, net
