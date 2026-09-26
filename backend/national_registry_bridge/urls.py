from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    RegistryProjectViewSet,
    PositiveNegativeRuleViewSet,
    MonitoringReportSubmissionViewSet,
    CorrespondingAdjustmentViewSet,
    NationalBTRSummaryView
)

router = DefaultRouter()
router.register(r"projects", RegistryProjectViewSet, basename="registry-project")
router.register(r"rules", PositiveNegativeRuleViewSet, basename="positive-negative-rule")
router.register(r"submissions", MonitoringReportSubmissionViewSet, basename="monitoring-submission")
router.register(r"adjustments", CorrespondingAdjustmentViewSet, basename="corresponding-adjustment")

urlpatterns = [
    path("btr-summary/", NationalBTRSummaryView.as_view(), name="national-btr-summary"),
    path("", include(router.urls)),
]
