from django.contrib import admin
from .models import *


@admin.register(Gazetteer)
class GazetteerAdmin(admin.ModelAdmin):
    actions = None
    list_display = (
        'code',
        'type',
        'name_km',
        'name_en',
        'level',
    )
    search_fields = ('name_km','name_en',)


@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    actions = None
    list_display = (
        'id',
        'name_km',
        'name_en',
    )
    search_fields = ('name_km','name_en',)
