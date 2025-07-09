from django.db import models
from django.contrib.auth.models import User

class GameStat(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    game_name = models.CharField(max_length=100)
    score = models.IntegerField()
    times_played = models.IntegerField(default=0)
    last_played = models.DateTimeField(auto_now=True)

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    age = models.IntegerField(null=True, blank=True)
    GENDER_CHOICES = [
        ('M', 'Homme / Mann'),
        ('F', 'Femme / Frau'),
        ('O', 'Autre / Anderes'),
    ]
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    COUNTRY_CHOICES = [
        ('FR', 'France / Frankreich'),
        ('DE', 'Allemagne / Deutschland'),
        ('CH', 'Suisse/Schweiz'),
        ('O', 'Autre / Anderes'),        
    ]
    country = models.CharField(max_length=2, choices=COUNTRY_CHOICES)

    def __str__(self):
        return self.user.username

class GameResult(models.Model):
    GAME_CHOICES = [
        ('villes', 'Jeu des villes'),
        ('geophysique', 'Jeu géophysique'),
        ('collectivites', 'Jeu des collectivités'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    game = models.CharField(max_length=20, choices=GAME_CHOICES)
    score = models.IntegerField()
    time_seconds = models.FloatField(help_text="Temps réalisé en secondes")
    date_played = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.game} - {self.score} pts en {self.time_seconds}s"