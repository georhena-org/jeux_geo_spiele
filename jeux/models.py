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
    AGE_RANGE_CHOICES = [
        ('18-24', '18-24 ans / Jahre alt'),
        ('25-34', '25-34 ans / Jahre alt'),
        ('35-44', '35-44 ans / Jahre alt'),
        ('45-54', '45-54 ans / Jahre alt'),
        ('55-64', '55-64 ans / Jahre alt'),
        ('64+', '64+ ans / Jahre alt'),
    ]
    age_range = models.CharField(max_length=10, choices=AGE_RANGE_CHOICES, null=True, blank=True)
    GENDER_CHOICES = [
        ('M', 'Homme / Mann'),
        ('F', 'Femme / Frau'),
        ('O', 'Autre / Divers'),
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
        ('villes', 'Villes / Städte'),
        ('geophysique', 'Géophysique / Physische Geographie'),
        ('collectivites', 'Collectivités / Gebietskörperschaften'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    game = models.CharField(max_length=20, choices=GAME_CHOICES)
    score = models.IntegerField()
    tries = models.IntegerField(default=0)
    time_seconds = models.FloatField(help_text="Temps réalisé en secondes")
    date_played = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.game} - {self.score} pts en {self.time_seconds}s"

