from django.db import models
from .models import GameResult
from datetime import timedelta


def user_profile(request):
    context = {}
    if request.user.is_authenticated:
        user = request.user
        best_results = {}
        for game_code, game_label in GameResult.GAME_CHOICES:
            results = GameResult.objects.filter(user=user, game=game_code)
            if results.exists():
                # Trouver le meilleur score
                best_score_value = results.aggregate(max_score=models.Max('score'))['max_score']
                # Filtrer les parties avec ce score
                best_score_results = results.filter(score=best_score_value)
                # Trouver le temps le plus bas parmi ces parties
                best_time_result = best_score_results.order_by('time_seconds').first()
                best_results[game_code] = {
                    'label': game_label,
                    'best_score': best_score_value,
                    'best_time': str(timedelta(seconds=best_time_result.time_seconds))[-5:] if best_time_result else None,
                }
            else:
                best_results[game_code] = {
                    'label': game_label,
                    'best_score': None,
                    'best_time': None,
                }
        context['user_profile'] = {
            'username': user.username,
            'best_results': best_results
        }
    return context
