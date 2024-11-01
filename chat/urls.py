from django.urls import path
from . import views

urlpatterns = [
    path('api/room/create/', views.create_room, name='create_room'),
    path('api/room/<str:room_id>/check/', views.check_room, name='check_room'),
]
