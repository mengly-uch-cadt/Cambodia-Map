from rest_framework import routers
from django.urls import include, path
from .views import GazetteerViewSet, SearchView


app_name = 'mapapp'
router = routers.DefaultRouter()
router.register(r'gazetteer', GazetteerViewSet)

urlpatterns = [
    path('api/mapapp/', include(router.urls)),
    path('api/search/', SearchView.as_view(), name='search-post'),
]
