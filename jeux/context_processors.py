from django.db import models
from .models import GameResult
from datetime import timedelta
from django.db.models import Max, F, Subquery, OuterRef, IntegerField
from django.db.models.functions import Cast
from .models import GameResult
from django.contrib.auth.models import User

def get_leaderboard():
    leaderboard = {}

    for game_code, game_label in GameResult.GAME_CHOICES:
        # Étape 1 : Récupérer les meilleurs scores par utilisateur pour le jeu donné
        best_scores = (
            GameResult.objects.filter(game=game_code)
            .values('user')
            .annotate(
                best_score=Max('score'),
            )
        )

        # Étape 2 : Pour chaque user+jeu avec le meilleur score, trouver le temps minimal
        results = []
        for item in best_scores:
            user_id = item['user']
            score = item['best_score']
            best_time = (
                GameResult.objects.filter(user_id=user_id, game=game_code, score=score)
                .order_by('time_seconds')
                .first()
            )
            if best_time:
                results.append({
                    'username': best_time.user.username,
                    'score': score,
                    'time_seconds': str(timedelta(seconds=best_time.time_seconds))[2:7],
                })

        # Étape 3 : Trier d'abord par score DESC, puis par temps ASC
        sorted_results = sorted(results, key=lambda x: (-x['score'], x['time_seconds']))
        top_10 = sorted_results[:10]

        leaderboard[game_code] = {
            'label': game_label,
            'ranking': top_10
        }

    return leaderboard


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
    context['leaderboard'] = get_leaderboard()
    return context
