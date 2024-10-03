from rest_framework import serializers
from rest_framework import generics, permissions, serializers

from .models import *



class GazetteerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gazetteer
        fields = (
            'code',
            'type',
            'level',
            'name_km',
            'name_en',
        )
