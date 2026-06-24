from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LocationTokenObtainPairView,
    UserViewSet,
    JimboViewSet,
    MtaaViewSet,
    ChurchViewSet,
    EvangelismRecordViewSet,
    OfferingTypeViewSet,
    OfferingViewSet,
    change_password,
    dashboard_stats,
)

router = DefaultRouter()
router.register("users", UserViewSet)
router.register("jimbo", JimboViewSet)
router.register("mitaa", MtaaViewSet)
router.register("churches", ChurchViewSet)
router.register("evangelism", EvangelismRecordViewSet)
router.register("offering-types", OfferingTypeViewSet)
router.register("offerings", OfferingViewSet)

urlpatterns = [
    path("auth/login/", LocationTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("change-password/", change_password),
    path("dashboard-stats/", dashboard_stats),
    path("", include(router.urls)),
]
