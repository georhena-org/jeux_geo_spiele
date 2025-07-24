from django.urls import path
from . import views
from django.contrib.auth import views as auth_views
from jeux.views import SignUpView
from django.contrib.auth.views import LogoutView
from django.urls import path
from .views import CustomLoginView


urlpatterns = [
    path('', views.accueil, name='accueil'),
    path('jeu-villes/', views.jeu_villes, name='jeu_villes'),
    path('jeu-geophysique/', views.jeu_geophysique, name='jeu_geophysique'),
    path('jeu-regions/', views.jeu_regions, name='jeu_regions'),
    path('accounts/login/', CustomLoginView.as_view(), name='login'),
    path('accounts/logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('accounts/signup/', SignUpView.as_view(), name='signup'),
    path('api/save_score/', views.save_game_result, name='save_game_result'),
    path('logout/', LogoutView.as_view(next_page='accueil'), name='logout'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
]
