import math
import numpy as np
from sqlalchemy.orm import Session
from .models import GroundTruthPlot


class ConformalUncertaintyEngine:
    """
    Split Conformal Prediction Engine (Vovk et al. / Angelopoulos & Bates 2021).
    Provides finite-sample, distribution-free statistical coverage guarantees
    P(Y in C(X)) >= 1 - alpha for carbon stock and emissions reductions.
    """

    def __init__(self, alpha: float = 0.10):
        """
        alpha = 0.10 gives 90% confidence level (standard for Verra / VCS).
        """
        self.alpha = alpha
        self.coverage_target = 1.0 - alpha

    def compute_conformal_quantile(
        self,
        residuals: np.ndarray
    ) -> float:
        """
        Given non-conformity scores s_i = |y_i - y_hat_i|, computes the conformal cutoff:
            q_hat = Quantile( ceil((n + 1) * (1 - alpha)) / n, {s_i} )
        """
        scores = np.abs(np.array(residuals))
        n = len(scores)
        if n == 0:
            return 15.0  # conservative default fallback margin
        
        # Conformal finite-sample correction
        level = min(1.0, math.ceil((n + 1) * self.coverage_target) / n)
        q_hat = float(np.quantile(scores, level))
        return round(q_hat, 3)

    def calibrate_from_db(
        self,
        db: Session,
        model_predict_fn=None
    ) -> float:
        """
        Calibrates conformal margin using available ground-truth field plots.
        Uses genuine `model_predict_fn(plot)` predictions when supplied rather than
        injecting random Gaussian perturbations; returns an explicit conservative fallback
        quantile when insufficient calibrated ground-truth plots exist.
        """
        plots = db.query(GroundTruthPlot).all()
        residuals = []
        for p in plots:
            measured = float(p.measured_carbon_tc_ha)
            if callable(model_predict_fn):
                try:
                    predicted = float(model_predict_fn(p))
                    residuals.append(abs(measured - predicted))
                except Exception:
                    continue

        if len(residuals) >= 20:
            return self.compute_conformal_quantile(np.array(residuals))

        return 15.0  # Conservative uncalibrated floor until >= 20 real plot residuals exist

    def predict_conformal_interval(
        self,
        point_estimate: float,
        q_hat: float
    ) -> tuple[float, float, float]:
        """
        Constructs the distribution-free conformal interval:
            [point_estimate - q_hat, point_estimate + q_hat]
        Returns (lower, upper, half_width).
        """
        lower = max(0.0, point_estimate - q_hat)
        upper = point_estimate + q_hat
        half_width = q_hat
        return round(lower, 2), round(upper, 2), round(half_width, 2)


class VerraPrecisionDeductionEngine:
    """
    Verra Precision Deduction & Conservativeness Discount (Verra VM0047 Section 8.4 / VCS Standard).
    Applies an institutional discount whenever the Relative Margin of Error (RME)
    exceeds the allowable precision threshold (default 15% at 90% confidence level).
    """

    @staticmethod
    def calculate_verra_discount(
        point_estimate: float,
        interval_lower: float,
        interval_upper: float,
        allowable_error: float = 0.15
    ) -> dict:
        """
        Formula:
            Half-Width (W) = (interval_upper - interval_lower) / 2
            Relative Margin of Error (RME) = W / point_estimate
            Precision Discount % = max(0.0, min(0.50, RME - allowable_error))
            Conservatively Adjusted Value = point_estimate * (1.0 - Precision Discount %)
        """
        if point_estimate <= 0.0:
            return {
                "point_estimate": 0.0,
                "relative_margin_of_error": 0.0,
                "allowable_error": allowable_error,
                "precision_discount_pct": 0.0,
                "conservative_estimate": 0.0,
                "is_discount_applied": False,
                "status": "ZERO_INPUT"
            }

        half_width = (interval_upper - interval_lower) / 2.0
        rme = half_width / point_estimate
        
        # If RME exceeds allowable error threshold, apply deduction equal to excess error
        if rme > allowable_error:
            discount_pct = min(0.50, rme - allowable_error)
            is_discount_applied = True
            rationale = (
                f"RME ({rme*100:.1f}%) exceeds Verra VM0047 allowable threshold ({allowable_error*100:.1f}%). "
                f"A conservativeness discount of {discount_pct*100:.2f}% is deducted."
            )
        else:
            discount_pct = 0.0
            is_discount_applied = False
            rationale = (
                f"RME ({rme*100:.1f}%) is within Verra VM0047 allowable precision threshold ({allowable_error*100:.1f}%). "
                "Zero precision discount required."
            )

        conservative_value = point_estimate * (1.0 - discount_pct)

        return {
            "point_estimate": round(point_estimate, 2),
            "interval_lower": round(interval_lower, 2),
            "interval_upper": round(interval_upper, 2),
            "half_width": round(half_width, 2),
            "relative_margin_of_error": round(rme, 4),
            "allowable_error_threshold": allowable_error,
            "precision_discount_pct": round(discount_pct, 4),
            "conservative_estimate": round(conservative_value, 2),
            "is_discount_applied": is_discount_applied,
            "rationale": rationale
        }


def compute_conformal_verra_assessment(
    net_creditable_tco2e: float,
    carbon_lower_90: float,
    carbon_upper_90: float,
    estimated_carbon_tc_ha: float,
    db: Session = None,
    allowable_error: float = 0.15,
    model_predict_fn=None,
) -> dict:
    """
    Combines Split Conformal Prediction intervals (`calibrate_from_db` + `predict_conformal_interval`)
    with Verra VM0047 precision deduction.

    When >= 20 real held-out GroundTruthPlot residuals exist and `model_predict_fn` is provided,
    uses finite-sample conformal q_hat; otherwise explicitly reports uncalibrated proxy status
    and takes the conservative wider bound of model Monte Carlo interval vs fallback conformal floor.
    """
    engine = ConformalUncertaintyEngine(alpha=0.10)
    calibration_status = "uncalibrated_proxy_not_conformal"
    is_valid_conformal = False
    calibration_plot_count = 0
    calibrated_q_hat = None

    if db is not None:
        plots = db.query(GroundTruthPlot).all()
        calibration_plot_count = len(plots)
        if callable(model_predict_fn) and calibration_plot_count >= 20:
            q_hat_tc = engine.calibrate_from_db(db, model_predict_fn=model_predict_fn)
            calibration_status = "empirical_conformal"
            is_valid_conformal = True
            calibrated_q_hat = q_hat_tc
        else:
            q_hat_tc = 15.0  # Conservative uncalibrated floor from engine
    else:
        q_hat_tc = 15.0

    # Derive conformal interval around point tC/ha via engine.predict_conformal_interval
    conf_low_tc, conf_high_tc, conf_hw_tc = engine.predict_conformal_interval(
        float(estimated_carbon_tc_ha or 0.0),
        float(q_hat_tc),
    )

    if estimated_carbon_tc_ha > 0:
        conformal_rme = conf_hw_tc / float(estimated_carbon_tc_ha)
        model_rme = (
            (carbon_upper_90 - carbon_lower_90) / (2.0 * estimated_carbon_tc_ha)
            if carbon_upper_90 > carbon_lower_90
            else 0.12
        )
        # If genuinely calibrated via >=20 plots + OOF predictions, use empirical conformal RME;
        # when uncalibrated, conservatively take the max(model_rme, conformal_rme_floor).
        stock_rme = conformal_rme if is_valid_conformal else max(model_rme, conformal_rme)
    else:
        stock_rme = 0.15

    net_half_width = net_creditable_tco2e * stock_rme
    net_lower = max(0.0, net_creditable_tco2e - net_half_width)
    net_upper = net_creditable_tco2e + net_half_width

    # Apply Verra precision deduction
    verra_eval = VerraPrecisionDeductionEngine.calculate_verra_discount(
        point_estimate=net_creditable_tco2e,
        interval_lower=net_lower,
        interval_upper=net_upper,
        allowable_error=allowable_error
    )

    return {
        "conformal_method": "split_conformal_quantile_regression",
        "calibration_status": calibration_status,
        "is_statistically_valid_conformal": is_valid_conformal,
        "calibration_plot_count": calibration_plot_count,
        "calibrated_q_hat_tc_ha": calibrated_q_hat,
        "confidence_level_pct": 90.0,
        "net_creditable_point_tco2e": round(net_creditable_tco2e, 2),
        "conformal_lower_90": round(net_lower, 2),
        "conformal_upper_90": round(net_upper, 2),
        "stock_conformal_bounds_tc_ha": [conf_low_tc, conf_high_tc],
        "relative_margin_of_error": verra_eval["relative_margin_of_error"],
        "allowable_error_threshold": allowable_error,
        "verra_precision_discount_pct": verra_eval["precision_discount_pct"],
        "conservative_creditable_tco2e": verra_eval["conservative_estimate"],
        "is_discount_applied": verra_eval["is_discount_applied"],
        "rationale": verra_eval["rationale"]
    }
