from django.shortcuts import render
from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse_lazy
from django.views import generic
from .forms import SignUpForm
from .models import Profile 
from django.contrib.auth.models import User

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
import json
from .models import GameResult



class SignUpView(generic.CreateView):
    form_class = SignUpForm
    success_url = reverse_lazy('login')
    template_name = 'registration/signup.html'

    def form_valid(self, form):
        response = super().form_valid(form)
        # Créer le profil lié
        Profile.objects.create(
            user=self.object,
            age=form.cleaned_data.get('age'),
            gender=form.cleaned_data.get('gender'),
            country=form.cleaned_data.get('country'),
        )
        return response    

def accueil(request):
    return render(request, 'jeux/accueil.html')

def jeu_villes(request):
    return render(request, 'jeux/jeu_villes.html')

def jeu_geophysique(request):
    return render(request, 'jeux/jeu_geophysique.html')

def jeu_regions(request):
    return render(request, 'jeux/jeu_regions.html')

def save_score(request):
    if request.method == 'POST':
        game_type = request.POST.get('game')
        score = int(request.POST.get('score'))
        time_seconds = float(request.POST.get('time'))

        GameResult.objects.create(
            user=request.user,
            game=game_type,
            score=score,
            time_seconds=time_seconds
        )

@login_required
@csrf_exempt  # à sécuriser après avec un token CSRF si tu veux
def save_game_result(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        game = data.get('game')
        score = data.get('score')
        tries = data.get('tries')
        time_seconds = data.get('time_seconds')

        GameResult.objects.create(
            user=request.user,
            game=game,
            score=score,
            tries=tries,
            time_seconds=time_seconds,
        )
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error', 'message': 'Invalid method'}, status=400)