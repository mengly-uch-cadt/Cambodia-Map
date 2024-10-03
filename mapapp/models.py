
from django.db import models
from django.conf import settings



class Level(models.Model):
    id = models.PositiveSmallIntegerField(verbose_name='ID', unique=True, primary_key=True, serialize=False)
    name_km = models.CharField(verbose_name='Level name in Khmer', max_length=32)
    name_en = models.CharField(verbose_name='Level name in Latin', max_length=32, null=True, blank=True)

    def __str__(self):
        return self.name



class Gazetteer(models.Model):
    code = models.CharField(max_length=10, primary_key=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, related_name='children', db_column='parent', null=True, blank=True)
    type = models.CharField(max_length=50)
    level = models.PositiveSmallIntegerField()
    name_km = models.CharField(max_length=100)
    name_en = models.CharField(max_length=100, null=True, blank=True)
    reference = models.CharField(max_length=255, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    # Internal System
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, editable=False, on_delete=models.CASCADE, related_name='+', db_column='created_by')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, editable=False, on_delete=models.CASCADE, related_name='+', db_column='updated_by')
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    def __str__(self):
        return f'{self.type}{self.name_km}'

    @property
    def fullgeo(self):
        code = self.code
        fulladdress = self.type + self.name_km
        while len(code) >= 4:
            code = code[0:-2]
            geo = Gazetteer.objects.get(pk=code)
            fulladdress += ' ' + geo.type + geo.name_km
        return fulladdress
