from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework import status
from rest_framework.response import Response
from django.db.models import CharField
from django.db.models.functions import Length
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView

from .models import *
from .serializers import *
from utils.algorithm import *


CharField.register_lookup(Length, 'length')


class GazetteerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Gazetteer.objects.none()
    serializer_class = GazetteerSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        return get_object_or_404(Gazetteer, pk=self.kwargs['pk'])

    def get_queryset(self):
        parent = self.request.query_params.get('parent', None)
        if parent is not None and len(parent) > 0 and len(parent) % 2 == 0:
            return Gazetteer.objects.filter(parent=parent).order_by('code')
        return Gazetteer.objects.filter(level=0)

    def list(self, request, *args, **kwargs):
        parent = request.query_params.get('parent', None)
        if parent is not None and len(parent) % 2 == 1:
            return Response(data={'message':'not found'}, status=status.HTTP_404_NOT_FOUND)
        return super().list(request, *args, **kwargs)



class SearchView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        data = request.data
        start = data['src_commune']
        target = data['trg_commune']

        filepath = settings.BASE_DIR / 'data/Map/graph.json'
        result = { 'points': [], 'distance': 0, 'straight': 0, }
        if data['algorithm'] == 'bfs':
            result = bfs_search(filepath, start, target)
        elif data['algorithm'] == 'dfs':
            result = dfs_search(filepath, start, target)
        elif data['algorithm'] == 'gbfs':
            result = gbfs_search(filepath, start, target)
        elif data['algorithm'] == 'astar':
            result = astar_search(filepath, start, target)

        return Response(result, status=status.HTTP_200_OK)
